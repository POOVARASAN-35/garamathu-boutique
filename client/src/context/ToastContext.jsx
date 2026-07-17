import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, Loader2, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full sm:w-auto">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon, bgColor, textColor, borderColor;

            switch (toast.type) {
              case 'success':
                icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
                bgColor = 'bg-white/95';
                textColor = 'text-emerald-950';
                borderColor = 'border-emerald-500/20';
                break;
              case 'error':
                icon = <XCircle className="w-5 h-5 text-wine-accent" />;
                bgColor = 'bg-white/95';
                textColor = 'text-wine-900';
                borderColor = 'border-wine-accent/20';
                break;
              case 'warning':
                icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
                bgColor = 'bg-white/95';
                textColor = 'text-amber-950';
                borderColor = 'border-amber-500/20';
                break;
              case 'loading':
                icon = <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />;
                bgColor = 'bg-white/95';
                textColor = 'text-emerald-950';
                borderColor = 'border-gold-500/20';
                break;
              case 'info':
              default:
                icon = <Info className="w-5 h-5 text-gold-500" />;
                bgColor = 'bg-white/95';
                textColor = 'text-emerald-950';
                borderColor = 'border-gold-500/20';
                break;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`glassmorphism ${bgColor} ${textColor} border ${borderColor} rounded-xl px-5 py-4 shadow-luxury flex items-center justify-between gap-4 pointer-events-auto w-full`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{icon}</div>
                  <p className="text-sm font-medium font-montserrat">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-emerald-950 transition-colors p-0.5 rounded-lg hover:bg-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
