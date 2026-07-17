import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Heart, ShoppingBag, Eye, Percent, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleWishlist, syncWishlistOnServer } from '../store/wishlistSlice.js';
import { addToCart } from '../store/cartSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const wishlist = useSelector((state) => state.wishlist.items);
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  if (!product) return null;

  const isSoldOut = product.stock === 0;
  const currentPrice = product.offerPrice !== undefined ? product.offerPrice : product.price;
  const discountPercent = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product.id));
    dispatch(syncWishlistOnServer([...wishlist].includes(product.id) 
      ? wishlist.filter(id => id !== product.id) 
      : [...wishlist, product.id]
    ));
    if (isWishlisted) {
      addToast('Removed from Wishlist', 'info');
    } else {
      addToast('Added to Wishlist!', 'success');
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) {
      addToast('Product is Out of Stock', 'error');
      return;
    }
    dispatch(addToCart({ product, quantity }));
    addToast('Item added to cart successfully!', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl glassmorphism shadow-luxury rounded-2xl overflow-hidden z-10 border border-gold-500/20 max-h-[90vh] flex flex-col md:flex-row"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-emerald-950/75 hover:text-gold-500 transition-colors p-1 hover:bg-gold-500/10 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Gallery Column */}
            <div className="md:w-1/2 p-6 flex flex-col justify-center bg-sand-50/50">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-sand-50 border border-gold-500/10">
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Discount Badge */}
                {discountPercent > 0 && !isSoldOut && (
                  <span className="absolute top-3 left-3 bg-wine-accent text-white font-montserrat text-[9px] font-semibold tracking-wider px-2.5 py-1 rounded-md shadow-sm uppercase flex items-center gap-0.5">
                    <Percent className="w-3 h-3" />
                    {discountPercent}% Off
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 mt-4 justify-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === activeImageIndex ? 'border-gold-500 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Saree preview" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Information Column */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block mb-1">
                    {product.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-950 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-[10px] font-medium text-gray-400 font-mono tracking-wider mt-1">
                    CODE: {product.code}
                  </p>
                </div>

                {/* Star Ratings */}
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-gold-500 text-sm">★</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-semibold font-montserrat mt-0.5">({product.reviewsCount || 0} reviews)</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-2xl font-bold text-emerald-950 font-montserrat">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {product.offerPrice !== undefined && (
                    <span className="text-sm text-gray-400 line-through font-montserrat">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-emerald-900/80 leading-relaxed font-montserrat">
                  {product.description || 'Traditional boutique weave saree featuring authentic artisan designs and soft draping structures.'}
                </p>

                {/* Saree attributes */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-3 border-y border-gold-500/10">
                  <div>
                    <span className="text-gray-400 block font-normal text-[10px] uppercase">Fabric</span>
                    <span className="text-emerald-950 font-medium">{product.fabric}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-normal text-[10px] uppercase">Primary Color</span>
                    <span className="text-emerald-950 font-medium">{product.color}</span>
                  </div>
                </div>

                {/* Stock Indicator */}
                <div className="flex items-center gap-1.5 text-xs font-semibold pt-1">
                  {isSoldOut ? (
                    <span className="text-wine-accent flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Currently Out of Stock
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      In Stock (Available to Ship)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-4">
                {/* Quantity adjuster */}
                {!isSoldOut && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Qty</span>
                    <div className="flex items-center border border-gold-500/20 bg-sand-50 rounded-lg">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-3.5 py-1.5 text-sm hover:text-gold-500 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-xs font-bold text-emerald-950 font-montserrat">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        className="px-3.5 py-1.5 text-sm hover:text-gold-500 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Add to Cart & Wishlist */}
                <div className="flex gap-3">
                  {!isSoldOut && (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-emerald-900 text-white font-montserrat font-semibold py-3 text-xs tracking-wider uppercase rounded-lg hover:bg-gold-500 transition-colors shadow-luxury flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </button>
                  )}
                  
                  <button
                    onClick={handleToggleWishlist}
                    className={`px-4 rounded-lg flex items-center justify-center border transition-all ${
                      isWishlisted
                        ? 'bg-wine-accent text-white border-wine-accent'
                        : 'bg-white text-emerald-900 border-gold-500/20 hover:bg-gold-500 hover:text-white'
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart className="w-4.5 h-4.5" fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
