import React from 'react';
import { cn } from '@/src/types';
import { 
  Compass, 
  Map as MapIcon, 
  History, 
  User, 
  Bell, 
  Coins,
  Menu,
  BookOpen
} from 'lucide-react';
import { View } from '@/src/types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  coins?: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onViewChange,
  title = "Learn a Bit",
  showBack = false,
  onBack,
  coins = 1240
}) => {
  return (
    <div className="min-h-[100dvh] bg-black/5 dark:bg-black/90 flex items-center justify-center sm:p-4">
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[850px] sm:max-h-[90vh] bg-surface relative flex flex-col sm:rounded-[2.5rem] sm:border-[8px] border-black/10 dark:border-white/10 shadow-2xl overflow-hidden selection:bg-primary/30">
        {/* Top App Bar */}
        <header className="absolute top-0 left-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-black/5 px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <Menu className="w-6 h-6 text-on-surface" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden border border-black/10 shadow-sm shrink-0">
                <img 
                  src="https://picsum.photos/seed/user123/100/100" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <span className="font-headline font-black text-gradient text-lg tracking-tight truncate max-w-[120px]">
              {title}
            </span>
          </div>

          {/* Center Coins Balance */}
          {!showBack && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 glass-button rounded-full shadow-sm shrink-0">
              <Coins className="w-4 h-4 text-secondary fill-secondary" />
              <span className="font-mono font-bold text-on-surface text-xs">{coins.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <Bell className="w-5 h-5 text-on-surface-variant hover:text-on-surface transition-colors" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-[68px] pb-[88px]">
          {children}
        </main>

        {/* Bottom Nav Bar */}
        <nav className="absolute bottom-0 left-0 w-full z-40 px-2 pb-6 pt-2 bg-surface/80 backdrop-blur-2xl border-t border-black/5 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] flex justify-around items-center">
          <NavItem 
            active={currentView === 'explore' || currentView === 'lesson' || currentView === 'quiz'} 
            icon={<Compass />} 
            label="探索" 
            onClick={() => onViewChange('explore')} 
          />
          <NavItem 
            active={currentView === 'map'} 
            icon={<MapIcon />} 
            label="地图" 
            onClick={() => onViewChange('map')} 
          />
          <NavItem 
            active={currentView === 'review'} 
            icon={<History />} 
            label="复习" 
            onClick={() => onViewChange('review')} 
          />
          <NavItem 
            active={currentView === 'profile'} 
            icon={<User />} 
            label="我的" 
            onClick={() => onViewChange('profile')} 
          />
        </nav>
      </div>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300",
        active ? "text-secondary scale-110" : "text-on-surface-variant/60 hover:text-on-surface"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { 
        className: cn("w-6 h-6 transition-colors duration-300", active && "fill-secondary/20 text-secondary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]") 
      })}
      <span className={cn(
        "font-headline font-bold text-[10px] tracking-widest mt-1 uppercase transition-colors duration-300",
        active ? "text-secondary" : "text-transparent"
      )}>
        {label}
      </span>
    </button>
  );
};
