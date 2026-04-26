import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore, ToastMsg } from '../lib/toast';
import { cn } from '../lib/utils';

const STYLES: Record<ToastMsg['type'], { bg: string; icon: React.ReactNode }> = {
  success: { bg: 'bg-green-500',    icon: <CheckCircle2 size={18} /> },
  error:   { bg: 'bg-red-500',      icon: <XCircle size={18} /> },
  info:    { bg: 'bg-brand-blue',   icon: <Info size={18} /> },
};

export default function ToastContainer() {
  const msgs = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {msgs.map(m => {
          const { bg, icon } = STYLES[m.type];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-xl max-w-sm pointer-events-auto',
                bg
              )}
            >
              {icon}
              <span className="flex-1">{m.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
