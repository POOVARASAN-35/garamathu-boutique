import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';
import { 
  addCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin 
} from '../../store/adminSlice.js';
import { fetchCategories } from '../../store/productSlice.js';

export default function Categories() {
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const { token } = useSelector((state) => state.auth);
  const { adminToken } = useSelector((state) => state.admin);
  const activeToken = adminToken || token;

  const { categories } = useSelector((state) => state.products);

  // Category CRUD states
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [categoryImages, setCategoryImages] = useState([]);
  const [catOrder, setCatOrder] = useState('1');
  const [catStatus, setCatStatus] = useState('Active');

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Reset page when count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentCategories = categories.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(categories.length / recordsPerPage);

  // Category controllers
  const openEditCat = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    const imgs = cat.categoryImages && cat.categoryImages.length > 0
      ? cat.categoryImages
      : [cat.image1 || cat.categoryImage, cat.image2].filter(Boolean);
    setCategoryImages(imgs);
    setCatOrder(String(cat.displayOrder));
    setCatStatus(cat.status ? 'Active' : 'Inactive');
    setCatFormOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (categoryImages.length === 0) {
      addToast('❌ Please upload at least one category image.', 'error');
      return;
    }

    const payload = {
      categoryName: catName,
      categoryImages,
      coverImage: categoryImages[0] || '',
      displayOrder: Number(catOrder),
      status: catStatus === 'Active'
    };

    if (editingCatId) {
      const result = await dispatch(updateCategoryAdmin({ id: editingCatId, catData: payload }));
      if (updateCategoryAdmin.fulfilled.match(result)) {
        addToast('Category updated!', 'success');
        dispatch(fetchCategories());
        closeCatForm();
      }
    } else {
      const result = await dispatch(addCategoryAdmin(payload));
      if (addCategoryAdmin.fulfilled.match(result)) {
        addToast('Category created!', 'success');
        dispatch(fetchCategories());
        closeCatForm();
      }
    }
  };

  const handleDeleteCat = async (id) => {
    if (window.confirm('Delete this category?')) {
      const result = await dispatch(deleteCategoryAdmin(id));
      if (deleteCategoryAdmin.fulfilled.match(result)) {
        addToast('Category removed', 'info');
        dispatch(fetchCategories());
      }
    }
  };

  const closeCatForm = () => {
    setCatFormOpen(false);
    setEditingCatId(null);
    setCatName('');
    setCategoryImages([]);
    setCatOrder('1');
    setCatStatus('Active');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-emerald-950">Shop Categories</h2>
          <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Categories catalog listing</p>
        </div>
        <button
          onClick={() => setCatFormOpen(true)}
          className="bg-emerald-900 hover:bg-gold-500 text-white font-montserrat font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Category Form modal */}
      {catFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCatForm} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-luxury overflow-hidden border border-gold-500/20 max-h-[90vh] flex flex-col z-10 text-left">
            <div className="bg-emerald-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-playfair text-lg font-bold">{editingCatId ? 'Edit Category' : 'Create New Saree Category'}</h3>
              <button onClick={closeCatForm} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCatSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Category Name</label>
                  <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950" required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Category Images (Max 4, Drag & Drop)</label>
                  <ImageUpload
                    images={categoryImages}
                    setImages={setCategoryImages}
                    token={activeToken}
                    addToast={addToast}
                    maxImages={4}
                    uploadType="category"
                    entityName={catName}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Display Order</label>
                    <input type="number" value={catOrder} onChange={(e) => setCatOrder(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Status</label>
                    <select value={catStatus} onChange={(e) => setCatStatus(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-900 text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-lg hover:bg-gold-500 transition-colors">
                {editingCatId ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Categories list table */}
      <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-left">
        <table className="w-full text-xs">
          <thead className="bg-sand-50 text-[10px] font-bold uppercase tracking-widest text-gold-600 border-b border-gold-500/10">
            <tr>
              <th className="px-5 py-4">Display Order</th>
              <th className="px-5 py-4">Category Name</th>
              <th className="px-5 py-4">Active Sarees Count</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-500/5 font-medium text-emerald-950">
            {currentCategories.map((c) => (
              <tr key={c.id} className="hover:bg-sand-50/50">
                <td className="px-5 py-3.5 font-bold text-gold-600 font-montserrat">{c.displayOrder}</td>
                <td className="px-5 py-3.5 flex items-center gap-3">
                  <img src={c.image1} alt={c.name} className="w-8 h-8 object-cover rounded border border-gold-500/5 bg-sand-50" />
                  <span className="font-semibold">{c.name}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{c.productCount || 0} Products</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${c.status ? 'bg-emerald-500/10 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="inline-flex gap-2">
                    <button onClick={() => openEditCat(c)} className="p-1.5 bg-gray-100 hover:bg-gold-500 hover:text-white rounded transition-colors text-gray-500" title="Edit Category"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteCat(c.id)} className="p-1.5 bg-red-50 hover:bg-wine-accent hover:text-white rounded transition-colors text-wine-accent" title="Delete Category"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 bg-sand-50 border-t border-gold-500/10 text-xs font-semibold text-emerald-950 font-poppins">
            <span className="text-gray-400">
              Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, categories.length)} of {categories.length} categories
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 border border-gold-500/25 rounded-lg hover:bg-emerald-900 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-emerald-950"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    currentPage === i + 1
                      ? 'bg-emerald-900 border-emerald-900 text-white shadow-sm'
                      : 'border-gold-500/25 hover:bg-gold-500/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 border border-gold-500/25 rounded-lg hover:bg-emerald-900 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-emerald-950"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
