import React from 'react';
import { motion } from 'motion/react';
import { Brain, X, RefreshCcw, Sparkles } from 'lucide-react';

interface TitleSelectionModalProps {
  titles: string[];
  onSelect: (title: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}

export const TitleSelectionModal: React.FC<TitleSelectionModalProps> = ({ titles, onSelect, onClose, onRefresh }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-xl px-5">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel w-full rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-black/5 dark:border-white/5"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 relative z-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Sparkles className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface leading-tight">选择路径</h3>
            <p className="text-[10px] sm:text-xs text-on-surface-variant font-mono mt-0.5 sm:mt-1">AI_精选_主题</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 -mr-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-3 relative z-10">
          {titles.map((title, idx) => (
            <button 
              key={idx}
              onClick={() => onSelect(title)}
              className="w-full text-left p-4 sm:p-5 rounded-2xl glass-button border-black/5 dark:border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all group active:scale-[0.98]"
            >
              <span className="block font-body font-medium text-sm text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">{title}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 sm:mt-6 relative z-10">
          <button 
            onClick={onRefresh}
            className="w-full py-3.5 sm:py-4 glass-button text-on-surface-variant hover:text-on-surface font-headline font-bold text-sm sm:text-base rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-black/5 dark:border-white/5"
          >
            <RefreshCcw className="w-4 h-4" />
            生成新路径
          </button>
        </div>
      </motion.div>
    </div>
  );
};
