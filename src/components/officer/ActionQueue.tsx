import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { playClickSound } from '../../utils/soundEffects';

export const ActionQueue: React.FC = () => {
  const { graph, approveAction, officerProfile, showToast } = useAppStore();
  const { actionQueue, verdict } = graph;

  const nowActions = actionQueue?.now || [];
  const nextActions = actionQueue?.next || [];
  const watchActions = actionQueue?.watch || [];

  const handleActionClick = (actionId: string, command: string) => {
    playClickSound();
    showToast(`Dispatch order logged: ${command}`, 'info');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-wider text-text-2 flex items-center gap-1.5 font-semibold">
          <Activity className="w-3.5 h-3.5 text-accent" />
          Action Queue
        </h2>
        <span className="text-[10px] font-mono text-text-2">
          {nowActions.length} NOW · {nextActions.length} NEXT · {watchActions.length} WATCH
        </span>
      </div>

      {/* ── 1. NOW: Immediate No-Regret Actions ───────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-pill bg-crit/15 text-crit border border-crit/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3" />
            NOW (Immediate Execution)
          </span>
          <span className="text-[11px] text-text-2">
            No-regret immediate moves
          </span>
        </div>

        {nowActions.length === 0 ? (
          <div className="p-3 rounded-control bg-surface-2 border border-line text-xs text-text-2 text-center">
            No emergency immediate dispatches required at current rainfall.
          </div>
        ) : (
          nowActions.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-control bg-surface-2 border border-line hover:border-accent/40 transition-colors space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-text leading-snug">
                  {item.command}
                </p>
                <span className="shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                  {item.estimatedImpact}
                </span>
              </div>
              <p className="text-[11px] text-text-2 leading-relaxed">
                {item.reason}
              </p>
            </motion.div>
          ))
        )}
      </div>

      {/* ── 2. NEXT: Scheduled / Staged Actions ───────────────────────── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-pill bg-mod/15 text-mod border border-mod/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            NEXT (Queued / Staged)
          </span>
          <span className="text-[11px] text-text-2">
            Executes once NOW moves reach staging
          </span>
        </div>

        {nextActions.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.01, borderColor: 'var(--accent)' }}
            transition={{ duration: 0.15 }}
            className="p-3 rounded-control bg-surface-2/70 border border-line space-y-1.5 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-text leading-snug">
                {item.command}
              </p>
              {item.scheduledMinutes && (
                <span className="shrink-0 text-[10px] font-mono text-text-2 px-1.5 py-0.5 rounded bg-surface-3 border border-line">
                  T+{item.scheduledMinutes}m
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-2 leading-relaxed">
              {item.reason}
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-accent pt-0.5">
              <span>Impact: {item.estimatedImpact}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 3. WATCH: Trigger-Based Autonomous Rules ──────────────────── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-pill bg-surface-3 text-text-2 border border-line text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3 h-3 text-accent" />
            WATCH (Threshold Triggers)
          </span>
          <span className="text-[11px] text-text-2">
            Auto-executes if conditions breach
          </span>
        </div>

        {watchActions.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.15 }}
            className={`p-3 rounded-control border transition-colors space-y-2 ${
              item.isFired
                ? 'bg-crit/10 border-crit/40'
                : 'bg-surface-2/50 border-line hover:border-accent/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-text leading-snug">
                {item.command}
              </p>
              {item.isFired && (
                <span className="shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-crit text-white animate-pulse">
                  TRIGGERED
                </span>
              )}
            </div>

            {/* Trigger Progress Bar */}
            {item.triggerProgress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-text-2">
                  <span>Trigger proximity:</span>
                  <span className="font-semibold text-text">{item.triggerProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      item.triggerProgress > 80 ? 'bg-crit' : item.triggerProgress > 50 ? 'bg-mod' : 'bg-accent'
                    }`}
                    style={{ width: `${Math.min(100, item.triggerProgress)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
