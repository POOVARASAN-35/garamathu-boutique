import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function ReviewsSlider() {
  const reviews = [
    { name: "Priya", text: "Excellent Quality.", rating: 5 },
    { name: "Lakshmi", text: "Worth Buying.", rating: 5 },
    { name: "Meena", text: "Beautiful Saree.", rating: 5 },
    { name: "Divya", text: "Very Fast Delivery.", rating: 5 },
    { name: "Anitha", text: "Loved the Fabric.", rating: 5 },
    { name: "Kavya", text: "Premium Collection.", rating: 5 },
    { name: "Revathi", text: "Highly Recommended.", rating: 5 }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 4000); // Rotate every 4 seconds
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <div className="relative w-full max-w-3xl mx-auto py-12 px-6 text-center overflow-hidden">
      
      {/* Background Quote Mark Decors */}
      <Quote className="absolute top-2 left-6 w-24 h-24 text-gold-500/5 rotate-180 -z-10" />
      <Quote className="absolute bottom-2 right-6 w-24 h-24 text-gold-500/5 -z-10" />

      <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-emerald-950 tracking-wider mb-2">
        Boutique Testimonials
      </h3>
      <p className="text-xs text-gold-600 font-montserrat tracking-widest uppercase mb-8">
        What our patrons say
      </p>

      <div className="relative min-h-[160px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Stars rating */}
            <div className="flex gap-1 mb-4">
              {[...Array(reviews[index].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold-500 fill-gold-500" />
              ))}
            </div>

            {/* Comment */}
            <p className="font-playfair text-lg sm:text-xl md:text-2xl italic text-emerald-900 font-medium leading-relaxed max-w-2xl px-4">
              "{reviews[index].text}"
            </p>

            {/* Author */}
            <h4 className="font-montserrat text-xs sm:text-sm font-semibold tracking-[0.2em] text-gold-600 uppercase mt-6">
              — {reviews[index].name}
            </h4>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sliders indicator dots */}
      <div className="flex justify-center gap-2 mt-8 z-10">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-gold-500' : 'w-2 bg-gold-500/20'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
