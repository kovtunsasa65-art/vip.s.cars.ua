import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import FullBuybackForm from './FullBuybackForm';

interface BuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuybackModal({ isOpen, onClose }: BuybackModalProps) {
  // Блокуємо скрол фону
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-50 bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 shrink-0 bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Викуп вашого авто</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Оцінка за 1 годину • Оплата одразу</p>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <FullBuybackForm embedded onSuccess={() => {
                // Можна додати затримку перед закриттям, але FullBuybackForm має свій Success екран
              }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
