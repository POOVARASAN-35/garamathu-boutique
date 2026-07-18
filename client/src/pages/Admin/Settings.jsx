import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchAdminSettings, updateAdminSettings } from '../../store/adminSlice.js';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { settings, adminToken } = useSelector((state) => state.admin);

  // Global settings states
  const [freeDistrictInput, setFreeDistrictInput] = useState('');
  const [shippingFeeInput, setShippingFeeInput] = useState('');

  // Shipping Rules states
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  // Add rule fields
  const [newDistrict, setNewDistrict] = useState('');
  const [newCharge, setNewCharge] = useState('');
  const [newDays, setNewDays] = useState('');
  const [newCourier, setNewCourier] = useState('DTDC');
  const [newStatus, setNewStatus] = useState('Active');
  const [isAddingRule, setIsAddingRule] = useState(false);

  // Edit rule state
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editCharge, setEditCharge] = useState('');
  const [editDays, setEditDays] = useState('');
  const [editCourier, setEditCourier] = useState('DTDC');
  const [editStatus, setEditStatus] = useState('Active');

  useEffect(() => {
    dispatch(fetchAdminSettings());
    fetchShippingRules();
  }, [dispatch]);

  // Sync inputs with settings
  useEffect(() => {
    if (settings) {
      setFreeDistrictInput(settings.shipping?.freeShippingDistrict || '');
      setShippingFeeInput(settings.shipping?.defaultShippingCharge || '120');
    }
  }, [settings]);

  const fetchShippingRules = async () => {
    try {
      setLoadingRules(true);
      const res = await fetch('import.meta.env.VITE_API_URL/api/shipping-rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleSaveShippingSettings = async () => {
    if (!shippingFeeInput) {
      addToast('Please enter a standard shipping charge.', 'warning');
      return;
    }
    const payload = {
      ...settings,
      shipping: {
        freeShippingDistrict: freeDistrictInput,
        defaultShippingCharge: Number(shippingFeeInput),
        estimatedDeliveryDays: settings?.shipping?.estimatedDeliveryDays || "3-5 Days"
      }
    };
    const result = await dispatch(updateAdminSettings(payload));
    if (updateAdminSettings.fulfilled.match(result)) {
      addToast('Global Shipping configuration saved!', 'success');
      dispatch(fetchAdminSettings());
    } else {
      addToast('Failed to save settings.', 'error');
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newDistrict.trim()) {
      addToast('District name is required', 'warning');
      return;
    }
    try {
      const tokenVal = adminToken || localStorage.getItem('admin_token');
      const response = await fetch('import.meta.env.VITE_API_URL/api/shipping-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenVal}`
        },
        body: JSON.stringify({
          district: newDistrict.trim(),
          shippingCharge: Number(newCharge) || 0,
          estimatedDeliveryDays: Number(newDays) || 1,
          courierPartner: newCourier,
          status: newStatus
        })
      });
      const data = await response.json();
      if (response.ok) {
        addToast(`Added rule for ${newDistrict}!`, 'success');
        setNewDistrict('');
        setNewCharge('');
        setNewDays('');
        setIsAddingRule(false);
        fetchShippingRules();
      } else {
        addToast(data.message || 'Failed to create rule.', 'error');
      }
    } catch (err) {
      addToast('Network error adding shipping rule.', 'error');
    }
  };

  const startEditRule = (rule) => {
    setEditingRuleId(rule._id);
    setEditCharge(rule.shippingCharge);
    setEditDays(rule.estimatedDeliveryDays);
    setEditCourier(rule.courierPartner);
    setEditStatus(rule.status);
  };

  const handleSaveEditRule = async (id) => {
    try {
      const tokenVal = adminToken || localStorage.getItem('admin_token');
      const response = await fetch(`import.meta.env.VITE_API_URL/api/shipping-rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenVal}`
        },
        body: JSON.stringify({
          shippingCharge: Number(editCharge),
          estimatedDeliveryDays: Number(editDays),
          courierPartner: editCourier,
          status: editStatus
        })
      });
      if (response.ok) {
        addToast('Shipping rule updated!', 'success');
        setEditingRuleId(null);
        fetchShippingRules();
      } else {
        const data = await response.json();
        addToast(data.message || 'Failed to update rule.', 'error');
      }
    } catch (err) {
      addToast('Network error updating shipping rule.', 'error');
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipping rule?')) return;
    try {
      const tokenVal = adminToken || localStorage.getItem('admin_token');
      const response = await fetch(`import.meta.env.VITE_API_URL/api/shipping-rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenVal}` }
      });
      if (response.ok) {
        addToast('Shipping rule deleted successfully.', 'info');
        fetchShippingRules();
      } else {
        const data = await response.json();
        addToast(data.message || 'Failed to delete rule.', 'error');
      }
    } catch (err) {
      addToast('Network error deleting shipping rule.', 'error');
    }
  };

  return (
    <div className="space-y-10 text-left max-w-5xl mx-auto">
      
      {/* 1. Global Settings Section */}
      <div className="space-y-6">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-emerald-950">Global Shipping Settings</h2>
          <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Configure delivery rates and local free zones</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gold-500/10 space-y-4 bg-white shadow-sm max-w-xl">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase block font-montserrat">Free Shipping District Zone</label>
            <input
              type="text"
              value={freeDistrictInput}
              onChange={(e) => setFreeDistrictInput(e.target.value)}
              className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950"
              placeholder="e.g. Erode"
            />
            <span className="text-[10px] text-gray-400 font-medium block">Purchases mapping to this district will receive ₹0 shipping fee automatically on checkout.</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase block font-montserrat">Standard Shipping Charge (₹)</label>
            <input
              type="number"
              value={shippingFeeInput}
              onChange={(e) => setShippingFeeInput(e.target.value)}
              className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950"
              placeholder="120"
            />
            <span className="text-[10px] text-gray-400 font-medium block">Flat fee applied to delivery addresses outside the designated free district.</span>
          </div>

          <button
            onClick={handleSaveShippingSettings}
            className="w-full bg-[#064e3b] hover:bg-[#d97706] text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-lg transition-colors shadow-sm"
          >
            Save Shipping Configurations
          </button>
        </div>
      </div>

      {/* 2. District-wise Shipping Rules CRUD Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-emerald-950 font-poppins">District Shipping Rules</h2>
            <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Manage delivery charge overrides and estimated shipping days</p>
          </div>
          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="bg-[#064e3b] hover:bg-[#d97706] text-white text-xs font-bold font-montserrat tracking-wider uppercase px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-start shadow-sm"
          >
            {isAddingRule ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAddingRule ? 'Cancel' : 'Add New Rule'}
          </button>
        </div>

        {/* Add Shipping Rule Expandable Box */}
        {isAddingRule && (
          <form onSubmit={handleAddRule} className="bg-white border border-gold-500/10 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl font-poppins text-xs">
            <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">Configure New District Rule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase">District Name</label>
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5"
                  placeholder="e.g. Coimbatore"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase">Shipping Charge (₹)</label>
                <input
                  type="number"
                  value={newCharge}
                  onChange={(e) => setNewCharge(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5"
                  placeholder="e.g. 60"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase">Delivery Days</label>
                <input
                  type="number"
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5"
                  placeholder="e.g. 2"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase">Courier Partner</label>
                <select
                  value={newCourier}
                  onChange={(e) => setNewCourier(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5"
                >
                  <option value="DTDC">DTDC</option>
                  <option value="Professional Courier">Professional Courier</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="Speed Post">Speed Post</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#064e3b] hover:bg-[#d97706] text-white font-montserrat font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm"
            >
              Create Shipping Rule
            </button>
          </form>
        )}

        {/* Shipping Rules Table */}
        <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-xs font-poppins">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-sand-50 text-[10px] font-bold uppercase tracking-widest text-gold-600 border-b border-gold-500/10">
                <tr>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Charge (₹)</th>
                  <th className="px-6 py-4">Delivery Time</th>
                  <th className="px-6 py-4">Courier Partner</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/5 font-medium text-emerald-950">
                {loadingRules ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-semibold uppercase">
                      Loading Shipping Rules...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-semibold uppercase">
                      No custom shipping rules active.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => {
                    const isEditing = editingRuleId === rule._id;
                    return (
                      <tr key={rule._id} className="hover:bg-sand-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{rule.district}</td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editCharge}
                              onChange={(e) => setEditCharge(e.target.value)}
                              className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-20"
                            />
                          ) : (
                            rule.shippingCharge === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${rule.shippingCharge}`
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editDays}
                              onChange={(e) => setEditDays(e.target.value)}
                              className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-20"
                            />
                          ) : (
                            `${rule.estimatedDeliveryDays} Day${rule.estimatedDeliveryDays > 1 ? 's' : ''}`
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editCourier}
                              onChange={(e) => setEditCourier(e.target.value)}
                              className="bg-slate-50 border border-gray-200 rounded px-2 py-1"
                            >
                              <option value="DTDC">DTDC</option>
                              <option value="Professional Courier">Professional Courier</option>
                              <option value="Delhivery">Delhivery</option>
                              <option value="Speed Post">Speed Post</option>
                            </select>
                          ) : (
                            rule.courierPartner
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="bg-slate-50 border border-gray-200 rounded px-2 py-1"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              rule.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {rule.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleSaveEditRule(rule._id)}
                                className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingRuleId(null)}
                                className="p-1.5 bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-500 hover:text-white rounded transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => startEditRule(rule)}
                                className="p-1.5 text-gray-500 bg-slate-50 border border-slate-100 hover:bg-slate-200 hover:text-gray-900 rounded transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule._id)}
                                className="p-1.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
