import React from 'react';
import { ShieldCheck, Check, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModerationManager() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Модерація</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Перевірка оголошень від клієнтів</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
              <AlertCircle size={14} /> 3 авто очікують
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all"
          >
            <div className="w-full md:w-64 aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shrink-0 relative">
               <img src={`https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop`} className="w-full h-full object-cover" />
               <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest italic">Client #12{i}</div>
            </div>

            <div className="flex-1 space-y-4">
               <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-blue transition-colors">BMW X5 xDrive40i · 2022</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Отримано сьогодні, 14:20 · Бюджет: $75,000</p>
               </div>

               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-brand-blue mb-1">
                     <ShieldCheck size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">AI Підказка:</span>
                  </div>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed italic">«Ймовірно дублікат #125. Ціна нижче ринку на 15% — рекомендується детальна перевірка техпаспорта.»</p>
               </div>

               <div className="flex flex-wrap gap-2 pt-2">
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center gap-2">
                    <Check size={14} /> Опублікувати
                  </button>
                  <button className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-amber-600 hover:border-amber-200 transition-all">
                    На доопрацювання
                  </button>
                  <button className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-200 transition-all flex items-center gap-2">
                    <X size={14} /> Відхилити
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
