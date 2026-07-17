import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Edit, Trash2, Copy, X, Save, Eye, RefreshCw, 
  FileText, DollarSign, Package, Palette, Image, ShieldAlert, 
  ArrowLeft, Tag, Truck, Settings, HelpCircle, Layers, CheckSquare
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';
import { 
  addSareeAdmin, updateSareeAdmin, deleteSareeAdmin, duplicateSareeAdmin 
} from '../../store/adminSlice.js';
import { fetchSarees, fetchCategories } from '../../store/productSlice.js';

export default function Products() {
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const { token } = useSelector((state) => state.auth);
  const { adminToken } = useSelector((state) => state.admin);
  const { sarees, categories } = useSelector((state) => state.products);

  const activeToken = adminToken || token; 

  // Basic Saree Info States
  const [sareeFormOpen, setSareeFormOpen] = useState(false);
  const [editingSareeId, setEditingSareeId] = useState(null);
  const [sareeName, setSareeName] = useState('');
  const [sareePrice, setSareePrice] = useState('');
  const [sareeOfferPrice, setSareeOfferPrice] = useState('');
  const [sareeCategory, setSareeCategory] = useState('');
  const [sareeStock, setSareeStock] = useState('');
  const [sareeColor, setSareeColor] = useState('');
  const [sareeFabric, setSareeFabric] = useState('');
  const [sareeDescription, setSareeDescription] = useState('');
  const [sareeImages, setSareeImages] = useState([]);
  const [sareeStatus, setSareeStatus] = useState('Active');
  const [sareeFeatured, setSareeFeatured] = useState(false);
  const [sareeSeoTitle, setSareeSeoTitle] = useState('');
  const [sareeSeoDescription, setSareeSeoDescription] = useState('');

  // Extended Saree Catalog States
  const [brand, setBrand] = useState('Gramathu Boutique');
  const [shortDescription, setShortDescription] = useState('');
  const [gst, setGst] = useState('0');
  const [hsnCode, setHsnCode] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState('5');
  const [availability, setAvailability] = useState('In Stock');
  const [sareeLength, setSareeLength] = useState('5.5 Meters');
  const [blousePiece, setBlousePiece] = useState('Included');
  const [blouseFabric, setBlouseFabric] = useState('');
  const [borderType, setBorderType] = useState('');
  const [weavingType, setWeavingType] = useState('');
  const [workType, setWorkType] = useState('');
  const [pattern, setPattern] = useState('');
  const [occasion, setOccasion] = useState('');
  const [style, setStyle] = useState('');
  const [weight, setWeight] = useState('450 grams');
  const [washCare, setWashCare] = useState('Dry clean only');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [colorTheme, setColorTheme] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [trending, setTrending] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [comboProduct, setComboProduct] = useState(false);
  const [hotSelling, setHotSelling] = useState(false);
  const [limitedEdition, setLimitedEdition] = useState(false);
  const [todayDeal, setTodayDeal] = useState(false);

  // Shipping
  const [shippingWeight, setShippingWeight] = useState('');
  const [shippingLength, setShippingLength] = useState('');
  const [shippingWidth, setShippingWidth] = useState('');
  const [shippingHeight, setShippingHeight] = useState('');
  const [shippingType, setShippingType] = useState('Free Shipping');
  const [deliveryTime, setDeliveryTime] = useState('');

  // SEO & Display Settings
  const [seoKeywords, setSeoKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [displayOrder, setDisplayOrder] = useState('1');
  const [adminNotes, setAdminNotes] = useState('');

  // Offers/Promos
  const [buy2combo, setBuy2combo] = useState(false);
  const [festivalOffer, setFestivalOffer] = useState(false);
  const [freeGift, setFreeGift] = useState(false);
  const [freeShippingOffer, setFreeShippingOffer] = useState(false);
  const [cashbackOffer, setCashbackOffer] = useState(false);

  // Form Validation & Inline errors
  const [errors, setErrors] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Filter states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sarees and categories initially
  useEffect(() => {
    dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filtered Sarees Selector
  const filteredSarees = useMemo(() => {
    return sarees.filter(saree => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = (saree.productName || saree.name || '').toLowerCase().includes(query);
        const codeMatch = (saree.productCode || '').toLowerCase().includes(query);
        const fabricMatch = (saree.fabric || '').toLowerCase().includes(query);
        const colorMatch = (saree.color || '').toLowerCase().includes(query);
        if (!nameMatch && !codeMatch && !fabricMatch && !colorMatch) {
          return false;
        }
      }

      // Category filter
      if (filterCategory) {
        const catName = saree.category || '';
        const catId = saree.categoryId && typeof saree.categoryId === 'object'
          ? (saree.categoryId._id || saree.categoryId.id)
          : (saree.categoryId || '');
        if (filterCategory !== catId && filterCategory !== catName) {
          return false;
        }
      }

      // Status filter
      if (filterStatus) {
        if ((saree.status || 'Active') !== filterStatus) {
          return false;
        }
      }

      // Price filter
      const price = saree.offerPrice || saree.price || 0;
      if (filterMinPrice && price < Number(filterMinPrice)) {
        return false;
      }
      if (filterMaxPrice && price > Number(filterMaxPrice)) {
        return false;
      }

      return true;
    });
  }, [sarees, searchQuery, filterCategory, filterStatus, filterMinPrice, filterMaxPrice]);

  // Reset page when sarees or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sarees.length, searchQuery, filterCategory, filterStatus, filterMinPrice, filterMaxPrice]);

  // Auto calculate discount percentage
  const discountPercentage = useMemo(() => {
    const orig = Number(sareePrice);
    const offer = Number(sareeOfferPrice);
    if (orig > 0 && offer > 0 && offer < orig) {
      return Math.round(((orig - offer) / orig) * 100);
    }
    return 0;
  }, [sareePrice, sareeOfferPrice]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentSarees = filteredSarees.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredSarees.length / recordsPerPage);

  const validateForm = () => {
    const errs = {};
    if (!sareeName.trim()) errs.productName = 'Product Name is required';
    if (!sareeCategory) errs.categoryId = 'Category is required';
    if (!sareePrice || Number(sareePrice) <= 0) errs.price = 'Original Price must be greater than 0';
    if (sareeOfferPrice && Number(sareeOfferPrice) > Number(sareePrice)) {
      errs.offerPrice = 'Offer Price cannot exceed the Original Price';
    }
    if (!sareeStock || Number(sareeStock) < 0) errs.stock = 'Stock cannot be negative';
    if (sareeImages.filter(Boolean).length === 0) errs.images = 'At least one product image is required';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Saree CRUD handlers
  const openEditSaree = (saree) => {
    setEditingSareeId(saree.id);
    setSareeName(saree.productName || saree.name || '');
    setSareePrice(saree.originalPrice || saree.price || '');
    setSareeOfferPrice(saree.offerPrice || '');
    
    const catId = saree.categoryId && typeof saree.categoryId === 'object'
      ? (saree.categoryId._id || saree.categoryId.id)
      : (saree.categoryId || '');
    setSareeCategory(catId);
    
    setSareeStock(saree.stock);
    setSareeColor(saree.color || '');
    setSareeFabric(saree.fabric || '');
    setSareeDescription(saree.description || '');
    setSareeImages(saree.images || []);
    setSareeStatus(saree.status || 'Active');
    setSareeFeatured(saree.featured || false);
    setSareeSeoTitle(saree.seoTitle || '');
    setSareeSeoDescription(saree.seoDescription || '');

    // Set extended state
    setBrand(saree.brand || 'Gramathu Boutique');
    setShortDescription(saree.shortDescription || '');
    setGst(saree.gst !== undefined ? String(saree.gst) : '0');
    setHsnCode(saree.hsnCode || '');
    setCostPrice(saree.costPrice || '');
    setLowStockAlert(saree.lowStockAlert !== undefined ? String(saree.lowStockAlert) : '5');
    setAvailability(saree.availability || 'In Stock');
    setSareeLength(saree.sareeLength || '5.5 Meters');
    setBlousePiece(saree.blousePiece || 'Included');
    setBlouseFabric(saree.blouseFabric || '');
    setBorderType(saree.borderType || '');
    setWeavingType(saree.weavingType || '');
    setWorkType(saree.workType || '');
    setPattern(saree.pattern || '');
    setOccasion(saree.occasion || '');
    setStyle(saree.style || '');
    setWeight(saree.weight || '450 grams');
    setWashCare(saree.washCare || 'Dry clean only');
    setPrimaryColor(saree.primaryColor || '');
    setSecondaryColor(saree.secondaryColor || '');
    setColorTheme(saree.colorTheme || '');
    setCoverImage(saree.coverImage || '');
    setVideos(saree.videos || []);
    setBestseller(saree.bestseller || false);
    setTrending(saree.trending || false);
    setNewArrival(saree.newArrival || false);
    setComboProduct(saree.comboProduct || false);
    setHotSelling(saree.hotSelling || false);
    setLimitedEdition(saree.limitedEdition || false);
    setTodayDeal(saree.todayDeal || false);

    setShippingWeight(saree.shippingWeight || '');
    setShippingLength(saree.shippingLength || '');
    setShippingWidth(saree.shippingWidth || '');
    setShippingHeight(saree.shippingHeight || '');
    setShippingType(saree.shippingType || 'Free Shipping');
    setDeliveryTime(saree.deliveryTime || '');

    setSeoKeywords(saree.seoKeywords || '');
    setCanonicalUrl(saree.canonicalUrl || '');
    setRelatedProducts(saree.relatedProducts || []);
    setDisplayOrder(saree.displayOrder || '1');
    setAdminNotes(saree.adminNotes || '');

    setSareeFormOpen(true);
  };

  const handleSareeSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please verify all required fields and try again.', 'error');
      return;
    }

    const payload = {
      name: sareeName,
      productName: sareeName,
      price: Number(sareePrice),
      originalPrice: Number(sareePrice),
      offerPrice: sareeOfferPrice ? Number(sareeOfferPrice) : undefined,
      categoryId: sareeCategory,
      category: categories.find(c => c.id === sareeCategory)?.name || '',
      stock: Number(sareeStock),
      color: sareeColor,
      fabric: sareeFabric,
      description: sareeDescription,
      images: sareeImages.filter(Boolean),
      status: sareeStatus,
      featured: sareeFeatured,
      seoTitle: sareeSeoTitle,
      seoDescription: sareeSeoDescription,

      brand,
      shortDescription,
      gst: Number(gst) || 0,
      hsnCode,
      costPrice: costPrice ? Number(costPrice) : undefined,
      lowStockAlert: Number(lowStockAlert) || 5,
      availability,
      sareeLength,
      blousePiece,
      blouseFabric,
      borderType,
      weavingType,
      workType,
      pattern,
      occasion,
      style,
      weight,
      washCare,
      primaryColor,
      secondaryColor,
      colorTheme,
      coverImage: coverImage || sareeImages[0] || '',
      videos: videoUrl ? [...videos, videoUrl] : videos,
      bestseller,
      trending,
      newArrival,
      comboProduct,
      hotSelling,
      limitedEdition,
      todayDeal,
      shippingWeight: shippingWeight ? Number(shippingWeight) : 0,
      shippingLength: shippingLength ? Number(shippingLength) : 0,
      shippingWidth: shippingWidth ? Number(shippingWidth) : 0,
      shippingHeight: shippingHeight ? Number(shippingHeight) : 0,
      shippingType,
      deliveryTime,
      seoKeywords,
      canonicalUrl,
      relatedProducts,
      displayOrder: Number(displayOrder) || 1,
      adminNotes
    };

    if (editingSareeId) {
      const result = await dispatch(updateSareeAdmin({ id: editingSareeId, sareeData: payload }));
      if (updateSareeAdmin.fulfilled.match(result)) {
        addToast('Saree record updated successfully!', 'success');
        dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
        closeSareeForm();
      } else {
        addToast(result.payload || 'Failed to update product details.', 'error');
      }
    } else {
      const result = await dispatch(addSareeAdmin(payload));
      if (addSareeAdmin.fulfilled.match(result)) {
        addToast('Saree record published successfully!', 'success');
        dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
        closeSareeForm();
      } else {
        addToast(result.payload || 'Failed to publish product details.', 'error');
      }
    }
  };

  const handleSaveDraft = async () => {
    // Saves form as Draft status bypassing full publish validation if name is filled
    if (!sareeName.trim()) {
      addToast('Please enter a product name to save as draft.', 'warning');
      return;
    }
    setSareeStatus('Draft');
    addToast('Product status set to Draft. Click submit to save.', 'info');
  };

  const handleDuplicateSaree = async (id) => {
    const result = await dispatch(duplicateSareeAdmin(id));
    if (duplicateSareeAdmin.fulfilled.match(result)) {
      addToast('Product record duplicated successfully!', 'success');
      dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
    } else {
      addToast(result.payload || 'Failed to duplicate product.', 'error');
    }
  };

  const handleDeleteSaree = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      const result = await dispatch(deleteSareeAdmin(id));
      if (deleteSareeAdmin.fulfilled.match(result)) {
        addToast('Product deleted successfully', 'info');
        dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
      }
    }
  };

  const closeSareeForm = () => {
    setSareeFormOpen(false);
    setEditingSareeId(null);
    setSareeName('');
    setSareePrice('');
    setSareeOfferPrice('');
    setSareeCategory('');
    setSareeStock('');
    setSareeColor('');
    setSareeFabric('');
    setSareeDescription('');
    setSareeImages([]);
    setSareeStatus('Active');
    setSareeFeatured(false);
    setSareeSeoTitle('');
    setSareeSeoDescription('');

    setBrand('Gramathu Boutique');
    setShortDescription('');
    setGst('0');
    setHsnCode('');
    setCostPrice('');
    setLowStockAlert('5');
    setAvailability('In Stock');
    setSareeLength('5.5 Meters');
    setBlousePiece('Included');
    setBlouseFabric('');
    setBorderType('');
    setWeavingType('');
    setWorkType('');
    setPattern('');
    setOccasion('');
    setStyle('');
    setWeight('450 grams');
    setWashCare('Dry clean only');
    setPrimaryColor('');
    setSecondaryColor('');
    setColorTheme('');
    setCoverImage('');
    setVideos([]);
    setVideoUrl('');
    setBestseller(false);
    setTrending(false);
    setNewArrival(false);
    setComboProduct(false);
    setHotSelling(false);
    setLimitedEdition(false);
    setTodayDeal(false);
    setShippingWeight('');
    setShippingLength('');
    setShippingWidth('');
    setShippingHeight('');
    setShippingType('Free Shipping');
    setDeliveryTime('');
    setSeoKeywords('');
    setCanonicalUrl('');
    setRelatedProducts([]);
    setDisplayOrder('1');
    setAdminNotes('');
    setErrors({});
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-poppins pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-slate-900">Saree Inventory Hub</h2>
          <p className="text-xs text-indigo-500 font-montserrat tracking-widest mt-1 uppercase font-bold">Ecommerce Catalog Management</p>
        </div>
        {!sareeFormOpen && (
          <button
            onClick={() => setSareeFormOpen(true)}
            className="bg-[#111827] hover:bg-[#6366F1] text-white font-montserrat font-bold text-xs py-3.5 px-6 rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Saree
          </button>
        )}
      </div>

      {/* TWO COLUMN UPLOADER WORKSPACE (Shopify/WooCommerce Seller Style) */}
      {sareeFormOpen ? (
        <div className="animate-fade-in text-left">
          
          {/* Back Navigation Bar */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={closeSareeForm}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </button>
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors"
              >
                Save as Draft
              </button>
              <button 
                type="button" 
                onClick={closeSareeForm}
                className="bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <form onSubmit={handleSareeSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: MAIN CATALOG CONTENT */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* CARD 1: BASIC INFORMATION */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Basic Product Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Product Name *</label>
                    <input 
                      type="text" 
                      value={sareeName} 
                      onChange={(e) => setSareeName(e.target.value)} 
                      placeholder="e.g. Kanchipuram Brocade Royal Silk Saree"
                      className={`w-full bg-slate-50/50 border rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850 ${
                        errors.productName ? 'border-red-400 focus:border-red-500' : 'border-slate-150'
                      }`}
                    />
                    {errors.productName && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.productName}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Brand Name</label>
                    <input 
                      type="text" 
                      value={brand} 
                      onChange={(e) => setBrand(e.target.value)} 
                      placeholder="Gramathu Boutique"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Category *</label>
                    <select 
                      value={sareeCategory} 
                      onChange={(e) => setSareeCategory(e.target.value)} 
                      className={`w-full bg-slate-50/50 border rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850 ${
                        errors.categoryId ? 'border-red-400 focus:border-red-500' : 'border-slate-150'
                      }`}
                    >
                      <option value="">Select Boutique Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.categoryId}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Product Code / SKU *</label>
                    <input 
                      type="text" 
                      value={editingSareeId ? sarees.find(s => s.id === editingSareeId)?.code : ''} 
                      disabled
                      placeholder="Auto-generated on save"
                      className="w-full bg-slate-100 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none font-bold text-gray-450 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Short Description</label>
                  <input 
                    type="text" 
                    value={shortDescription} 
                    onChange={(e) => setShortDescription(e.target.value)} 
                    placeholder="Brief 1-sentence synopsis for lists..."
                    className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-medium text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Full Description Story</label>
                  <textarea 
                    rows={4} 
                    value={sareeDescription} 
                    onChange={(e) => setSareeDescription(e.target.value)} 
                    placeholder="Detail the fabric feel, drape weave patterns, history, and styling rules..."
                    className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-medium text-slate-850"
                    required
                  />
                </div>
              </div>

              {/* CARD 2: PRICING & TAXES */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-500" /> Pricing & Costing Structure
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Original Price (₹) *</label>
                    <input 
                      type="number" 
                      value={sareePrice} 
                      onChange={(e) => setSareePrice(e.target.value)} 
                      placeholder="e.g. 2999"
                      className={`w-full bg-slate-50/50 border rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-bold text-slate-850 ${
                        errors.price ? 'border-red-400 focus:border-red-500' : 'border-slate-150'
                      }`}
                    />
                    {errors.price && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.price}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Offer Price (₹, optional)</label>
                    <input 
                      type="number" 
                      value={sareeOfferPrice} 
                      onChange={(e) => setSareeOfferPrice(e.target.value)} 
                      placeholder="e.g. 2199"
                      className={`w-full bg-slate-50/50 border rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-bold text-slate-850 ${
                        errors.offerPrice ? 'border-red-400 focus:border-red-500' : 'border-slate-150'
                      }`}
                    />
                    {errors.offerPrice && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.offerPrice}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Tax Percentage (GST %)</label>
                    <input 
                      type="number" 
                      value={gst} 
                      onChange={(e) => setGst(e.target.value)} 
                      placeholder="e.g. 5"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-bold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Cost Price (₹, private)</label>
                    <input 
                      type="number" 
                      value={costPrice} 
                      onChange={(e) => setCostPrice(e.target.value)} 
                      placeholder="e.g. 1500"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-bold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">HSN Code</label>
                    <input 
                      type="text" 
                      value={hsnCode} 
                      onChange={(e) => setHsnCode(e.target.value)} 
                      placeholder="e.g. 5007"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  {/* Auto calculated Discount Alert */}
                  {discountPercentage > 0 && (
                    <div className="flex items-center justify-center p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold font-montserrat">
                      ⚡ SAVE {discountPercentage}% OFF (₹{Number(sareePrice) - Number(sareeOfferPrice)} discount)
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: PRODUCT IMAGES & VIDEOS */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Image className="w-4 h-4 text-indigo-500" /> Media & Gallery Management
                </h3>
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Product Gallery (Max 10 Images, Max 5MB each) *</label>
                  <ImageUpload 
                    images={sareeImages}
                    setImages={setSareeImages}
                    productName={sareeName || 'saree'}
                    token={activeToken}
                    addToast={addToast}
                  />
                  {errors.images && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.images}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Video URL (Reels or YouTube link)</label>
                  <input 
                    type="url" 
                    value={videoUrl} 
                    onChange={(e) => setVideoUrl(e.target.value)} 
                    placeholder="https://instagram.com/reel/... or https://youtube.com/..."
                    className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                  />
                </div>
              </div>

              {/* CARD 4: SPECIFICATION DETAILS */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-500" /> Saree Specifications & Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Weave Fabric Type</label>
                    <input 
                      type="text" 
                      value={sareeFabric} 
                      onChange={(e) => setSareeFabric(e.target.value)} 
                      placeholder="e.g. Kanchipuram Semi Silk"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Saree Length</label>
                    <input 
                      type="text" 
                      value={sareeLength} 
                      onChange={(e) => setSareeLength(e.target.value)} 
                      placeholder="5.5 Meters"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Blouse Piece Option</label>
                    <select 
                      value={blousePiece} 
                      onChange={(e) => setBlousePiece(e.target.value)} 
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    >
                      <option value="Included">Included</option>
                      <option value="Not Included">Not Included</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Blouse Fabric</label>
                    <input 
                      type="text" 
                      value={blouseFabric} 
                      onChange={(e) => setBlouseFabric(e.target.value)} 
                      placeholder="e.g. Contrast Jacquard Silk"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Border Type</label>
                    <input 
                      type="text" 
                      value={borderType} 
                      onChange={(e) => setBorderType(e.target.value)} 
                      placeholder="e.g. Temple Zari Border"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Weaving Type</label>
                    <input 
                      type="text" 
                      value={weavingType} 
                      onChange={(e) => setWeavingType(e.target.value)} 
                      placeholder="e.g. Handloom Jacquard"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Occasion</label>
                    <input 
                      type="text" 
                      value={occasion} 
                      onChange={(e) => setOccasion(e.target.value)} 
                      placeholder="e.g. Bridal Festive Wear"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Average Weight</label>
                    <input 
                      type="text" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)} 
                      placeholder="450 grams"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Wash Care</label>
                    <input 
                      type="text" 
                      value={washCare} 
                      onChange={(e) => setWashCare(e.target.value)} 
                      placeholder="Dry clean only"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 5: COLORS INFO */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-500" /> Color Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Primary Color</label>
                    <input 
                      type="text" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      placeholder="e.g. Royal Blue"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Secondary Color</label>
                    <input 
                      type="text" 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)} 
                      placeholder="e.g. Zari Gold"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Color Theme / Match</label>
                    <input 
                      type="text" 
                      value={sareeColor} 
                      onChange={(e) => setSareeColor(e.target.value)} 
                      placeholder="e.g. Royal Blue & Gold Contrast"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 6: SHIPPING PACKS */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-500" /> Shipping & Fulfillment Rules
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Shipping Weight (kg)</label>
                    <input 
                      type="number" 
                      value={shippingWeight} 
                      onChange={(e) => setShippingWeight(e.target.value)} 
                      placeholder="e.g. 0.6"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Length (cm)</label>
                    <input 
                      type="number" 
                      value={shippingLength} 
                      onChange={(e) => setShippingLength(e.target.value)} 
                      placeholder="e.g. 35"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Width (cm)</label>
                    <input 
                      type="number" 
                      value={shippingWidth} 
                      onChange={(e) => setShippingWidth(e.target.value)} 
                      placeholder="e.g. 25"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Height (cm)</label>
                    <input 
                      type="number" 
                      value={shippingHeight} 
                      onChange={(e) => setShippingHeight(e.target.value)} 
                      placeholder="e.g. 5"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Shipping Option</label>
                    <select 
                      value={shippingType} 
                      onChange={(e) => setShippingType(e.target.value)} 
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    >
                      <option value="Free Shipping">Free Shipping</option>
                      <option value="Paid Shipping">Paid Shipping</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Estimated Delivery time</label>
                    <input 
                      type="text" 
                      value={deliveryTime} 
                      onChange={(e) => setDeliveryTime(e.target.value)} 
                      placeholder="e.g. Tomorrow in Erode, 2-4 days other districts"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-850"
                    />
                  </div>
                </div>
              </div>



            </div>

            {/* RIGHT COLUMN: STATUS & BADGES SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* SIDE PANEL 1: STATUS & VISIBILITY */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-1.5 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" /> Status & Visibility
                </h3>

                <div className="space-y-4 font-semibold text-xs text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Product Status</label>
                    <select 
                      value={sareeStatus} 
                      onChange={(e) => setSareeStatus(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none font-bold text-slate-800"
                    >
                      <option value="Active">Active (Visible)</option>
                      <option value="Draft">Draft (Offline Saved)</option>
                      <option value="Hidden">Hidden (Archived)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Stock Availability Status</label>
                    <select 
                      value={availability} 
                      onChange={(e) => setAvailability(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none font-bold text-slate-800"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Pre Booking">Pre Booking</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block">Stock Quantity *</label>
                      <input 
                        type="number" 
                        value={sareeStock} 
                        onChange={(e) => setSareeStock(e.target.value)} 
                        className={`w-full bg-slate-50 border rounded-xl p-3 text-xs focus:outline-none font-bold text-slate-800 ${
                          errors.stock ? 'border-red-400' : 'border-slate-150'
                        }`}
                      />
                      {errors.stock && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.stock}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block">Low Stock Alert</label>
                      <input 
                        type="number" 
                        value={lowStockAlert} 
                        onChange={(e) => setLowStockAlert(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SIDE PANEL 2: PRODUCT LABELS & FLAGS */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-1.5 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" /> Promotion Badges
                </h3>

                <div className="space-y-3 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sareeFeatured} 
                      onChange={(e) => setSareeFeatured(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Featured Product</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={bestseller} 
                      onChange={(e) => setBestseller(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={trending} 
                      onChange={(e) => setTrending(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Trending Weave</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newArrival} 
                      onChange={(e) => setNewArrival(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={comboProduct} 
                      onChange={(e) => setComboProduct(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Combo Product</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hotSelling} 
                      onChange={(e) => setHotSelling(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Hot Selling</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={limitedEdition} 
                      onChange={(e) => setLimitedEdition(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Limited Edition</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={todayDeal} 
                      onChange={(e) => setTodayDeal(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Today's Deal</span>
                  </label>
                </div>
              </div>

              {/* SIDE PANEL 3: OFFERS CHECKLIST */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-1.5 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-500" /> Apply Promo Offers
                </h3>

                <div className="space-y-3 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={buy2combo} 
                      onChange={(e) => setBuy2combo(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Buy 2 @ ₹499 Combo</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={festivalOffer} 
                      onChange={(e) => setFestivalOffer(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Festival Offer Available</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={freeGift} 
                      onChange={(e) => setFreeGift(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Free Gift Included</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={freeShippingOffer} 
                      onChange={(e) => setFreeShippingOffer(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Free Shipping (Any district)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={cashbackOffer} 
                      onChange={(e) => setCashbackOffer(e.target.checked)} 
                      className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                    />
                    <span>Cashback Offer</span>
                  </label>
                </div>
              </div>

              {/* SIDE PANEL 4: DISPLAY ORDER & ADMIN NOTES */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-1.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" /> Catalog Position
                </h3>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block font-montserrat">Display Order Priority</label>
                    <input 
                      type="number" 
                      value={displayOrder} 
                      onChange={(e) => setDisplayOrder(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Private Admin Notes</label>
                    <textarea 
                      rows={3} 
                      value={adminNotes} 
                      onChange={(e) => setAdminNotes(e.target.value)} 
                      placeholder="Notes only visible inside administration team..."
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* STICKY SAVE ACTIONS */}
              <div className="bg-[#111827] text-white rounded-3xl p-6 shadow-md space-y-4 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-montserrat">Submit Changes</span>
                  <p className="text-[11px] text-gray-400 leading-snug">Double check validation errors before publishing to the active catalog.</p>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-[#6366F1] hover:bg-[#8B5CF6] text-white font-montserrat font-bold py-3.5 text-xs tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> {editingSareeId ? 'Update Product Weave' : 'Publish Product Record'}
                </button>
              </div>

            </div>

          </form>

        </div>
      ) : (
        
        // STANDARD TABLE CATALOG VIEW
        <div className="animate-fade-in space-y-6">
          
          {/* FILTERING & SEARCH PANEL */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Filter & Search Catalog
                </h3>
                <p className="text-[11px] text-gray-400">Refine the inventory list by search terms, category, status, and price range.</p>
              </div>
              {(searchQuery || filterCategory || filterStatus || filterMinPrice || filterMaxPrice) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('');
                    setFilterStatus('');
                    setFilterMinPrice('');
                    setFilterMaxPrice('');
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Search Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Search product</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, SKU, fabric..."
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-805 placeholder-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-805"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-805"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </div>

              {/* Price Min */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Min Price (₹)</label>
                <input
                  type="number"
                  value={filterMinPrice}
                  onChange={(e) => setFilterMinPrice(e.target.value)}
                  placeholder="Min price"
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-805 placeholder-gray-400"
                />
              </div>

              {/* Price Max */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Max Price (₹)</label>
                <input
                  type="number"
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value)}
                  placeholder="Max price"
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-slate-805 placeholder-gray-400"
                />
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-[#6366F1] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4">Saree Weave</th>
                    <th className="px-5 py-4">Code / SKU</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Pricing</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-800">
                  {currentSarees.length > 0 ? (
                    currentSarees.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <img src={s.images[0]} alt={s.name} className="w-8 h-10 object-cover rounded bg-slate-50 border border-slate-100" />
                          <div className="min-w-0 text-left">
                            <p className="font-semibold text-[#111827] truncate max-w-[220px]">{s.name}</p>
                            <span className="text-[9px] text-gray-400 block font-semibold">{s.fabric} | {s.color}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          {s.productCode}
                          <br/>
                          <span className="text-[9px] text-gray-400">{s.sku || 'GB-SAREE-TEMP'}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{s.category}</td>
                        <td className="px-5 py-3.5 font-montserrat">
                          ₹{(s.offerPrice || s.price).toLocaleString('en-IN')}
                          {s.offerPrice && <span className="text-[9px] text-gray-400 line-through block">₹{s.price}</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.stock === 0 ? 'bg-red-100 text-red-700' : s.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {s.stock} items left
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-700' : 
                            s.status === 'Draft' ? 'bg-amber-500/10 text-amber-700' : 'bg-red-500/10 text-red-700'
                          }`}>
                            {s.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex gap-2">
                            <button onClick={() => openEditSaree(s)} className="p-1.5 bg-slate-50 hover:bg-[#6366F1] hover:text-white rounded-lg transition-all text-gray-500" title="Edit Saree"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDuplicateSaree(s.id)} className="p-1.5 bg-slate-50 hover:bg-[#6366F1] hover:text-white rounded-lg transition-all text-gray-500" title="Duplicate Record"><Copy className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteSaree(s.id)} className="p-1.5 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-all text-red-500" title="Delete Record"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-400 font-semibold">
                        No product matches the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-xs font-semibold text-slate-800 font-poppins">
                <span className="text-gray-400">
                  Showing {filteredSarees.length === 0 ? 0 : indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredSarees.length)} of {filteredSarees.length} sarees
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-[#6366F1] hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-800"
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
                          ? 'bg-[#6366F1] border-[#6366F1] text-white shadow-sm'
                          : 'border-slate-250 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-[#6366F1] hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
