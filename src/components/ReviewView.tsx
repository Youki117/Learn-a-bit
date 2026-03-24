import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/types';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Brain,
  History,
  Sparkles
} from 'lucide-react';

export const ReviewView: React.FC = () => {
  return (
    <div className="px-6 max-w-2xl mx-auto space-y-10 pb-32 pt-8 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Knowledge Consolidation Hero */}
      <section className="relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <Sparkles className="w-3 h-3 text-secondary" />
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">神经同步</span>
            </motion.div>
            <h1 className="font-headline font-extrabold text-3xl text-on-surface">巩固</h1>
            <p className="text-on-surface-variant text-sm mt-2 font-body">真正的精通来自于不断的复习。</p>
          </div>
          
          {/* Progress Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              <circle className="text-black/5" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
              <circle className="text-primary" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213.6" strokeDashoffset="128.16" strokeLinecap="round" strokeWidth="6"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold font-headline text-on-surface">4/10</span>
            </div>
          </div>
        </div>

        {/* Bento Featured: Mistake Re-practice */}
        <motion.div 
          className="glass-panel rounded-3xl p-6 border-l-4 border-l-error relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
          whileHover={{ x: 4 }}
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-error/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-error" />
                <h2 className="font-headline font-bold text-lg text-error">错误分析</h2>
              </div>
              <p className="text-on-surface-variant text-sm max-w-[220px] font-body leading-relaxed">检测到 3 个薄弱环节。建议立即复习。</p>
              <button className="mt-4 px-5 py-2.5 bg-error/20 text-error border border-error/50 hover:bg-error hover:text-white rounded-xl font-headline font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                启动复习
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-error/20 border border-error/30 text-error px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              紧急
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pending Tasks List */}
      <section className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-on-surface text-xl">待办任务</h3>
          <span className="text-xs font-mono text-on-surface-variant bg-black/5 px-2 py-1 rounded border border-black/10">剩余 6 个</span>
        </div>

        <div className="space-y-3">
          <TaskCard 
            icon={<Brain />}
            title="细胞分裂的五个阶段"
            time="5 分钟"
            due="今天到期"
            color="bg-tertiary/20 border-tertiary/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            iconColor="text-tertiary"
          />
          <TaskCard 
            icon={<History />}
            title="工业革命的影响"
            time="8 分钟"
            due="明天到期"
            color="bg-secondary/20 border-secondary/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
            iconColor="text-secondary"
          />
          <TaskCard 
            icon={<Brain />}
            title="量子力学简介"
            time="12 分钟"
            due="明天到期"
            color="bg-primary/20 border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            iconColor="text-primary"
          />
        </div>
      </section>

      {/* Bottom Feedback */}
      <section className="mt-12 relative z-10">
        <div className="glass-panel rounded-3xl p-8 border-dashed border-primary/30 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          <div className="w-16 h-16 bg-success/20 border border-success/30 text-success rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] relative z-10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">复习进度 &gt; 50%!</h3>
            <p className="text-sm text-on-surface-variant max-w-xs mx-auto font-body leading-relaxed">你今天已经复习了 4 个关键概念。保持节奏。</p>
          </div>
          <button className="text-primary font-headline font-bold text-sm hover:text-primary-light transition-colors relative z-10 flex items-center gap-1">
            查看成就徽章 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

const TaskCard = ({ icon, title, time, due, color, iconColor }: any) => (
  <div className="glass-button rounded-2xl p-5 flex items-center gap-4 group cursor-pointer border border-black/5 hover:border-primary/50 hover:bg-primary/5 transition-all">
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border shrink-0", color)}>
      {React.cloneElement(icon, { className: cn("w-6 h-6", iconColor) })}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-headline font-semibold text-on-surface truncate text-base">{title}</h4>
      <div className="flex items-center gap-3 mt-2">
        <span className="flex items-center gap-1 text-xs text-on-surface-variant font-mono">
          <Clock className="w-3 h-3" />
          {time}
        </span>
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border",
          due === 'Due Today' ? "bg-primary/20 text-primary border-primary/30" : "bg-black/5 text-on-surface-variant border-black/10"
        )}>
          {due}
        </span>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
  </div>
);
