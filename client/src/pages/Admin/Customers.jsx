import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { fetchAdminCustomers } from '../../store/adminSlice.js';

export default function Customers() {
  const dispatch = useDispatch();

  const { customers } = useSelector((state) => state.admin);

  const [viewingCustomer, setViewingCustomer] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminCustomers());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="font-playfair text-2xl font-bold text-emerald-950">Boutique Shoppers</h2>
        <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Track registrant histories and addresses</p>
      </div>

      {/* Customers list table */}
      <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-left">
        <table className="w-full text-xs">
          <thead className="bg-sand-50 text-[10px] font-bold uppercase tracking-widest text-gold-600 border-b border-gold-500/10">
            <tr>
              <th className="px-5 py-4">Customer Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Wishlist Items Count</th>
              <th className="px-5 py-4 text-center">Addresses details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-500/5 font-medium text-emerald-950">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-sand-50/50">
                <td className="px-5 py-3.5 font-semibold">{c.firstName} {c.lastName}</td>
                <td className="px-5 py-3.5 text-gray-500">{c.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${c.role === 'admin' ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {c.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  ❤ {c.wishlist?.length || 0} products favorited
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button
                    onClick={() => setViewingCustomer(c)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gold-500 hover:text-white rounded text-[10px] font-bold transition-all"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer detail view modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingCustomer(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-luxury overflow-hidden border border-gold-500/20 max-h-[80vh] flex flex-col z-10 text-left">
            <div className="bg-emerald-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-playfair text-lg font-bold">Customer Profile Details</h3>
              <button onClick={() => setViewingCustomer(null)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 text-xs font-montserrat">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gold-500/10">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Shopper Name</span>
                  <span className="text-emerald-950 font-bold text-sm">{viewingCustomer.firstName} {viewingCustomer.lastName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Email Address</span>
                  <span className="text-emerald-950 font-semibold">{viewingCustomer.email}</span>
                </div>
              </div>

              {/* Address lists */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Saved Delivery Addresses</p>
                {(!viewingCustomer.addresses || viewingCustomer.addresses.length === 0) ? (
                  <p className="text-gray-400">No addresses registered.</p>
                ) : (
                  viewingCustomer.addresses.map((addr) => (
                    <div key={addr.id} className="p-3 bg-sand-50 border border-gold-500/10 rounded-xl space-y-1">
                      <p className="font-bold text-emerald-950">{viewingCustomer.firstName} {viewingCustomer.lastName} {addr.isDefault && <span className="text-[9px] bg-gold-500 text-white font-bold px-1.5 py-0.5 rounded ml-2 uppercase">Default</span>}</p>
                      <p className="text-emerald-900/80">{addr.street}</p>
                      <p className="text-emerald-900/80">{addr.district}, Tamil Nadu - {addr.pincode}</p>
                      <p className="font-mono text-emerald-950 pt-1 font-semibold">PH: {addr.phone}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
