import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ShieldAlert, 
  TrendingDown, 
  ArrowRight,
  Flame,
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { playClickSound, playAlertChime } from '../../utils/soundEffects';
import { ExplainabilityModal } from './ExplainabilityModal';

export const DecisionBrief: React.FC = () => {
  const { graph, approveAction, overrideAction, officerProfile, showToast } = useAppStore();
  const { verdict, rainfallMmH } = graph;

  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  // Decision clock countdown timer simulation
  const [secondsRemaining, setSecondsRemaining] = useState(verdict ? verdict.actWithinMinutes * 60 : 38 * 60);

  useEffect(() => {
    if (verdict) {
      setSecondsRemaining(verdict.actWithinMinutes * 60);
      setIsApproved(false);
    }
  }, [verdict?.headline, verdict?.actWithinMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!verdict) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleApprove = async () => {
    playClickSound();
    setIsApproved(true);
    // Find top action or execute general verdict
    const topAction = graph.recommendedActions[0];
    if (topAction) {
      await approveAction(topAction.id, officerProfile?.name);
    } else {
      showToast(`Verdict executed: ${verdict.headline}`, 'success');
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    const topAction = graph.recommendedActions[0];
    if (topAction) {
      await overrideAction(topAction.id, overrideReason || 'Officer judgment override', officerProfile?.name);
    }
    setIsOverriding(false);
    showToast(`Decision overridden: Logged to audit record`, 'info');
  };

  // Cost of Delay Bar Calculation
  const maxSafe = Math.max(
    verdict.costOfDelay.now, 
    verdict.costOfDelay.plus15, 
    verdict.costOfDelay.plus30, 
    verdict.costOfDelay.plus60,
    1
  );

  return (
    <>
      <div className="relative overflow-hidden rounded-panel border border-accent/30 bg-gradient-to-br from-surface via-surface to-accent/5 p-4 sm:p-5 shadow-calm">
        {/* Dynamic ambient accent glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

        {/* Top meta strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-accent/15 text-accent border border-accent/30 text-[11px] font-mono font-bold uppercase tracking-wide">
              <Zap className="w-3 h-3" />
              Decisive AI Brief
            </span>

            {/* Confidence Badge */}
            <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-mono font-semibold border flex items-center gap-1 ${
              verdict.confidenceLabel === 'High'
                ? 'bg-low/15 text-low border-low/30'
                : verdict.confidenceLabel === 'Medium'
                ? 'bg-mod/15 text-mod border-mod/30'
                : 'bg-crit/15 text-crit border-crit/30'
            }`}>
              <span>{verdict.confidenceLabel} Confidence</span>
              <span className="opacity-75">· {verdict.confidencePct}% win-rate</span>
            </span>
          </div>

          {/* Decision Clock */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-2 border border-line text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-mod animate-pulse" />
            <span className="text-text-2">Act within:</span>
            <span className={`font-bold tabular-nums ${secondsRemaining < 300 ? 'text-crit font-black' : 'text-text'}`}>
              {timeFormatted} min
            </span>
          </div>
        </div>

        {/* Verdict Headline & Primary Direct Action */}
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-2 block font-medium">Recommended Decision</span>
            <h1 className="text-lg sm:text-xl font-heading font-black text-text tracking-tight leading-snug">
              {verdict.headline}
            </h1>
          </div>

          {/* Primary Action Card */}
          <div className="p-3.5 rounded-control bg-surface-2/90 border border-line space-y-1.5">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <ArrowRight className="w-3 h-3" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-bold text-text leading-snug">
                  {verdict.topActionCommand}
                </p>
                <p className="text-[11px] text-text-2 leading-relaxed mt-0.5">
                  {verdict.topActionReason}
                </p>
              </div>
            </div>
          </div>

          {/* Cost of Delay Comparison (People Kept Safe) */}
          <div className="p-3 rounded-control bg-surface-2/50 border border-line/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-text-2 flex items-center gap-1.5 font-medium">
                <TrendingDown className="w-3.5 h-3.5 text-mod" />
                Cost of Delay (Simulated Safe Outcomes)
              </span>
              <span className="text-[10px] font-mono text-text-2">
                Simulated across {verdict.runsTotal} runs
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Now */}
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-low w-full overflow-hidden" />
                <div className="text-[11px] font-bold font-mono text-low">
                  {verdict.costOfDelay.now.toLocaleString()}
                </div>
                <div className="text-[9px] text-text-2 font-mono uppercase">Act Now</div>
              </div>

              {/* +15 min */}
              <div className="space-y-1">
                <div 
                  className="h-1.5 rounded-full bg-accent/80 mx-auto" 
                  style={{ width: `${Math.round((verdict.costOfDelay.plus15 / maxSafe) * 100)}%` }} 
                />
                <div className="text-[11px] font-bold font-mono text-text">
                  {verdict.costOfDelay.plus15.toLocaleString()}
                </div>
                <div className="text-[9px] text-text-2 font-mono uppercase">+15 min</div>
              </div>

              {/* +30 min */}
              <div className="space-y-1">
                <div 
                  className="h-1.5 rounded-full bg-mod mx-auto" 
                  style={{ width: `${Math.round((verdict.costOfDelay.plus30 / maxSafe) * 100)}%` }} 
                />
                <div className="text-[11px] font-bold font-mono text-mod">
                  {verdict.costOfDelay.plus30.toLocaleString()}
                </div>
                <div className="text-[9px] text-text-2 font-mono uppercase">+30 min</div>
              </div>

              {/* +60 min */}
              <div className="space-y-1">
                <div 
                  className="h-1.5 rounded-full bg-crit mx-auto" 
                  style={{ width: `${Math.round((verdict.costOfDelay.plus60 / maxSafe) * 100)}%` }} 
                />
                <div className="text-[11px] font-bold font-mono text-crit">
                  {verdict.costOfDelay.plus60.toLocaleString()}
                </div>
                <div className="text-[9px] text-text-2 font-mono uppercase">+60 min</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              {/* Approve and Execute Button */}
              <motion.button
                onClick={handleApprove}
                disabled={isApproved}
                whileHover={!isApproved ? { scale: 1.02 } : {}}
                whileTap={!isApproved ? { scale: 0.98 } : {}}
                className={`px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  isApproved
                    ? 'bg-low/20 text-low border border-low/40 cursor-default'
                    : 'bg-accent text-bg hover:bg-accent/90'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproved ? 'Approved & En route' : 'Approve and execute'}</span>
              </motion.button>

              {/* Override Button */}
              <motion.button
                onClick={() => { playClickSound(); setIsOverriding(!isOverriding); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3.5 py-2 rounded-control bg-surface-2 hover:bg-surface-3 text-text-2 hover:text-text text-xs font-medium transition-colors border border-line cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Override</span>
              </motion.button>
            </div>

            {/* Why this decision? Button */}
            <motion.button
              onClick={() => { playClickSound(); setIsWhyModalOpen(true); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3.5 py-2 rounded-control bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold transition-colors border border-accent/30 cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why this decision?</span>
            </motion.button>
          </div>

          {/* Inline Override Form */}
          {isOverriding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleOverrideSubmit}
              className="p-3 rounded-control bg-surface-3 border border-line space-y-2 mt-2"
            >
              <label className="text-[11px] font-mono text-text-2 block">
                Officer Override Reason (Required for audit log)
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g., Ground reconnaissance indicates road R12 cleared; holding pumps at Ward 4"
                className="w-full px-3 py-1.5 rounded-control bg-surface border border-line text-xs text-text focus:outline-none focus:border-accent"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOverriding(false)}
                  className="px-2.5 py-1 text-xs text-text-2 hover:text-text cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-sos text-white text-xs font-semibold rounded-control cursor-pointer"
                >
                  Confirm Override
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>

      {/* Explainability Modal */}
      <ExplainabilityModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
      />
    </>
  );
};
