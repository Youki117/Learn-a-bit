import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/types';
import { 
  CheckCircle2, 
  XCircle,
  BookOpen,
  ChevronRight,
  Zap
} from 'lucide-react';

interface QuizViewProps {
  data: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  onComplete: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ data, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});
  const [autoAdvanceTrigger, setAutoAdvanceTrigger] = useState<number | null>(null);

  // Fallback data if none provided
  const questions = data && data.length > 0 ? data : [
    {
      question: "Which parameter is adjusted during the training process to minimize the error of a model's output?",
      options: ['Data Dimensions', 'Connection Weights', 'Learning Velocity', 'Input Frequency'],
      correctIndex: 1
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = answers[currentQuestionIndex] ?? null;
  const showResult = showResults[currentQuestionIndex] ?? false;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (autoAdvanceTrigger !== null) {
      timeout = setTimeout(() => {
        if (autoAdvanceTrigger < questions.length - 1) {
          setCurrentQuestionIndex(autoAdvanceTrigger + 1);
        } else {
          onComplete();
        }
        setAutoAdvanceTrigger(null);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [autoAdvanceTrigger, questions.length, onComplete]);

  const handleOptionSelect = (index: number) => {
    if (!showResult) {
      setAnswers(prev => ({ ...prev, [currentQuestionIndex]: index }));
      setShowResults(prev => ({ ...prev, [currentQuestionIndex]: true }));
      setAutoAdvanceTrigger(currentQuestionIndex);
    }
  };

  const handleQuestionNav = (idx: number) => {
    setCurrentQuestionIndex(idx);
    setAutoAdvanceTrigger(null);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
      />
      
      {/* Sheet Content */}
      <motion.div 
        className="w-full bg-surface rounded-t-[2rem] border-t border-black/5 dark:border-white/5 relative flex flex-col max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2"></div>
        
        <div className="px-5 pb-8 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  挑战 {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight">知识检查</h3>
            </div>
          </div>

          {/* Question Numbers */}
          <div className="mb-6 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {questions.map((_, idx) => {
              const isActive = currentQuestionIndex === idx;
              const isAnswered = answers[idx] !== undefined;
              const isCorrect = showResults[idx] && answers[idx] === questions[idx].correctIndex;
              const isWrong = showResults[idx] && answers[idx] !== questions[idx].correctIndex;
              
              let buttonClass = "bg-black/5 dark:bg-white/5 text-on-surface-variant hover:bg-black/10 dark:hover:bg-white/10";
              if (isActive) {
                buttonClass = "primary-gradient text-white shadow-[0_0_10px_rgba(99,102,241,0.3)] scale-110";
              } else if (isCorrect) {
                buttonClass = "bg-success/20 text-success";
              } else if (isWrong) {
                buttonClass = "bg-error/20 text-error";
              } else if (isAnswered) {
                buttonClass = "bg-primary/20 text-primary";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleQuestionNav(idx)}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all shrink-0",
                    buttonClass
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question */}
          <p className="font-headline text-lg font-medium text-on-surface mb-6 leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;
              
              let buttonClass = "bg-surface border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10";
              let textClass = "text-on-surface-variant group-hover:text-on-surface";
              let iconClass = "bg-black/5 dark:bg-white/5 text-on-surface-variant group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:text-on-surface";

              if (showResult) {
                if (isCorrect) {
                  buttonClass = "bg-success/10 border-success/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                  textClass = "text-success font-medium";
                  iconClass = "bg-success text-white";
                } else if (isSelected && !isCorrect) {
                  buttonClass = "bg-error/10 border-error/50";
                  textClass = "text-error font-medium";
                  iconClass = "bg-error text-white";
                } else {
                  buttonClass = "opacity-50 border-black/5 dark:border-white/5";
                }
              } else if (isSelected) {
                buttonClass = "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
                textClass = "text-on-primary-container font-medium";
                iconClass = "primary-gradient text-white";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showResult}
                  className={cn(
                    "group flex items-center p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98]",
                    buttonClass
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold shadow-sm transition-colors shrink-0",
                    iconClass
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={cn(
                    "ml-3 font-body text-sm transition-colors text-left flex-1",
                    textClass
                  )}>
                    {option}
                  </span>
                  <AnimatePresence>
                    {showResult && isCorrect && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="ml-2 shrink-0"
                      >
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </motion.div>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="ml-2 shrink-0"
                      >
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
