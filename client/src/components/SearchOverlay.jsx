import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Search, FileQuestion, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function SearchOverlay({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = useSelector((state) => state.products.categories) || [];

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle API search query
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/sarees?q=${encodeURIComponent(query)}&limit=6`);
        const data = await response.json();
        setResults(data.sarees || []);
      } catch (error) {
        console.error('Failed search API:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Filters categories locally
  const matchedCategories = query.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/collection/all?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleSelectSuggestion = (suggestedText) => {
    setQuery(suggestedText);
    navigate(`/collection/all?q=${encodeURIComponent(suggestedText)}`);
    onClose();
  };

  // Default suggestions when search is empty
  const defaultSuggestions = [
    "Kanchi Semi Silk",
    "Silver Zaree",
    "Cotton",
    "Dola Silk",
    "Kubera Soft Silk"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/40 backdrop-blur-xl"
          />

          {/* Search container */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-white shadow-luxury rounded-3xl overflow-hidden border border-gray-100 z-10 flex flex-col max-h-[75vh]"
          >
            
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-6 py-4.5 border-b border-gray-100 flex-shrink-0">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search premium collections, fabrics..."
                className="w-full bg-transparent border-none text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-0 font-medium"
              />
              {loading && (
                <span className="w-4 h-4 border-2 border-sienna-500/30 border-t-sienna-500 rounded-full animate-spin" />
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Results/Suggestion area (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 text-left">
              
              {/* If search query is empty: Show default suggestions */}
              {query.trim().length === 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-sienna-600 uppercase tracking-widest font-poppins">Popular Searches</p>
                  <div className="flex flex-wrap gap-2.5">
                    {defaultSuggestions.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectSuggestion(term)}
                        className="px-4 py-2 bg-gray-50 hover:bg-sienna-50 border border-gray-100 text-xs text-gray-700 hover:text-sienna-600 rounded-full transition-all font-medium flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-sienna-500" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions list & Categories */}
              {query.trim().length > 0 && (matchedCategories.length > 0 || results.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: Categories and shortcuts */}
                  {matchedCategories.length > 0 && (
                    <div className="md:col-span-5 space-y-3 md:border-r border-gray-100 md:pr-4">
                      <p className="text-[10px] font-bold text-sienna-600 uppercase tracking-widest font-poppins">Matched Categories</p>
                      <div className="flex flex-col gap-2">
                        {matchedCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/collection/${encodeURIComponent(cat.name)}`}
                            onClick={onClose}
                            className="text-xs font-semibold text-gray-800 hover:text-sienna-600 flex justify-between items-center py-1.5 px-2 hover:bg-gray-50 rounded-lg transition-all"
                          >
                            {cat.name}
                            <ArrowRight className="w-3.5 h-3.5 text-sienna-500" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Right Column: Matching Products */}
                  <div className={`${matchedCategories.length > 0 ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
                    <p className="text-[10px] font-bold text-sienna-600 uppercase tracking-widest font-poppins">Matched Products</p>
                    <div className="flex flex-col gap-3">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3.5 p-2 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl transition-all group"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-11 h-15 object-cover rounded-lg bg-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-gray-800 group-hover:text-sienna-600 transition-colors truncate">
                              {product.name}
                            </h4>
                            <p className="text-[9px] text-gray-400 font-semibold tracking-wider mt-0.5 uppercase">{product.category}</p>
                            <p className="text-xs font-bold text-gray-900 mt-1">
                              ₹{(product.offerPrice || product.price).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <CornerDownLeft className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No results animation/illustration */}
              {query.trim().length > 0 && results.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                    className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500"
                  >
                    <FileQuestion className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">No Results Found</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                      We couldn't find any products matching "{query}". Try checking your spelling or searching for standard collections.
                    </p>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
