import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/types';
import { Sparkles, Lock } from 'lucide-react';

interface MapViewProps {
  activeDomain: string;
  onNodeSelect: (level: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({ activeDomain, onNodeSelect }) => {
  return (
    <div className="flex flex-col min-h-full relative">
      {/* Background Grid/Stars effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

      <div className="sticky top-0 z-40 bg-surface/50 backdrop-blur-xl border-b border-black/5 py-4 px-6 text-center">
        <h2 className="font-headline font-extrabold text-2xl text-gradient">{activeDomain} 地图</h2>
      </div>

      <div className="relative max-w-md mx-auto mt-12 flex flex-col items-center gap-20 pb-20 w-full z-10">
        {/* Glowing Path */}
        <div className="absolute top-10 bottom-10 w-1 bg-black/5 rounded-full z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[150px] primary-gradient rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
        </div>

        <MapNode 
          level={1}
          icon={<Sparkles />}
          title="第一关"
          status="active"
          onClick={() => onNodeSelect(1)}
        />

        <MapNode 
          level={2}
          icon={<Lock />}
          title="未解锁"
          status="locked"
          offset="right"
          onClick={() => {}}
        />

        <MapNode 
          level={3}
          icon={<Lock />}
          title="未解锁"
          status="locked"
          offset="left"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

interface MapNodeProps {
  level: number;
  icon: React.ReactNode;
  title: string;
  status: 'completed' | 'active' | 'locked';
  offset?: 'left' | 'right';
  onClick: () => void;
}

const MapNode: React.FC<MapNodeProps> = ({ icon, title, status, offset, onClick }) => {
  return (
    <motion.div 
      className={cn(
        "relative z-10 flex flex-col items-center gap-4",
        offset === 'left' ? "-translate-x-16" : offset === 'right' ? "translate-x-16" : ""
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div 
        onClick={status === 'active' ? onClick : undefined}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative",
          status === 'active' 
            ? "w-24 h-24 bg-surface border border-black/10 shadow-[0_0_30px_rgba(79,70,229,0.4)] cursor-pointer active:scale-95 group" 
            : "bg-surface-container-high border border-black/5 cursor-not-allowed opacity-50"
        )}
      >
        {/* Active Node Inner Glow */}
        {status === 'active' && (
          <div className="absolute inset-2 rounded-full primary-gradient opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
        )}
        
        {React.cloneElement(icon as React.ReactElement, { 
          className: cn(
            "w-8 h-8 relative z-10 transition-colors duration-300",
            status === 'active' ? "text-secondary w-10 h-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-on-surface-variant"
          ) 
        })}
      </div>

      <div className={cn(
        "px-5 py-2 rounded-full shadow-sm flex flex-col items-center backdrop-blur-md border",
        status === 'active' ? "bg-primary/20 border-primary/30" : "bg-black/5 border-black/5"
      )}>
        <span className={cn(
          "text-xs font-label font-bold uppercase tracking-widest",
          status === 'active' ? "text-on-primary" : "text-on-surface-variant"
        )}>
          {title}
        </span>
      </div>
    </motion.div>
  );
};
