import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, ArticleData } from '@/src/types';
import { Brain, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface LessonViewProps {
  title: string;
  data: ArticleData | null;
  isLoading: boolean;
  onComplete: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ title, data, isLoading, onComplete }) => {
  const [step, setStep] = useState(1); // 1: Part1, 2: Pred1, 3: Part2, 4: Pred2, 5: Part3
  const [pred1Answer, setPred1Answer] = useState<number | null>(null);
  const [pred2Answer, setPred2Answer] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
          <Loader2 className="w-12 h-12 text-secondary animate-spin relative z-10" />
        </div>
        <p className="font-headline font-bold text-on-surface-variant tracking-widest uppercase text-sm animate-pulse">正在合成神经通路...</p>
      </div>
    );
  }

  const handlePred1 = (idx: number) => {
    setPred1Answer(idx);
    setTimeout(() => setStep(3), 1500);
  };

  const handlePred2 = (idx: number) => {
    setPred2Answer(idx);
    setTimeout(() => setStep(5), 1500);
  };

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-12 pb-40 pt-8 relative">
      <div className="space-y-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
        >
          <Sparkles className="w-3 h-3 text-secondary" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">神经下载</span>
        </motion.div>
        <h2 className="font-headline text-4xl font-extrabold leading-tight text-on-surface">
          {title}
        </h2>
      </div>

      <div className="space-y-12 relative z-10">
        {/* Part 1 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-lg leading-relaxed text-on-surface-variant font-body">
          <p>{data.part1}</p>
        </motion.div>

        {/* Part 2 */}
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-lg leading-relaxed text-on-surface-variant font-body">
            <p>{data.part2}</p>
          </motion.div>
        )}

        {/* Part 3 */}
        {step >= 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-lg leading-relaxed text-on-surface-variant font-body">
            <p>{data.part3}</p>
            <div className="mt-16 flex justify-center">
              <button 
                onClick={onComplete}
                className="px-10 py-5 primary-gradient text-white rounded-2xl font-headline font-extrabold text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">开始评估</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shimmer"></div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Continue Button for Steps 1 & 3 */}
        {(step === 1 || step === 3) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-8">
            <button 
              onClick={() => setStep(s => s + 1)}
              className="px-8 py-4 glass-button text-on-surface font-headline font-bold rounded-2xl transition-colors flex items-center gap-2"
            >
              <span>处理下一段</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Prediction 1 Modal */}
      <AnimatePresence>
        {step === 2 && (
          <div className="absolute inset-0 z-[60] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
            />
            <motion.div 
              className="w-full bg-surface rounded-t-[2rem] border-t border-black/5 dark:border-white/5 relative flex flex-col max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2"></div>
              <div className="px-5 pb-8 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 mb-6 pt-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-label text-[10px] font-bold tracking-widest text-secondary uppercase">实时互动</span>
                    <h3 className="font-headline font-extrabold text-lg text-on-surface">预测 1</h3>
                  </div>
                </div>
                
                <p className="font-headline text-on-surface font-semibold mb-6 text-lg leading-relaxed">
                  {data.prediction1.question}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {data.prediction1.options.map((opt, idx) => {
                    const isSelected = pred1Answer === idx;
                    const isCorrect = idx === data.prediction1.correctIndex;
                    const showResult = pred1Answer !== null;
                    
                    let btnClass = "bg-surface border-black/5 dark:border-white/5 text-on-surface-variant hover:border-black/10 dark:hover:border-white/10";
                    if (showResult) {
                      if (isCorrect) {
                        btnClass = "bg-success/10 border-success/50 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                      } else if (isSelected) {
                        btnClass = "bg-error/10 border-error/50 text-error";
                      } else {
                        btnClass = "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 opacity-50";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-primary/10 border-primary/50 text-on-surface shadow-[0_0_15px_rgba(99,102,241,0.2)]";
                    }

                    return (
                      <button 
                        key={idx}
                        onClick={() => handlePred1(idx)}
                        disabled={showResult}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border active:scale-[0.98]",
                          btnClass
                        )}
                      >
                        <span className="font-headline font-bold text-sm text-left">{opt}</span>
                        {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 flex-shrink-0 ml-3 text-success" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prediction 2 Modal */}
      <AnimatePresence>
        {step === 4 && (
          <div className="absolute inset-0 z-[60] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
            />
            <motion.div 
              className="w-full bg-surface rounded-t-[2rem] border-t border-black/5 dark:border-white/5 relative flex flex-col max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2"></div>
              <div className="px-5 pb-8 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 mb-6 pt-2">
                  <div className="w-10 h-10 rounded-2xl bg-tertiary/20 border border-tertiary/30 flex items-center justify-center text-tertiary shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-label text-[10px] font-bold tracking-widest text-tertiary uppercase">实时互动</span>
                    <h3 className="font-headline font-extrabold text-lg text-on-surface">预测 2</h3>
                  </div>
                </div>
                
                <p className="font-headline text-on-surface font-semibold mb-6 text-lg leading-relaxed">
                  {data.prediction2.question}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {data.prediction2.options.map((opt, idx) => {
                    const isSelected = pred2Answer === idx;
                    const isCorrect = idx === data.prediction2.correctIndex;
                    const showResult = pred2Answer !== null;
                    
                    let btnClass = "bg-surface border-black/5 dark:border-white/5 text-on-surface-variant hover:border-black/10 dark:hover:border-white/10";
                    if (showResult) {
                      if (isCorrect) {
                        btnClass = "bg-success/10 border-success/50 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                      } else if (isSelected) {
                        btnClass = "bg-error/10 border-error/50 text-error";
                      } else {
                        btnClass = "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 opacity-50";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-primary/10 border-primary/50 text-on-surface shadow-[0_0_15px_rgba(99,102,241,0.2)]";
                    }

                    return (
                      <button 
                        key={idx}
                        onClick={() => handlePred2(idx)}
                        disabled={showResult}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border active:scale-[0.98]",
                          btnClass
                        )}
                      >
                        <span className="font-headline font-bold text-sm text-left">{opt}</span>
                        {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 flex-shrink-0 ml-3 text-success" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
