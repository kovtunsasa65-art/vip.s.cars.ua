import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-semibold text-slate-800 text-sm">{item.q}</span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform shrink-0 ml-3 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden">
              <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{item.a}</p>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
