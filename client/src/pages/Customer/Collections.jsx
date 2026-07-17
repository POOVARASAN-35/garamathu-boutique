import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSarees, fetchCategories } from '../../store/productSlice.js';
import { Grid, List, SlidersHorizontal, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/ProductCard.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';

export default function CategoryPage({ onQuickView }) {
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { sarees, categories, pagination, loading } = useSelector((state) => state.products);

  // Filter States
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [isListView, setIsListView] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const query = searchParams.get('q') || '';

  // Get active category information
  const currentCategory = categories.find(
    c => c.name.toLowerCase() === (categoryName || '').toLowerCase()
  );

  // Sync state with URL params
  useEffect(() => {
    setAvailability(searchParams.get('availability') || '');
    setPriceMin(searchParams.get('priceMin') || '');
    setPriceMax(searchParams.get('priceMax') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Fetch categories initially
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Trigger search on changes
  useEffect(() => {
    const filters = {
      sort,
      page,
      limit: 12,
      availability,
      priceMin,
      priceMax,
      q: query
    };

    if (categoryName && categoryName !== 'all') {
      filters.category = categoryName;
    }

    dispatch(fetchSarees(filters));
  }, [categoryName, sort, page, availability, priceMin, priceMax, query, dispatch]);

  const updateUrlParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset page
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const isAllCategoriesView = !categoryName || categoryName === 'all';

  if (isAllCategoriesView) {
    return (
      <div className="bg-slate-50 min-h-screen">
        {/* Page Header (Hero section) */}
        <div className="border-b border-gray-100 bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 font-poppins">
              <Link to="/" className="hover:text-sienna-600 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-sienna-500" />
              <span className="text-gray-900 font-bold">Collections</span>
            </nav>
            <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-gray-900 tracking-wide">
              All Collections
            </h1>
            <p className="text-xs sm:text-sm text-sienna-600 font-semibold tracking-wider font-poppins uppercase">
              Discover Our Premium Saree Collections
            </p>
            {/* Subtle Indigo Accent Line */}
            <div className="w-24 h-0.5 bg-sienna-600 mx-auto mt-4" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Categories Grid (4 columns desktop, 2 columns tablet, 1 column mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Grid Layout (Filters + Main Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-6 rounded-3xl border border-gray-100 text-left shadow-luxury">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <h3 className="font-playfair text-base font-bold text-gray-900">Filters</h3>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-sienna-600 hover:text-sienna-700 uppercase tracking-wider transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Availability Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-poppins">Availability</h4>
              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability === 'in-stock'}
                    onChange={(e) => updateUrlParam('availability', e.target.checked ? 'in-stock' : '')}
                    className="rounded border-gray-300 text-sienna-600 focus:ring-sienna-500 w-4.5 h-4.5"
                  />
                  In Stock
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability === 'out-of-stock'}
                    onChange={(e) => updateUrlParam('availability', e.target.checked ? 'out-of-stock' : '')}
                    className="rounded border-gray-300 text-sienna-600 focus:ring-sienna-500 w-4.5 h-4.5"
                  />
                  Out of Stock
                </label>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-4 pt-4.5 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-poppins">Price Range</h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="100"
                  value={priceMax || 15000}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    updateUrlParam('priceMax', e.target.value);
                  }}
                  className="w-full h-1 bg-sienna-100 rounded-lg appearance-none cursor-pointer accent-sienna-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>₹0</span>
                  <span>Max: ₹{(priceMax || 15000).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    onBlur={() => updateUrlParam('priceMin', priceMin)}
                    placeholder="Min"
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl pl-6 pr-2 py-2 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all"
                  />
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    onBlur={() => updateUrlParam('priceMax', priceMax)}
                    placeholder="Max"
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl pl-6 pr-2 py-2 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none font-semibold transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sort Filter Options */}
            <div className="space-y-3 pt-4.5 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-poppins">Sort By</h4>
              <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-700">
                {[
                  { value: 'newest', label: 'Newest Arrivals' },
                  { value: 'priceAsc', label: 'Price: Low to High' },
                  { value: 'priceDesc', label: 'Price: High to Low' },
                  { value: 'ratings', label: 'Customer Ratings' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateUrlParam('sort', opt.value)}
                    className={`text-left py-0.5 hover:text-sienna-600 transition-colors ${
                      sort === opt.value ? 'text-sienna-600 font-bold' : 'text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Products inside Left Sidebar */}
            {sarees.length > 0 && (
              <div className="space-y-4 pt-4.5 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-poppins">Featured Items</h4>
                <div className="space-y-3.5">
                  {sarees.slice(0, 3).map((item) => (
                    <Link key={item.id} to={`/product/${item.id}`} className="flex gap-3 group">
                      <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h5 className="text-[11px] font-semibold text-gray-800 group-hover:text-sienna-600 transition-colors line-clamp-1 leading-tight">{item.name}</h5>
                        <span className="text-[9px] text-gray-450 font-mono mt-0.5">CODE: {item.code}</span>
                        <span className="text-xs font-bold text-gray-900 mt-1">₹{(item.offerPrice || item.price).toLocaleString('en-IN')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Saree Categories Links */}
            <div className="space-y-3 pt-4.5 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-poppins">Other Collections</h4>
              <div className="flex flex-col gap-2.5 max-h-[30vh] overflow-y-auto">
                <Link
                  to="/collection/all"
                  className={`text-xs font-semibold py-1 transition-colors ${
                    categoryName === 'all' ? 'text-sienna-600 font-bold' : 'text-gray-650 hover:text-sienna-600'
                  }`}
                >
                  All Collections
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/collection/${encodeURIComponent(cat.name)}`}
                    className={`text-xs font-semibold py-0.5 transition-colors ${
                      categoryName === cat.name ? 'text-sienna-600 font-bold' : 'text-gray-650 hover:text-sienna-600'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Grid Content (Right Column) */}
          <main className="lg:col-span-9 space-y-6 text-left">
            
            {/* Header / Breadcrumbs Area inside Right Column */}
            <div className="space-y-3.5 pb-6 border-b border-gray-100">
              <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 font-poppins">
                <Link to="/" className="hover:text-sienna-600 transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 text-sienna-500" />
                <Link to="/collection/all" className="hover:text-sienna-600 transition-colors">Collections</Link>
                {categoryName && categoryName !== 'all' && (
                  <>
                    <ChevronRight className="w-3 h-3 text-sienna-500" />
                    <span className="text-gray-900 font-bold">{categoryName}</span>
                  </>
                )}
              </nav>
              
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 tracking-wide">
                    {categoryName === 'all' || !categoryName ? 'Boutique Catalog' : categoryName}
                  </h1>
                  <p className="text-xs text-gray-450 mt-1 font-poppins">
                    Showing <span className="font-bold text-gray-900">{pagination.total || 0}</span> premium sarees
                  </p>
                </div>
                
                {/* Control elements */}
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="lg:hidden p-2.5 text-gray-800 border border-gray-200 hover:bg-sienna-600 hover:text-white rounded-xl flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  {/* Grid / List view toggle */}
                  <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setIsListView(false)}
                      className={`p-2 transition-all ${!isListView ? 'bg-sienna-600 text-white' : 'bg-transparent text-gray-800 hover:bg-sienna-50'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsListView(true)}
                      className={`p-2 transition-all ${isListView ? 'bg-sienna-600 text-white' : 'bg-transparent text-gray-800 hover:bg-sienna-50'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort selector */}
                  <select
                    value={sort}
                    onChange={(e) => updateUrlParam('sort', e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:border-sienna-500 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="priceAsc">Sort: Price Low to High</option>
                    <option value="priceDesc">Sort: Price High to Low</option>
                    <option value="ratings">Sort: Ratings</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading state skeletons */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-gray-200/50 rounded-[20px]" />
                    <div className="h-4 bg-gray-200/50 rounded w-1/3" />
                    <div className="h-6 bg-gray-200/50 rounded w-2/3" />
                    <div className="h-4 bg-gray-200/50 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : sarees.length === 0 ? (
              /* Empty State block */
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white border border-gray-150 rounded-3xl p-8 shadow-luxury">
                <div className="w-16 h-16 bg-sienna-50 rounded-full flex items-center justify-center text-sienna-600">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-gray-900 uppercase tracking-wide">No Sarees Found</h3>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">
                    We couldn't find any sarees matching these filters. Try modifying your price ranges or selecting another category.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="bg-gray-900 text-white font-poppins font-semibold text-xs tracking-wider uppercase py-3.5 px-6 rounded-xl hover:bg-sienna-600 transition-colors mt-2 shadow-luxury"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Catalog Grid/List presentation */
              <div className={isListView ? "flex flex-col gap-6" : "grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"}>
                {sarees.map((saree) => (
                  isListView ? (
                    // List card layout
                    <div key={saree.id} className="flex flex-col sm:flex-row bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-luxury hover:shadow-luxury-hover transition-all duration-300">
                      <div className="w-full sm:w-48 md:w-60 flex-shrink-0 aspect-[3/4] sm:aspect-auto sm:h-64 relative bg-slate-50">
                        <img src={saree.images[0]} alt={saree.name} className="w-full h-full object-cover" />
                        {saree.stock === 0 && (
                          <span className="absolute top-3 left-3 bg-gray-950 text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded shadow">SOLD OUT</span>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between text-left">
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-bold text-sienna-600 tracking-wider uppercase block font-poppins">{saree.category}</span>
                          <h3 className="font-playfair text-lg font-bold text-gray-900 leading-tight">{saree.name}</h3>
                          <p className="text-[10px] text-gray-400 font-mono tracking-wider">CODE: {saree.code}</p>
                          <p className="text-xs text-gray-500 font-poppins font-light leading-relaxed max-w-md">{saree.description}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-gray-900 font-poppins">₹{(saree.offerPrice || saree.price).toLocaleString('en-IN')}</span>
                            {saree.offerPrice !== undefined && (
                              <span className="text-xs text-gray-400 line-through">₹{saree.price.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                          <button
                            onClick={() => onQuickView(saree)}
                            className="bg-sienna-600 hover:bg-sienna-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-accent-glow"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Grid card
                    <ProductCard key={saree.id} product={saree} onQuickView={onQuickView} />
                  )
                ))}
              </div>
            )}

            {/* 4. Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2.5 pt-12 border-t border-gray-100 mt-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-sienna-600 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-700 transition-all font-poppins"
                >
                  &lt; Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold font-poppins transition-all ${
                      page === i + 1 ? 'bg-sienna-600 text-white shadow-md shadow-accent-glow' : 'border border-gray-200 text-gray-750 hover:bg-sienna-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-sienna-600 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-700 transition-all font-poppins"
                >
                  Next &gt;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
          <div className="relative w-80 max-w-full h-full bg-white p-6 flex flex-col justify-between z-10 shadow-luxury">
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="font-playfair text-lg font-bold text-gray-900">Filters</h3>
                <button onClick={() => setShowMobileSidebar(false)} className="text-gray-400 hover:text-gray-800 font-bold">✕</button>
              </div>

              {/* Availability Filter */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-poppins">Availability</h4>
                <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability === 'in-stock'}
                      onChange={(e) => {
                        updateUrlParam('availability', e.target.checked ? 'in-stock' : '');
                        setShowMobileSidebar(false);
                      }}
                      className="rounded border-gray-300 text-sienna-600 focus:ring-sienna-500 w-4.5 h-4.5"
                    />
                    In Stock
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability === 'out-of-stock'}
                      onChange={(e) => {
                        updateUrlParam('availability', e.target.checked ? 'out-of-stock' : '');
                        setShowMobileSidebar(false);
                      }}
                      className="rounded border-gray-300 text-sienna-600 focus:ring-sienna-500 w-4.5 h-4.5"
                    />
                    Out of Stock
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-poppins">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="100"
                    value={priceMax || 15000}
                    onChange={(e) => {
                      setPriceMax(e.target.value);
                      updateUrlParam('priceMax', e.target.value);
                    }}
                    className="w-full h-1 bg-sienna-100 rounded-lg appearance-none cursor-pointer accent-sienna-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>₹0</span>
                    <span>Max: ₹{(priceMax || 15000).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    onBlur={() => updateUrlParam('priceMin', priceMin)}
                    placeholder="Min"
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl p-2 text-xs text-gray-800 font-semibold"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    onBlur={() => updateUrlParam('priceMax', priceMax)}
                    placeholder="Max"
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl p-2 text-xs text-gray-800 font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileSidebar(false)}
              className="w-full bg-gray-900 hover:bg-sienna-600 text-white font-poppins font-semibold py-3.5 text-xs tracking-wider uppercase rounded-xl transition-colors shadow-luxury"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
