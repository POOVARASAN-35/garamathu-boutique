import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Youtube, Send, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export default function Footer() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    addToast('Thank you for subscribing to Gramathu Boutique newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-gray-950 border-t border-gray-900 text-white font-poppins relative">
      
      {/* 3 Core Trust Badges */}
      <div className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-3 p-4">
            <ShieldCheck className="w-9 h-9 text-sienna-400" />
            <h4 className="font-playfair text-sm font-semibold tracking-wider text-white uppercase">100% Quality Weaves</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">Directly sourced premium craftsmanship sarees with standard certification.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 border-y md:border-y-0 md:border-x border-gray-900">
            <Truck className="w-9 h-9 text-sienna-400" />
            <h4 className="font-playfair text-sm font-semibold tracking-wider text-white uppercase">Erode Free Delivery</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">Zero shipping fees within Erode district limits on all orders.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4">
            <RefreshCw className="w-9 h-9 text-sienna-400" />
            <h4 className="font-playfair text-sm font-semibold tracking-wider text-white uppercase">Easy Return Exchange</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">Friendly boutique replacement support and hassle-free returns.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Info Column */}
        <div className="md:col-span-4 space-y-5 text-left">
          <Link to="/" className="flex flex-col">
            <span className="font-playfair text-2xl font-bold tracking-[0.2em] text-white uppercase">
              Gramathu
            </span>
            <span className="font-poppins text-[10px] tracking-[0.4em] text-sienna-400 font-semibold uppercase mt-0.5">
              Boutique
            </span>
          </Link>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            Traditional Elegance with Modern Style. Discover a curated universe of authentic sarees woven with delicate silver and gold zari designs.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="https://www.instagram.com/gramathu_design?igsh=eWRmbWp3MXdpbjl6" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-900 hover:bg-sienna-600 hover:text-white rounded-xl transition-all duration-300 border border-gray-800" aria-label="Instagram">
              <Instagram className="w-4.5 h-4.5" />
            </a>
            <a href="https://youtube.com/@ragavi_editz?si=XQA_fVLz53J9KzRe" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-900 hover:bg-sienna-600 hover:text-white rounded-xl transition-all duration-300 border border-gray-800" aria-label="YouTube">
              <Youtube className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div className="md:col-span-2 space-y-4 text-left">
          <h4 className="text-xs font-semibold text-sienna-400 uppercase tracking-widest">Collections</h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li><Link to="/collection/Kanchi%20Semi%20Silk%20Saree" className="hover:text-sienna-400 transition-colors">Kanchi Semi Silk</Link></li>
            <li><Link to="/collection/Silver%20Zaree" className="hover:text-sienna-400 transition-colors">Silver Zaree</Link></li>
            <li><Link to="/collection/Gold%20Zaree" className="hover:text-sienna-400 transition-colors">Gold Zaree</Link></li>
            <li><Link to="/collection/Cotton" className="hover:text-sienna-400 transition-colors">Cotton Sarees</Link></li>
          </ul>
        </div>

        {/* Policies Column */}
        <div className="md:col-span-2 space-y-4 text-left">
          <h4 className="text-xs font-semibold text-sienna-400 uppercase tracking-widest">Policies</h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li><Link to="/policies/privacy" className="hover:text-sienna-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/policies/terms" className="hover:text-sienna-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/policies/shipping" className="hover:text-sienna-400 transition-colors">Shipping Information</Link></li>
            <li><Link to="/policies/returns" className="hover:text-sienna-400 transition-colors">Returns & Refunds</Link></li>
          </ul>
        </div>

        {/* Newsletter & Contact Column */}
        <div className="md:col-span-4 space-y-4 text-left">
          <h4 className="text-xs font-semibold text-sienna-400 uppercase tracking-widest">Newsletter</h4>
          <p className="text-xs text-gray-400">Subscribe for sneak-peeks of fresh weaves and exclusive boutique sales.</p>
          
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-sienna-500 w-full text-white placeholder-gray-500 transition-all"
              required
            />
            <button type="submit" className="p-3 bg-sienna-600 hover:bg-sienna-700 active:scale-95 rounded-xl transition-all flex items-center justify-center border border-sienna-500 text-white shadow-accent-glow">
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2.5 pt-3 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <MapPin className="w-4.5 h-4.5 text-sienna-400" />
              <span>Saree Bazaar St, Erode, Tamil Nadu</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4.5 h-4.5 text-sienna-400" />
              <a href="tel:+916369468700" className="hover:text-sienna-400 transition-colors">+91 63694 68700</a>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-900 py-8 text-center text-xs text-gray-500 font-medium">
        &copy; {new Date().getFullYear()} Gramathu Boutique. All rights reserved. Traditional Elegance with Modern Style.
      </div>
    </footer>
  );
}
