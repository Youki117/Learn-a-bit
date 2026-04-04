import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, XCircle, Zap } from 'lucide-react';
import { cn } from '@/src/types';
import type { QuizSessionState } from '../types/learning-progress';

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

interface QuizViewProps {
  data: QuizQuestion[];
  initialState?: QuizSessionState;
  onProgressChange?: (state: QuizSessionState) => void;
  onClose?: () => void;
  onComplete: (result: { correctAnswers: number; totalQuestions: number; wrongPrompts: string[] }) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ data, initialState, onProgressChange, onClose, onComplete }) => {
  const [autoAdvanceTrigger, setAutoAdvanceTrigger] = useState<number | null>(null);

  const questions =
    data && data.length > 0
      ? data
      : [
          {
            question: 'Which parameter is adjusted during training to minimize model error?',
            options: ['Data Dimensions', 'Connection Weights', 'Learning Velocity', 'Input Frequency'],
            correctIndex: 1,
          },
        ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialState?.currentQuestionIndex ?? 0);
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const source = initialState?.answers ?? [];
    return source.reduce<Record<number, number>>((result, answer, index) => {
      if (typeof answer === 'number') {
        result[index] = answer;
      }
      return result;
    }, {});
  });
  const [showResults, setShowResults] = useState<Record<number, boolean>>(() => {
    const source = initialState?.answers ?? [];
    return source.reduce<Record<number, boolean>>((result, answer, index) => {
      if (typeof answer === 'number') {
        result[index] = true;
      }
      return result;
    }, {});
  });

  useEffect(() => {
    const source = initialState?.answers ?? [];
    setCurrentQuestionIndex(initialState?.currentQuestionIndex ?? 0);
    setAnswers(
      source.reduce<Record<number, number>>((result, answer, index) => {
        if (typeof answer === 'number') {
          result[index] = answer;
        }
        return result;
      }, {}),
    );
    setShowResults(
      source.reduce<Record<number, boolean>>((result, answer, index) => {
        if (typeof answer === 'number') {
          result[index] = true;
        }
        return result;
      }, {}),
    );
  }, [initialState?.answers, initialState?.currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = answers[currentQuestionIndex] ?? null;
  const showResult = showResults[currentQuestionIndex] ?? false;

  const finalizeQuiz = (sourceAnswers: Record<number, number>) => {
    const correctAnswers = questions.filter((question, index) => sourceAnswers[index] === question.correctIndex).length;
    const wrongPrompts = questions
      .filter((question, index) => sourceAnswers[index] !== question.correctIndex)
      .map((question) => question.question);

    onProgressChange?.({
      currentQuestionIndex: questions.length - 1,
      answers: Array.from({ length: questions.length }, (_, index) => sourceAnswers[index] ?? null),
      completed: true,
      correctAnswers,
      wrongPrompts,
    });
    onComplete({
      correctAnswers,
      totalQuestions: questions.length,
      wrongPrompts,
    });
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (autoAdvanceTrigger !== null) {
      timeout = setTimeout(() => {
        setCurrentQuestionIndex(autoAdvanceTrigger + 1);
        onProgressChange?.({
          currentQuestionIndex: autoAdvanceTrigger + 1,
          answers: Array.from({ length: questions.length }, (_, index) => answers[index] ?? null),
          completed: false,
          correctAnswers: null,
          wrongPrompts: [],
        });
        setAutoAdvanceTrigger(null);
      }, 2200);
    }

    return () => clearTimeout(timeout);
  }, [answers, autoAdvanceTrigger, onComplete, onProgressChange, questions]);

  const handleOptionSelect = (index: number) => {
    if (showResult) {
      return;
    }

    const nextAnswers = { ...answers, [currentQuestionIndex]: index };
    setAnswers(nextAnswers);
    setShowResults((prev) => ({ ...prev, [currentQuestionIndex]: true }));
    if (currentQuestionIndex < questions.length - 1) {
      onProgressChange?.({
        currentQuestionIndex,
        answers: Array.from({ length: questions.length }, (_, idx) => nextAnswers[idx] ?? null),
        completed: false,
        correctAnswers: null,
        wrongPrompts: [],
      });
      setAutoAdvanceTrigger(currentQuestionIndex);
      return;
    }

    finalizeQuiz(nextAnswers);
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
        className="w-full bg-surface rounded-t-[2rem] border-t border-black/5 relative flex flex-col max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mt-4 mb-2"></div>

        <div className="px-4 sm:px-5 pb-8 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-6 pt-2 gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  挑战 {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight">知识检测</h3>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-black/5 bg-surface/80 text-on-surface-variant flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-6 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {questions.map((question, index) => {
              const isActive = currentQuestionIndex === index;
              const isAnswered = answers[index] !== undefined;
              const isCorrect = showResults[index] && answers[index] === question.correctIndex;
              const isWrong = showResults[index] && answers[index] !== question.correctIndex;

              const buttonClass = isActive
                ? 'primary-gradient text-white shadow-[0_0_10px_rgba(99,102,241,0.3)] scale-110'
                : isCorrect
                  ? 'bg-success/20 text-success'
                  : isWrong
                    ? 'bg-error/20 text-error'
                    : isAnswered
                      ? 'bg-primary/20 text-primary'
                      : 'bg-black/5 text-on-surface-variant hover:bg-black/10';

              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setAutoAdvanceTrigger(null);
                    onProgressChange?.({
                      currentQuestionIndex: index,
                      answers: Array.from({ length: questions.length }, (_, idx) => answers[idx] ?? null),
                      completed: initialState?.completed ?? false,
                      correctAnswers: initialState?.correctAnswers ?? null,
                      wrongPrompts: initialState?.wrongPrompts ?? [],
                    });
                  }}
                  className={cn('w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all shrink-0', buttonClass)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <p className="font-headline text-lg font-medium text-on-surface mb-6 leading-relaxed">{currentQuestion.question}</p>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;

              const buttonClass = showResult
                ? isCorrect
                  ? 'bg-success/10 border-success/50'
                  : isSelected
                    ? 'bg-error/10 border-error/50'
                    : 'opacity-50 border-black/5'
                : 'bg-surface border-black/5 hover:border-primary/35';

              const textClass = showResult
                ? isCorrect
                  ? 'text-success font-medium'
                  : isSelected
                    ? 'text-error font-medium'
                    : 'text-on-surface-variant'
                : 'text-on-surface-variant group-hover:text-on-surface';

              const iconClass = showResult
                ? isCorrect
                  ? 'bg-success text-white'
                  : isSelected
                    ? 'bg-error text-white'
                    : 'bg-black/5 text-on-surface-variant'
                : isSelected
                  ? 'primary-gradient text-white'
                  : 'bg-black/5 text-on-surface-variant';

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showResult}
                  className={cn('group flex items-center p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98]', buttonClass)}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold shadow-sm transition-colors shrink-0', iconClass)}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={cn('ml-3 font-body text-sm transition-colors text-left flex-1', textClass)}>{option}</span>
                  <AnimatePresence>
                    {showResult && isCorrect && (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ml-2 shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </motion.div>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ml-2 shrink-0">
                        <XCircle className="w-5 h-5 text-error" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
