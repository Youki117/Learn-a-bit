import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Compass, RefreshCcw, Sparkles, ArrowRight, Orbit } from 'lucide-react';
import { cn, CATEGORIES } from '@/src/types';
import { getExploreTopicBatch } from '../lib/explore-topics';

interface ExploreViewProps {
  activeDomain: string;
  setActiveDomain: (domain: string) => void;
  onStartExploration: () => void;
  error?: string | null;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ activeDomain, setActiveDomain, onStartExploration, error }) => {
  const [batchCursor, setBatchCursor] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    setBatchCursor(0);
    setSelectedTopic(null);
  }, [activeDomain]);

  const visibleTopics = useMemo(() => getExploreTopicBatch(activeDomain, batchCursor, 10), [activeDomain, batchCursor]);
  const highlightedTopic = selectedTopic && visibleTopics.includes(selectedTopic) ? selectedTopic : visibleTopics[0] ?? activeDomain;

  return (
    <div className="px-4 sm:px-6 min-h-full flex flex-col justify-center relative py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.10),transparent_28%),radial-gradient(circle_at_80%_16%,rgba(8,145,178,0.12),transparent_26%),linear-gradient(to_bottom,rgba(255,255,255,0.8),rgba(255,255,255,0.35))] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md mx-auto w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface/85 px-3 py-1.5 backdrop-blur-md shadow-[0_10px_30px_rgba(79,70,229,0.06)]">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              认知流
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-headline font-black text-[clamp(3rem,11vw,4.5rem)] leading-[0.9] tracking-[-0.06em] text-on-surface">
            掌握
          </h1>
          <div className="font-headline font-black text-[clamp(3rem,11vw,4.5rem)] leading-[0.9] tracking-[-0.06em] text-gradient mt-1">
            未知
          </div>
          <p className="mt-5 text-base sm:text-lg text-on-surface-variant font-medium max-w-[290px] mx-auto leading-relaxed">
            选择一个领域开始你的神经扩展。
          </p>
        </div>

        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveDomain(category)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-headline font-bold transition-all border shadow-[0_8px_20px_rgba(15,23,42,0.04)]',
                activeDomain === category
                  ? 'primary-gradient text-white border-primary/20 shadow-[0_0_20px_rgba(79,70,229,0.18)]'
                  : 'bg-surface/82 text-on-surface border-black/5 hover:border-primary/20 hover:text-on-surface-variant',
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 px-2 mb-9">
          {visibleTopics.map((topic, index) => {
            const isHighlighted = topic === highlightedTopic;

            return (
              <motion.button
                key={`${activeDomain}-${topic}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-headline font-bold transition-all shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur-md',
                  isHighlighted
                    ? 'bg-on-surface text-white border-on-surface shadow-[0_16px_30px_rgba(24,24,27,0.18)]'
                    : 'bg-surface/90 text-on-surface border-black/5 hover:border-primary/20 hover:-translate-y-0.5',
                )}
              >
                {topic}
              </motion.button>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface-variant text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setBatchCursor((cursor) => cursor + 5)}
            className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-surface/82 px-4 py-3 text-sm font-headline font-bold text-on-surface shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-primary/20"
          >
            <RefreshCcw className="w-4 h-4" />
            换一批
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-surface/82 px-4 py-3 text-sm font-headline font-bold text-on-surface-variant shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <Orbit className="w-4 h-4 text-secondary" />
            <span>{highlightedTopic}</span>
          </div>
        </div>

        <button
          onClick={onStartExploration}
          className="w-full rounded-[1.75rem] bg-on-surface text-white px-6 py-5 shadow-[0_24px_50px_rgba(24,24,27,0.18)] flex items-center justify-between transition-transform active:scale-[0.98]"
        >
          <div className="text-left">
            <div className="text-xs font-mono uppercase tracking-[0.22em] text-white/55 mb-1">开始探索</div>
            <div className="font-headline font-black text-xl tracking-tight">【{highlightedTopic}】</div>
          </div>
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </motion.div>
    </div>
  );
};
