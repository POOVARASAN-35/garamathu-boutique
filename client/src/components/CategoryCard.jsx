import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/collection/${encodeURIComponent(category.name)}`}
      className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-hover transition-all duration-500 flex flex-col justify-end border border-gray-100 transform hover:-translate-y-2 bg-white"
    >
      {/* Premium Collection Image */}
      <img
        src={category.image1}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Dark overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent z-10 transition-all duration-500 group-hover:from-gray-950/90 group-hover:via-gray-950/30" />

      {/* Bottom Glass Overlay Container */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-2xl text-left transition-all duration-500 group-hover:bg-white/20">
          <h4 className="font-playfair text-base sm:text-lg font-bold text-white leading-tight">
            {category.name}
          </h4>
          <span className="text-[10px] text-sienna-300 font-semibold tracking-wider font-poppins block mt-1 uppercase">
            {category.productCount || 0} Products
          </span>
          
          {/* Smooth Fade-in Button */}
          <div className="max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
            <button className="mt-3 w-full bg-sienna-600 hover:bg-sienna-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-accent-glow">
              View Collection
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
