import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, Sparkles, Terminal, X } from 'lucide-react';

interface FeynmanViewProps {
  title: string;
  initialDraft?: string;
  initialGrade?: string | null;
  onDraftChange?: (draft: string) => void;
  onClose?: () => void;
  onComplete: (payload?: { draft: string; grade: string }) => void;
}

export const FeynmanView: React.FC<FeynmanViewProps> = ({
  title,
  initialDraft = '',
  initialGrade = null,
  onDraftChange,
  onClose,
  onComplete,
}) => {
  const [text, setText] = useState(initialDraft);
  const [isGrading, setIsGrading] = useState(false);
  const [grade, setGrade] = useState<string | null>(initialGrade);

  useEffect(() => {
    setText(initialDraft);
  }, [initialDraft]);

  useEffect(() => {
    setGrade(initialGrade);
  }, [initialGrade]);

  useEffect(() => {
    if (!grade) {
      onDraftChange?.(text);
    }
  }, [grade, onDraftChange, text]);

  const handleSubmit = () => {
    setIsGrading(true);
    setTimeout(() => {
      setIsGrading(false);
      const nextGrade = 'A-';
      setGrade(nextGrade);
      setTimeout(() => {
        onComplete({ draft: text, grade: nextGrade });
      }, 3000);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        className="w-full bg-surface rounded-t-[2rem] border-t border-black/5 relative flex flex-col max-h-[95vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mt-4 mb-2"></div>

        <div className="px-5 pb-8 overflow-y-auto no-scrollbar space-y-6 pt-2">
          <section className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase border border-primary/20">
              <Sparkles className="w-3 h-3" />
              费曼复述
            </span>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">费曼技巧</h2>
            <p className="text-on-surface-variant font-body text-sm max-w-md mx-auto">
              向初学者解释 <span className="text-on-surface font-medium">“{title}”</span>。
            </p>
          </section>

          <div className="bg-black/5 rounded-[1.5rem] p-5 space-y-5 border border-black/5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-headline text-lg font-semibold text-on-surface flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  你的解释
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-black/5 bg-surface/80 text-on-surface-variant flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-cyan-400/50 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={isGrading || grade !== null}
                className="relative w-full h-36 bg-surface/80 backdrop-blur-sm rounded-xl p-4 border border-black/5 focus:border-primary/50 text-on-surface font-body text-sm resize-none placeholder:text-on-surface-variant/50 outline-none transition-all"
                placeholder="在此处开始输入你的解释..."
              />
            </div>

            {!grade ? (
              <button
                onClick={handleSubmit}
                disabled={text.length < 10 || isGrading}
                className="w-full py-3.5 primary-gradient primary-glow text-white rounded-xl font-headline font-bold shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] relative overflow-hidden"
              >
                {isGrading ? (
                  <span className="flex items-center justify-center gap-2 text-sm">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Brain className="w-4 h-4" />
                    </motion.div>
                    正在分析认知模型...
                  </span>
                ) : (
                  <span className="text-sm">提交综合</span>
                )}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-surface/60 border border-black/5 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs text-on-surface-variant">AI_评估_完成</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-success">状态: 最佳</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="8" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 * (1 - 0.9) }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="font-headline text-xl font-bold text-on-surface">{grade}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="font-mono text-[10px] text-primary">&gt; 分析输出:</div>
                    <p className="text-xs text-on-surface font-body leading-relaxed">
                      你已经把核心概念解释得足够清楚，可以随时回来继续润色或复盘。
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {grade && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2 text-center"
              >
                <p className="font-mono text-xs text-on-surface-variant animate-pulse">
                  正在同步神经连接...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
