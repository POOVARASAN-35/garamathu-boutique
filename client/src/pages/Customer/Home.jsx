import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSarees, fetchCategories, fetchReviews } from '../../store/productSlice.js';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Instagram, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Banner imports
import banner1 from '../../assets/image/banner-1.png';
import banner2 from '../../assets/image/banner-2.png';
import banner3 from '../../assets/image/banner-3.png';
import mobileBanner1 from '../../assets/image/mobile-view-banner-1.png';
import mobileBanner2 from '../../assets/image/mobile-view-banner-2.png';
import mobileBanner3 from '../../assets/image/mobile-view-banner-3.png';

// Component imports
import CategoryCard from '../../components/CategoryCard.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import ComboPicksBanner from '../../components/ComboPicksBanner.jsx';
import ReviewsSlider from '../../components/ReviewsSlider.jsx';

export default function Home({ onQuickView }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load from Redux
  const { sarees, categories, loading } = useSelector((state) => state.products);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchSarees({ limit: 100 }));
    dispatch(fetchCategories());
    dispatch(fetchReviews());
  }, [dispatch]);

  const kuberaSarees = sarees.filter(s => s.category === 'Kubera Soft Silk Saree').slice(0, 6);
  const borderlessSarees = sarees.filter(s => s.category === 'Borderless Soft Silk Saree').slice(0, 6);
  const cottonSarees = sarees.filter(s => s.category === 'Cotton').slice(0, 6);
  const dolaSarees = sarees.filter(s => s.category === 'Dola Silk Saree').slice(0, 6);

  // Static Banners Fallback if api is loading
  const homeBanners = [
    {
      title: "Traditional Elegance",
      subtitle: "Royal Heritage Weaves",
      description: "Delve into an authentic collection of Kanchipuram Semi Silk sarees crafted with exquisite golden zari designs.",
      image: banner1,
      mobileImage: mobileBanner1,
      link: "/collection/Kanchi%20Semi%20Silk%20Saree"
    },
    {
      title: "Kubera Prosperity Weaves",
      subtitle: "Festive Grandeur Silk Collection",
      description: "Adorn yourself with divine temple border motifs and contrasting heavy brocade patterns representing prosperity.",
      image: banner2,
      mobileImage: mobileBanner2,
      link: "/collection/Kubera%20Soft%20Silk%20Saree"
    },
    {
      title: "Silver Zaree Motifs",
      subtitle: "Minimal Modern Grace",
      description: "Discover deep midnight accents and cosmic silver thread details designed for the modern fashion connoisseur.",
      image: banner3,
      mobileImage: mobileBanner3,
      link: "/collection/Borderless%20Soft%20Silk%20Saree"
    }
  ];

  // Auto Slider effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeBanners.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [homeBanners.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % homeBanners.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + homeBanners.length) % homeBanners.length);
  };

  // Instagram styled grid picks
  const instagramPicks = [
    { id: 1, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500", tag: "@gramathu_design" },
    { id: 2, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500", tag: "@gramathu_design" },
    { id: 3, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500", tag: "@gramathu_design" },
    { id: 4, image: "https://images.unsplash.com/photo-1583391265517-35bbdad01209?w=500", tag: "@gramathu_design" },
    { id: 5, image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=500", tag: "@gramathu_design" },
    { id: 6, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80", tag: "@gramathu_design" }
  ];

  return (
    <div className="w-full bg-slate-50">

      {/* 1. Hero Image Slider */}
      <section className="relative w-full overflow-hidden bg-slate-900">
        
        {/* Carousel slide transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full cursor-pointer z-10"
            onClick={() => navigate(homeBanners[currentSlide].link)}
          >
            {/* Desktop Banner */}
            <img
              src={homeBanners[currentSlide].image}
              alt={homeBanners[currentSlide].title}
              className="w-full h-auto hidden md:block"
            />
            {/* Mobile Banner */}
            <img
              src={homeBanners[currentSlide].mobileImage}
              alt={homeBanners[currentSlide].title}
              className="w-full h-auto block md:hidden"
            />
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {homeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-amber-600' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Shop By Category Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 tracking-wider mb-2">
          Shop by Category
        </h2>
        <p className="text-xs text-sienna-600 font-poppins tracking-widest uppercase mb-12">
          Hand-picked traditional weaves
        </p>

        {/* Categories Grid (14 Categories) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. Category Product Showcase Grids */}
      {/* 3a. Kubera Soft Silk Sarees */}
      {kuberaSarees.length > 0 && (
        <section className="bg-white py-20 border-t border-gray-100 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 tracking-wider mb-2">
              Kubera Soft Silk Sarees
            </h2>
            <p className="text-xs text-sienna-600 font-poppins tracking-widest uppercase mb-12">
              Traditional auspicious luxury silks
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kuberaSarees.map((saree) => (
                <ProductCard key={saree.id} product={saree} onQuickView={onQuickView} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3b. Borderless Soft Silk Sarees */}
      {borderlessSarees.length > 0 && (
        <section className="bg-slate-50/50 py-20 border-t border-gray-100 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 tracking-wider mb-2">
              Borderless Soft Silk Sarees
            </h2>
            <p className="text-xs text-sienna-600 font-poppins tracking-widest uppercase mb-12">
              Contemporary lightweight self-weaves
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {borderlessSarees.map((saree) => (
                <ProductCard key={saree.id} product={saree} onQuickView={onQuickView} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3c. Cotton Sarees */}
      {cottonSarees.length > 0 && (
        <section className="bg-white py-20 border-t border-gray-100 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 tracking-wider mb-2">
              Cotton Sarees
            </h2>
            <p className="text-xs text-sienna-600 font-poppins tracking-widest uppercase mb-12">
              Handcrafted organic cottons & block prints
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {cottonSarees.map((saree) => (
                <ProductCard key={saree.id} product={saree} onQuickView={onQuickView} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3d. Dola Silk Sarees */}
      {dolaSarees.length > 0 && (
        <section className="bg-slate-50/50 py-20 border-y border-gray-100 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 tracking-wider mb-2">
              Dola Silk Sarees
            </h2>
            <p className="text-xs text-sienna-600 font-poppins tracking-widest uppercase mb-12">
              Vibrant digital prints and lace borders
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {dolaSarees.map((saree) => (
                <ProductCard key={saree.id} product={saree} onQuickView={onQuickView} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Special Combo Picks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ComboPicksBanner />
      </section>

      {/* 5. Customer Testimonial Slider */}
      <section className="py-16 bg-white border-t border-gray-100">
        <ReviewsSlider />
      </section>

    </div>
  );
}
