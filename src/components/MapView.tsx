import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Lock, Plus, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/src/types';
import type { LearningProgress } from '../types/learning-progress';

interface MapViewProps {
  progressCollection: LearningProgress[];
  activeDomain: string;
  onDomainChange: (domain: string) => void;
  onNodeSelect: (domain: string, level: number) => void;
  onAddDomain: () => void;
  onDeleteDomain: (domain: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const MapView: React.FC<MapViewProps> = ({
  progressCollection,
  activeDomain,
  onDomainChange,
  onNodeSelect,
  onAddDomain,
  onDeleteDomain,
  loading,
  error,
}) => {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const activeProgress = useMemo(
    () => progressCollection.find((item) => item.domain === activeDomain) ?? progressCollection[0] ?? null,
    [activeDomain, progressCollection],
  );
  const activeIndex = Math.max(progressCollection.findIndex((item) => item.domain === activeProgress?.domain), 0);

  useEffect(() => {
    const strip = stripRef.current;
    const button = strip?.children.item(activeIndex) as HTMLElement | null;
    if (button) {
      button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeIndex]);

  if (!progressCollection.length) {
    return (
      <div className="min-h-full flex items-center justify-center px-6 py-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_40%),radial-gradient(circle_at_bottom,rgba(79,70,229,0.12),transparent_46%)] pointer-events-none"></div>
        <div className="relative z-10 w-full max-w-sm text-center space-y-6">
          <button
            onClick={onAddDomain}
            className="mx-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 primary-gradient text-white font-headline font-bold shadow-[0_0_24px_rgba(79,70,229,0.24)]"
          >
            <Plus className="w-4 h-4" />
            添加领域
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_40%),radial-gradient(circle_at_bottom,rgba(79,70,229,0.12),transparent_46%)] pointer-events-none"></div>

      <div className="sticky top-0 z-40 bg-surface/82 backdrop-blur-xl border-b border-black/5 px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div ref={stripRef} className="flex-1 flex gap-2 overflow-x-auto no-scrollbar">
            {progressCollection.map((progress) => {
              const isActive = progress.domain === activeProgress?.domain;

              return (
                <button
                  key={progress.domain}
                  onClick={() => onDomainChange(progress.domain)}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-sm font-headline font-bold transition-all border',
                    isActive
                      ? 'bg-primary text-white border-primary shadow-[0_0_18px_rgba(79,70,229,0.18)]'
                      : 'bg-surface/80 text-on-surface-variant border-black/5 hover:border-primary/30 hover:text-on-surface',
                  )}
                >
                  {progress.domain}
                </button>
              );
            })}
          </div>

          {activeProgress && (
            <button
              onClick={() => onDeleteDomain(activeProgress.domain)}
              className="w-10 h-10 shrink-0 rounded-full border border-black/5 bg-surface/80 text-on-surface-variant hover:text-error hover:border-error/30 transition-colors flex items-center justify-center"
              title={`删除 ${activeProgress.domain}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onAddDomain}
            className="w-10 h-10 shrink-0 rounded-full primary-gradient text-white flex items-center justify-center shadow-[0_0_22px_rgba(79,70,229,0.24)]"
            title="添加领域"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface-variant">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="absolute top-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-surface/88 px-3 py-2 text-xs text-on-surface-variant border border-black/5 shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>同步中</span>
        </div>
      )}

      {activeProgress && (
        <div className="relative z-10 flex-1 px-4 sm:px-6 pt-8 pb-24">
          <DomainTrack
            progress={activeProgress}
            onNodeSelect={(level) => onNodeSelect(activeProgress.domain, level)}
          />
        </div>
      )}
    </div>
  );
};

const DomainTrack = ({
  progress,
  onNodeSelect,
}: {
  progress: LearningProgress;
  onNodeSelect: (level: number) => void;
}) => {
  return (
    <div className="relative max-w-md mx-auto flex flex-col items-center gap-14 pb-8">
      <div className="absolute top-10 bottom-10 w-1 bg-black/5 rounded-full z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[220px] primary-gradient rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
      </div>

      {progress.levels.map((levelState, index) => {
        const status =
          levelState.completedAt
            ? 'completed'
            : levelState.level === progress.currentLevel
              ? 'active'
              : levelState.level < progress.currentLevel
                ? 'completed'
                : 'locked';
        const offset = index % 3 === 1 ? 'right' : index % 3 === 2 ? 'left' : undefined;

        return (
          <MapNode
            key={`${progress.domain}-${levelState.level}`}
            title={`第 ${levelState.level} 关`}
            status={status}
            offset={offset}
            onClick={() => onNodeSelect(levelState.level)}
          />
        );
      })}
    </div>
  );
};

const MapNode = ({
  title,
  status,
  offset,
  onClick,
}: {
  title: string;
  status: 'completed' | 'active' | 'locked';
  offset?: 'left' | 'right';
  onClick: () => void;
}) => {
  const isClickable = status !== 'locked';
  const icon =
    status === 'completed' ? <CheckCircle2 /> : status === 'active' ? <Sparkles /> : <Lock />;

  return (
    <motion.div
      className={cn(
        'relative z-10 flex flex-col items-center gap-4',
        offset === 'left' ? '-translate-x-14' : offset === 'right' ? 'translate-x-14' : '',
      )}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
    >
      <div
        onClick={isClickable ? onClick : undefined}
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative',
          status === 'active'
            ? 'w-24 h-24 bg-surface border border-black/10 shadow-[0_0_30px_rgba(79,70,229,0.4)] cursor-pointer active:scale-95 group'
            : status === 'completed'
              ? 'w-24 h-24 bg-surface border border-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.18)] cursor-pointer active:scale-95 group'
              : 'bg-surface-container-high border border-black/5 cursor-not-allowed opacity-50',
        )}
      >
        {status !== 'locked' && (
          <div className="absolute inset-2 rounded-full primary-gradient opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
        )}

        {React.cloneElement(icon as React.ReactElement, {
          className: cn(
            'w-8 h-8 relative z-10 transition-colors duration-300',
            status === 'active'
              ? 'text-secondary w-10 h-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
              : status === 'completed'
                ? 'text-emerald-500 w-10 h-10'
                : 'text-on-surface-variant',
          ),
        })}
      </div>

      <div
        className={cn(
          'px-5 py-2 rounded-full shadow-sm flex flex-col items-center backdrop-blur-md border',
          status === 'active'
            ? 'bg-primary/20 border-primary/30'
            : status === 'completed'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-black/5 border-black/5',
        )}
      >
        <span
          className={cn(
            'text-xs font-label font-bold uppercase tracking-widest',
            status === 'active'
              ? 'text-on-primary'
              : status === 'completed'
                ? 'text-emerald-600'
                : 'text-on-surface-variant',
          )}
        >
          {title}
        </span>
      </div>
    </motion.div>
  );
};
