import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, BookHeart, CheckCircle2, Loader2, NotebookPen, Sparkles, X } from 'lucide-react';
import { cn, ArticleData } from '@/src/types';
import type { PredictionSessionState } from '../types/learning-progress';

interface LessonViewProps {
  title: string;
  data: ArticleData | null;
  isLoading: boolean;
  isFavorite?: boolean;
  initialNote?: string;
  initialStep?: number;
  prediction1State?: PredictionSessionState;
  prediction2State?: PredictionSessionState;
  onToggleFavorite?: () => void;
  onSaveNote?: (content: string) => void;
  onLessonStepChange?: (step: number) => void;
  onPredictionResolve?: (payload: {
    predictionKey: 'prediction1' | 'prediction2';
    correct: boolean;
    wager: number;
    prompt: string;
    selectedAnswer: number;
  }) => void;
  onComplete: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  title,
  data,
  isLoading,
  isFavorite = false,
  initialNote = '',
  initialStep = 1,
  prediction1State,
  prediction2State,
  onToggleFavorite,
  onSaveNote,
  onLessonStepChange,
  onPredictionResolve,
  onComplete,
}) => {
  const [step, setStep] = useState(initialStep);
  const [pred1Answer, setPred1Answer] = useState<number | null>(prediction1State?.selectedAnswer ?? null);
  const [pred2Answer, setPred2Answer] = useState<number | null>(prediction2State?.selectedAnswer ?? null);
  const [pred1Wager, setPred1Wager] = useState(prediction1State?.wager ?? 100);
  const [pred2Wager, setPred2Wager] = useState(prediction2State?.wager ?? 100);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteDraft, setNoteDraft] = useState(initialNote);
  const holdIntervalRef = useRef<number | null>(null);

  const stopWagerBoost = () => {
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const startWagerBoost = (predictionKey: 'prediction1' | 'prediction2') => {
    stopWagerBoost();
    holdIntervalRef.current = window.setInterval(() => {
      if (predictionKey === 'prediction1') {
        setPred1Wager((value) => Math.min(value + 100, 1000));
      } else {
        setPred2Wager((value) => Math.min(value + 100, 1000));
      }
    }, 220);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    setNoteDraft(initialNote);
  }, [initialNote]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    setPred1Answer(prediction1State?.selectedAnswer ?? null);
    setPred1Wager(prediction1State?.wager ?? 100);
  }, [prediction1State?.selectedAnswer, prediction1State?.wager]);

  useEffect(() => {
    setPred2Answer(prediction2State?.selectedAnswer ?? null);
    setPred2Wager(prediction2State?.wager ?? 100);
  }, [prediction2State?.selectedAnswer, prediction2State?.wager]);

  useEffect(() => () => stopWagerBoost(), []);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
          <Loader2 className="w-12 h-12 text-secondary animate-spin relative z-10" />
        </div>
        <p className="font-headline font-bold text-on-surface-variant tracking-widest uppercase text-sm animate-pulse">
          正在合成神经通路...
        </p>
      </div>
    );
  }

  const resolvePrediction = (
    predictionKey: 'prediction1' | 'prediction2',
    selectedIndex: number,
    correctIndex: number,
    prompt: string,
  ) => {
    const wager = predictionKey === 'prediction1' ? pred1Wager : pred2Wager;
    const correct = selectedIndex === correctIndex;
    onPredictionResolve?.({ predictionKey, correct, wager, prompt, selectedAnswer: selectedIndex });
  };

  const handlePred1 = (idx: number) => {
    stopWagerBoost();
    setPred1Answer(idx);
    resolvePrediction('prediction1', idx, data.prediction1.correctIndex, data.prediction1.question);
    setTimeout(() => {
      setStep(3);
      onLessonStepChange?.(3);
    }, 1500);
  };

  const handlePred2 = (idx: number) => {
    stopWagerBoost();
    setPred2Answer(idx);
    resolvePrediction('prediction2', idx, data.prediction2.correctIndex, data.prediction2.question);
    setTimeout(() => {
      setStep(5);
      onLessonStepChange?.(5);
    }, 1500);
  };

  const closePrediction = (nextStep: number) => {
    stopWagerBoost();
    setStep(nextStep);
    onLessonStepChange?.(nextStep);
  };

  return (
    <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-10 pb-40 pt-6 sm:pt-8 relative">
      <div className="space-y-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
        >
          <Sparkles className="w-3 h-3 text-secondary" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">神经下载</span>
        </motion.div>

        <div className="flex items-start justify-between gap-4">
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold leading-tight text-on-surface break-words flex-1">
            {title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleFavorite}
              className={cn(
                'w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors',
                isFavorite ? 'bg-error/10 border-error/25 text-error' : 'bg-surface/80 border-black/5 text-on-surface-variant',
              )}
            >
              <BookHeart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowNoteEditor(true)}
              className="w-11 h-11 rounded-2xl border border-black/5 bg-surface/80 text-on-surface-variant flex items-center justify-center"
            >
              <NotebookPen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-base sm:text-lg leading-relaxed text-on-surface-variant font-body">
          <p>{data.part1}</p>
        </motion.div>

        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-base sm:text-lg leading-relaxed text-on-surface-variant font-body">
            <p>{data.part2}</p>
          </motion.div>
        )}

        {step >= 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-base sm:text-lg leading-relaxed text-on-surface-variant font-body">
            <p>{data.part3}</p>
            <div className="mt-12 flex justify-center">
              <button
                onClick={onComplete}
                className="w-full sm:w-auto px-8 py-5 primary-gradient text-white rounded-2xl font-headline font-extrabold text-base sm:text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">开始评估</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shimmer"></div>
              </button>
            </div>
          </motion.div>
        )}

        {(step === 1 || step === 3) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-6">
            <button
              onClick={() => {
                const nextStep = step + 1;
                setStep(nextStep);
                onLessonStepChange?.(nextStep);
              }}
              className="w-full sm:w-auto px-8 py-4 glass-button text-on-surface font-headline font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <span>处理下一段</span>
            </button>
          </motion.div>
        )}
      </div>

      <PredictionSheet
        open={step === 2}
        title="预测 1"
        question={data.prediction1.question}
        options={data.prediction1.options}
        correctIndex={data.prediction1.correctIndex}
        selectedAnswer={pred1Answer}
        wager={pred1Wager}
        onPointerChargeStart={() => startWagerBoost('prediction1')}
        onPointerChargeEnd={stopWagerBoost}
        onOptionSelect={handlePred1}
        onClose={() => closePrediction(1)}
      />

      <PredictionSheet
        open={step === 4}
        title="预测 2"
        question={data.prediction2.question}
        options={data.prediction2.options}
        correctIndex={data.prediction2.correctIndex}
        selectedAnswer={pred2Answer}
        wager={pred2Wager}
        onPointerChargeStart={() => startWagerBoost('prediction2')}
        onPointerChargeEnd={stopWagerBoost}
        onOptionSelect={handlePred2}
        onClose={() => closePrediction(3)}
      />

      <AnimatePresence>
        {showNoteEditor && (
          <div className="absolute inset-0 z-[70] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
              onClick={() => setShowNoteEditor(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="w-full bg-surface rounded-t-[2rem] border-t border-black/5 relative p-5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-4"></div>
              <h3 className="font-headline font-bold text-xl text-on-surface">学习笔记</h3>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="记下你现在最想保留的一句话。"
                className="mt-4 w-full h-40 rounded-2xl border border-black/10 bg-surface px-4 py-4 resize-none outline-none"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowNoteEditor(false)}
                  className="flex-1 rounded-2xl border border-black/10 px-4 py-3 font-headline font-bold text-on-surface-variant"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    onSaveNote?.(noteDraft);
                    setShowNoteEditor(false);
                  }}
                  className="flex-1 rounded-2xl primary-gradient text-white px-4 py-3 font-headline font-bold"
                >
                  保存笔记
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PredictionSheet = ({
  open,
  title,
  question,
  options,
  correctIndex,
  selectedAnswer,
  wager,
  onPointerChargeStart,
  onPointerChargeEnd,
  onOptionSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedAnswer: number | null;
  wager: number;
  onPointerChargeStart: () => void;
  onPointerChargeEnd: () => void;
  onOptionSelect: (index: number) => void;
  onClose: () => void;
}) => {
  const showResult = selectedAnswer !== null;

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[60] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            className="w-full bg-surface rounded-t-[2rem] border-t border-black/5 relative flex flex-col max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mt-4 mb-2"></div>
            <div className="px-5 pb-8 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-3 mb-5 pt-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-label text-[10px] font-bold tracking-widest text-secondary uppercase">实时互动</span>
                  <h3 className="font-headline font-extrabold text-lg text-on-surface">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto w-10 h-10 rounded-full border border-black/5 bg-surface/80 text-on-surface-variant flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-black/5 bg-black/5 px-4 py-3 mb-5 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-on-surface-variant">当前下注</span>
                <span className="font-headline font-black text-xl text-on-surface">{wager}</span>
              </div>

              <p className="font-headline text-on-surface font-semibold mb-6 text-lg leading-relaxed">{question}</p>

              <div className="grid grid-cols-1 gap-3">
                {options.map((option, index) => {
                  const isCorrect = index === correctIndex;

                  const buttonClass = showResult
                    ? isCorrect
                      ? 'bg-success/10 border-success/50 text-success'
                      : selectedAnswer === index
                        ? 'bg-error/10 border-error/50 text-error'
                        : 'bg-black/5 border-black/5 opacity-50'
                    : 'bg-surface border-black/5 text-on-surface-variant hover:border-primary/35 hover:bg-primary/5';

                  return (
                    <button
                      key={index}
                      disabled={showResult}
                      onPointerDown={onPointerChargeStart}
                      onPointerUp={() => {
                        onPointerChargeEnd();
                        onOptionSelect(index);
                      }}
                      onPointerCancel={onPointerChargeEnd}
                      onPointerLeave={onPointerChargeEnd}
                      className={cn('flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border active:scale-[0.98]', buttonClass)}
                    >
                      <span className="font-headline font-bold text-sm text-left">{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 flex-shrink-0 ml-3 text-success" />}
                    </button>
                  );
                })}
              </div>

              {!showResult && (
                <p className="text-xs text-on-surface-variant mt-4 text-center">
                  长按选项可加注，松手即结算。
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
