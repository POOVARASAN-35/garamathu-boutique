import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Eye, Percent, AlertCircle } from 'lucide-react';
import { toggleWishlist, syncWishlistOnServer } from '../store/wishlistSlice.js';
import { addToCart } from '../store/cartSlice.js';
import { useToast } from '../context/ToastContext.jsx';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onQuickView }) {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const wishlist = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlist.includes(product.id);

  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const currentPrice = product.offerPrice !== undefined ? product.offerPrice : product.price;
  const discountPercent = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) {
      addToast('Out of Stock!', 'error');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    addToast('Product Added Successfully to Cart!', 'success');
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-luxury hover:shadow-luxury-hover transition-all duration-500 h-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Gallery area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50 cursor-pointer">
        <Link to={`/product/${product.id}`}>
          {/* Main Saree Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </Link>

        {/* Dynamic Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSoldOut ? (
            <span className="bg-gray-900 text-white font-poppins text-[9px] font-semibold tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-white/10 uppercase flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          ) : (
            <>
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white font-poppins text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-white/10 uppercase flex items-center gap-0.5">
                  <Percent className="w-3 h-3" />
                  {discountPercent}% Off
                </span>
              )}
              {isLowStock && (
                <span className="bg-amber-500 text-gray-900 font-poppins text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-white/10 uppercase">
                  Only {product.stock} left
                </span>
              )}
            </>
          )}
        </div>

        {/* Sliding Quick Actions Panel (Framer Motion sliding upward) */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className="flex items-center gap-2 pointer-events-auto"
          >
            {/* Wishlist toggle */}
            <button
              onClick={handleToggleWishlist}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border ${
                isWishlisted
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-red-500 hover:text-white border-white/10'
              }`}
              title="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            {/* Quick View trigger */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-sienna-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-gray-100"
              title="Quick View"
            >
              <Eye className="w-4.5 h-4.5" />
            </button>

            {/* Add to Cart */}
            {!isSoldOut && (
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 bg-sienna-600 hover:bg-sienna-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-white/10"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-sienna-600 uppercase tracking-widest block mb-1 font-poppins">
            {product.category}
          </span>
          <Link to={`/product/${product.id}`} className="group/title">
            <h4 className="text-sm font-semibold text-gray-800 hover:text-sienna-600 transition-colors line-clamp-2 leading-relaxed font-poppins">
              {product.name}
            </h4>
          </Link>
          <span className="text-[10px] font-medium text-gray-400 font-mono tracking-wider block mt-1">
            CODE: {product.code}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-4 pt-3.5 border-t border-gray-100">
          <span className="text-base font-bold text-gray-900 font-poppins">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {product.offerPrice !== undefined && (
            <span className="text-xs text-gray-400 line-through font-poppins">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
