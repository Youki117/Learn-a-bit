import React from 'react';
import { cn, View } from '@/src/types';
import { Bell, Coins, Compass, History, Map as MapIcon, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayerMeta } from '../context/PlayerMetaContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  onViewChange,
  title = 'Learn a Bit',
  showBack = false,
  onBack,
}) => {
  const { loading, userProfile } = useAuth();
  const { meta } = usePlayerMeta();
  const displayName = userProfile?.display_name || userProfile?.email?.split('@')[0] || '访客';
  const avatarUrl = userProfile?.avatar_url;
  const initials = getInitials(displayName);

  return (
    <div className="min-h-[100dvh] bg-black/5 dark:bg-black/90 flex items-center justify-center sm:p-4">
      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[850px] sm:max-h-[90vh] bg-surface relative flex flex-col sm:rounded-[2.5rem] sm:border-[8px] border-black/10 dark:border-white/10 shadow-2xl overflow-hidden selection:bg-primary/30">
        <header className="absolute top-0 left-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-black/5 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {showBack ? (
              <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors shrink-0">
                <Menu className="w-6 h-6 text-on-surface" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden border border-black/10 shadow-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials || <User className="w-4 h-4" />
                )}
              </div>
            )}
            <span className="font-headline font-black text-gradient text-base sm:text-lg tracking-tight truncate min-w-0">
              {loading ? '加载用户中...' : title}
            </span>
          </div>

          {!showBack && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 glass-button rounded-full shadow-sm shrink-0">
              <Coins className="w-4 h-4 text-secondary fill-secondary" />
              <span className="font-mono font-bold text-on-surface text-xs">{meta.coins.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <Bell className="w-5 h-5 text-on-surface-variant hover:text-on-surface transition-colors" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pt-[76px] pb-[104px]">
          {children}
        </main>

        <nav className="absolute bottom-0 left-0 w-full z-40 px-2 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-2 bg-surface/85 backdrop-blur-2xl border-t border-black/5 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] flex justify-around items-center">
          <NavItem
            active={currentView === 'explore' || currentView === 'lesson' || currentView === 'quiz'}
            icon={<Compass />}
            label="探索"
            onClick={() => onViewChange('explore')}
          />
          <NavItem active={currentView === 'map'} icon={<MapIcon />} label="地图" onClick={() => onViewChange('map')} />
          <NavItem active={currentView === 'review'} icon={<History />} label="复习" onClick={() => onViewChange('review')} />
          <NavItem active={currentView === 'profile'} icon={<User />} label="我的" onClick={() => onViewChange('profile')} />
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300',
        active ? 'text-secondary scale-110' : 'text-on-surface-variant/60 hover:text-on-surface',
      )}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: cn(
          'w-6 h-6 transition-colors duration-300',
          active && 'fill-secondary/20 text-secondary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
        ),
      })}
      <span
        className={cn(
          'font-headline font-bold text-[10px] tracking-widest mt-1 uppercase transition-colors duration-300',
          active ? 'text-secondary' : 'text-transparent',
        )}
      >
        {label}
      </span>
    </button>
  );
};
