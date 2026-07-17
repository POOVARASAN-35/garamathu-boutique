import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ComboPicksBanner() {
  const navigate = useNavigate();

  // Initialize countdown timer: e.g. 14 hours, 45 minutes, 30 seconds left, counting down
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset timer to simulate endless promo
              hours = 24;
              minutes = 0;
              seconds = 0;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Pad digits with leading zero
  const formatTime = (num) => String(num).padStart(2, '0');

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-luxury border border-gray-100 my-16">
      
      {/* Background Graphic elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sienna-900/30 via-gray-900 to-gray-950 -z-10" />
      <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-sienna-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-sienna-500/10 blur-3xl pointer-events-none" />

      {/* Grid Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 p-8 sm:p-12 md:p-16">
        
        {/* Left Info Column */}
        <div className="md:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-sienna-500/10 border border-sienna-500/20 rounded-full text-sienna-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Limited Offer
          </div>
          
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide leading-tight">
            Combo Picks Selection
          </h2>
          
          <p className="font-playfair text-xl sm:text-2xl text-sienna-300 font-medium tracking-wide">
            Buy Any 2 Sarees for just <span className="font-poppins font-bold text-white text-2xl sm:text-3xl">₹499</span>
          </p>

          <p className="text-xs sm:text-sm text-gray-400 font-poppins leading-relaxed max-w-lg">
            Elevate your wedding wardrobe with our special hand-woven collection combo. Pick any two sarees and avail of this exclusive price, only for today.
          </p>

          <button
            onClick={() => navigate('/collection/all')}
            className="group inline-flex items-center gap-2 bg-sienna-600 hover:bg-sienna-700 text-white font-poppins font-semibold text-xs tracking-wider uppercase py-3.5 px-7 rounded-xl transition-all shadow-accent-glow hover:shadow-luxury-hover duration-300"
          >
            Shop Combo Collection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Right Timer Column */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          <p className="text-[10px] font-bold tracking-[0.25em] text-sienna-400 uppercase mb-4">
            Offer Ends In:
          </p>

          {/* Countdown Clock */}
          <div className="flex gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-poppins font-bold text-2xl sm:text-3xl text-white">
                  {formatTime(timeLeft.hours)}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase mt-2">Hours</span>
            </div>

            {/* Separator */}
            <span className="font-poppins font-bold text-2xl sm:text-3xl text-sienna-400 pt-4">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-poppins font-bold text-2xl sm:text-3xl text-white">
                  {formatTime(timeLeft.minutes)}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase mt-2">Mins</span>
            </div>

            {/* Separator */}
            <span className="font-poppins font-bold text-2xl sm:text-3xl text-sienna-400 pt-4">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-poppins font-bold text-2xl sm:text-3xl text-white">
                  {formatTime(timeLeft.seconds)}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase mt-2">Secs</span>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-gray-500 font-medium tracking-wide text-center">
            *Free shipping applies to Erode District on checkout.
          </div>
        </div>

      </div>
    </div>
  );
}
