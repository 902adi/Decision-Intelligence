import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Activity, ShieldAlert, ArrowRight, Clock, AlertTriangle, CheckCircle2, Droplets } from 'lucide-react';

export const RippleFeed: React.FC = () => {
  const { graph } = useAppStore();

  return (
    <div className="p-4 sm:p-5 rounded-panel bg-surface border border-line space-y-3.5 shadow-calm card-3d">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent animate-pulse" />
          <h3 className="font-heading font-semibold text-sm text-text">
            Live Cause & Effect Chain
          </h3>
        </div>
        <span className="text-[11px] font-mono text-text-2">
          Instant Flood Reactions
        </span>
      </div>

      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {graph.rippleFeed.map((item, idx) => {
          const stepColor = 
            item.step === 'risk' ? 'text-crit border-crit/30 bg-crit/10' :
            item.step === 'allocation' ? 'text-accent border-accent/30 bg-accent/10' :
            item.step === 'routing' ? 'text-mod border-mod/30 bg-mod/10' :
            'text-accent-2 border-accent-2/30 bg-accent-2/10';

          return (
            <div 
              key={item.id}
              className="p-3 rounded-control bg-surface-2 border border-line text-xs space-y-1.5 transition-all hover:border-accent/40"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold ${stepColor}`}>
                  Step {idx + 1}: {item.step}
                </span>
                <span className="text-[10px] font-mono text-text-2">{item.timestamp}</span>
              </div>
              <p className="text-text leading-relaxed font-sans">
                {item.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
