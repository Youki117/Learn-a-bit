import React from 'react';
import { motion } from 'motion/react';
import { cn, CATEGORIES } from '@/src/types';
import { Map as MapIcon, Sparkles } from 'lucide-react';

interface ExploreViewProps {
  activeDomain: string;
  setActiveDomain: (domain: string) => void;
  onStartExploration: () => void;
  error?: string | null;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ activeDomain, setActiveDomain, onStartExploration, error }) => {
  return (
    <div className="px-4 sm:px-6 space-y-10 flex flex-col min-h-full justify-center relative py-6 sm:py-0">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center space-y-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4"
        >
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">认知流</span>
        </motion.div>
        <h1 className="font-headline font-extrabold text-4xl sm:text-5xl text-on-surface tracking-tight leading-tight">
          掌握 <br/> <span className="text-gradient">未知</span>
        </h1>
        <p className="text-on-surface-variant font-medium text-base sm:text-lg max-w-[280px] mx-auto">
          选择一个领域开始你的神经扩展。
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 py-2 relative z-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveDomain(cat)}
            className={cn(
              "px-5 py-3 rounded-2xl font-headline font-bold text-sm transition-all duration-300",
              activeDomain === cat
                ? "bg-primary text-white border border-primary/20 shadow-[0_0_15px_rgba(79,70,229,0.2)] scale-105"
                : "glass-button text-on-surface-variant"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface-variant">
          {error}
        </div>
      )}

      <div className="relative z-10 pt-4 sm:pt-8">
        <button
          onClick={onStartExploration}
          className="w-full max-w-md mx-auto py-5 primary-gradient text-white font-headline font-extrabold text-lg sm:text-xl rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <MapIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span>进入 {activeDomain} 地图</span>
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 opacity-40 animate-shimmer"></div>
        </button>
      </div>
    </div>
  );
};
