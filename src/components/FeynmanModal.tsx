import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';

interface FeynmanModalProps {
  title: string;
  onComplete: () => void;
}

export const FeynmanModal: React.FC<FeynmanModalProps> = ({ title, onComplete }) => {
  const [text, setText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [grade, setGrade] = useState<string | null>(null);

  const handleSubmit = () => {
    setIsGrading(true);
    // Simulate grading
    setTimeout(() => {
      setIsGrading(false);
      setGrade('A-');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-surface-container-lowest rounded-[2rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <section className="text-center space-y-2 mb-8">
          <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-label text-[11px] font-bold tracking-widest uppercase">Lesson Complete</span>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight">The Feynman Recap</h2>
          <p className="text-on-surface-variant font-body">Synthesize your learning about "{title}" into a simple narrative.</p>
        </section>

        <div className="bg-surface-container-low/50 rounded-3xl p-6 border border-outline-variant/10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-headline text-2xl font-bold">Explain it like I'm five</h3>
          </div>
          <div className="bg-tertiary/10 p-3 rounded-2xl">
            <Brain className="text-tertiary w-6 h-6" />
          </div>
        </div>

        <div className="relative">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isGrading || grade !== null}
            className="w-full h-48 bg-surface-container-low rounded-xl p-6 border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-body resize-none placeholder:text-outline" 
            placeholder="Imagine you are telling a child about this topic..."
          ></textarea>
        </div>

        {!grade ? (
          <button 
            onClick={handleSubmit}
            disabled={text.length < 10 || isGrading}
            className="w-full py-4 primary-gradient text-on-primary rounded-xl font-headline font-bold shadow-lg disabled:opacity-50"
          >
            {isGrading ? 'Grading...' : 'Submit Recap'}
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-low/50 rounded-2xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full primary-gradient flex items-center justify-center shadow-lg">
                <span className="font-headline text-2xl font-black text-on-primary">{grade}</span>
              </div>
              <div className="space-y-0.5">
                <p className="font-headline font-bold text-on-surface">AI Feedback Preview</p>
                <p className="text-xs text-on-surface-variant font-body">Great job simplifying complex concepts!</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

        {grade && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
            <button 
              onClick={onComplete}
              className="w-full primary-gradient text-on-primary py-5 rounded-full font-headline font-bold text-lg shadow-xl shadow-primary/40 active:scale-95 transition-all"
            >
              Claim Knowledge Star & Continue
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
