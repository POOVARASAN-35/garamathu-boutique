import React from 'react';
import { MessageSquareText } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/916369468700?text=Hello%20Gramathu%20Boutique%2C%20I%20am%20interested%20in%20your%20saree%20collections!";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-2"
      aria-label="Contact us on WhatsApp"
    >
      {/* Pulse effect */}
      <span className="absolute inline-flex h-12 w-12 rounded-full bg-emerald-500 opacity-75 animate-ping pointer-events-none" />
      
      <div className="relative w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
        <MessageSquareText className="w-5 h-5" />
      </div>

      {/* Floating tag label on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] group-hover:px-3 group-hover:py-1.5 bg-emerald-950 text-white text-[10px] font-semibold tracking-wider rounded-lg shadow-md transition-all duration-500 whitespace-nowrap uppercase border border-gold-500/10">
        WhatsApp Chat
      </span>
    </a>
  );
}
