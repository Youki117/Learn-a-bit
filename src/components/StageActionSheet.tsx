import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ActionItem = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
};

interface StageActionSheetProps {
  open: boolean;
  title: string;
  description: string;
  actions: ActionItem[];
  onClose: () => void;
}

export const StageActionSheet: React.FC<StageActionSheetProps> = ({
  open,
  title,
  description,
  actions,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[115] flex items-end justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="relative w-full max-w-[430px] rounded-t-[2rem] bg-surface border-t border-black/5 shadow-[0_-18px_40px_rgba(15,23,42,0.12)] p-5 pb-8"
          >
            <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-5" />
            <div className="text-center mb-6">
              <h3 className="font-headline font-black text-2xl text-on-surface">{title}</h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{description}</p>
            </div>
            <div className="space-y-3">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={
                    action.variant === 'secondary'
                      ? 'w-full rounded-2xl border border-black/10 bg-surface px-4 py-4 font-headline font-bold text-on-surface-variant'
                      : 'w-full rounded-2xl primary-gradient text-white px-4 py-4 font-headline font-bold shadow-[0_0_24px_rgba(79,70,229,0.22)]'
                  }
                >
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
