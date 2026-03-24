import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ArrowRight, Sparkles } from 'lucide-react';

const Particles = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 6 + 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 150 + 50;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const delay = Math.random() * 0.2;
      const color = ['#4f46e5', '#0891b2', '#9333ea', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)];
      
      return { id: i, size, tx, ty, delay, color };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 1 }}
          transition={{ duration: 0.8 + Math.random() * 0.5, delay: p.delay, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`
          }}
        />
      ))}
    </div>
  );
};

interface NotificationToastProps {
  type: 'quiz' | 'feynman' | 'next_article';
  onAction: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ type, onAction }) => {
  const content = {
    quiz: { title: '知识检查', desc: '验证你的神经通路。', btn: '开始检查' },
    feynman: { title: '综合协议', desc: '巩固你的理解。', btn: '初始化' },
    next_article: { title: '协议完成', desc: '准备好进入下一个节点了吗？', btn: '选择路径' }
  }[type];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute top-20 left-4 right-4 z-[110] mx-auto"
      >
        <Particles />
        <div className="glass-panel rounded-2xl p-3.5 shadow-2xl border-primary/30 flex items-center gap-3 relative overflow-hidden bg-surface/95 backdrop-blur-2xl">
          {/* Subtle background glow */}
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)] relative z-10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 relative z-10">
            <h4 className="font-headline font-bold text-on-surface text-sm">{content.title}</h4>
            <p className="text-[10px] text-on-surface-variant font-body mt-0.5">{content.desc}</p>
          </div>
          <button 
            onClick={onAction}
            className="px-4 py-2 primary-gradient primary-glow text-white rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0 relative z-10"
          >
            {content.btn}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
