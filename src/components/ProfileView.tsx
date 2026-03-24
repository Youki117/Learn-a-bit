import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/types';
import { 
  User, 
  Settings, 
  Flame, 
  Zap, 
  Award, 
  ChevronRight,
  LogOut,
  Bell,
  Moon
} from 'lucide-react';

export const ProfileView: React.FC<{ isDarkMode?: boolean; toggleTheme?: () => void }> = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="px-6 max-w-2xl mx-auto space-y-8 pb-32 pt-8 relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <h1 className="font-headline font-extrabold text-3xl text-on-surface">个人资料</h1>
        <button className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-black/5">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* User Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 relative overflow-hidden flex items-center gap-6"
      >
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[2px]">
            <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center overflow-hidden">
              <User className="w-10 h-10 text-on-surface-variant" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-surface border border-black/10 rounded-lg px-2 py-0.5 shadow-lg">
            <span className="font-mono text-[10px] font-bold text-primary">LVL 12</span>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <h2 className="font-headline font-bold text-2xl text-on-surface">Alex Chen</h2>
          <p className="text-on-surface-variant text-sm font-mono mt-1">认知探索者</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <StatCard 
          icon={<Flame className="w-5 h-5 text-error" />}
          label="连续天数"
          value="14"
          color="bg-error/10 border-error/20"
        />
        <StatCard 
          icon={<Zap className="w-5 h-5 text-secondary" />}
          label="总经验值"
          value="12,450"
          color="bg-secondary/10 border-secondary/20"
        />
        <StatCard 
          icon={<Award className="w-5 h-5 text-tertiary" />}
          label="模块"
          value="32"
          color="bg-tertiary/10 border-tertiary/20"
        />
        <StatCard 
          icon={<Brain className="w-5 h-5 text-primary" />}
          label="精通度"
          value="85%"
          color="bg-primary/10 border-primary/20"
        />
      </div>

      {/* Preferences */}
      <section className="space-y-4 relative z-10">
        <h3 className="font-headline font-bold text-on-surface text-xl">偏好设置</h3>
        <div className="glass-panel rounded-3xl overflow-hidden">
          <PreferenceItem icon={<Bell />} label="通知" value="已启用" />
          <div className="h-[1px] bg-black/5 mx-4"></div>
          <PreferenceItem 
            icon={<Moon />} 
            label="深色模式" 
            value={isDarkMode ? "开启" : "关闭"} 
            onClick={toggleTheme}
          />
          <div className="h-[1px] bg-black/5 mx-4"></div>
          <PreferenceItem icon={<LogOut />} label="退出登录" value="" isDestructive />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={cn("glass-panel rounded-2xl p-5 flex flex-col gap-3 border transition-colors", color)}
  >
    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center border border-black/10 shadow-inner">
      {icon}
    </div>
    <div>
      <div className="font-headline font-extrabold text-2xl text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mt-1">{label}</div>
    </div>
  </motion.div>
);

const PreferenceItem = ({ icon, label, value, isDestructive, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-black/5 transition-colors group">
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
        isDestructive ? "bg-error/10 border-error/20 text-error group-hover:bg-error/20" : "bg-black/5 border-black/10 text-on-surface-variant group-hover:text-primary group-hover:border-primary/30"
      )}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <span className={cn(
        "font-headline font-semibold",
        isDestructive ? "text-error" : "text-on-surface"
      )}>{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-sm text-on-surface-variant font-body">{value}</span>}
      <ChevronRight className={cn(
        "w-5 h-5 transition-colors",
        isDestructive ? "text-error/50" : "text-on-surface-variant group-hover:text-primary"
      )} />
    </div>
  </button>
);

const Brain = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);
