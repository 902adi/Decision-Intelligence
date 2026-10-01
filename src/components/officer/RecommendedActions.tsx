import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Check, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from '../../utils/soundEffects';

export const RecommendedActions: React.FC = () => {
  const { graph, approveAction, overrideAction } = useAppStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [skipId, setSkipId] = useState<string | null>(null);

  const approved = graph.recommendedActions.filter(r => r.status === 'approved').length;
  const total    = graph.recommendedActions.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-text">AI Actions</span>
        </div>
        <span className="text-[10px] font-mono text-text-2">
          {approved}/{total} approved
        </span>
      </div>

      {/* Action list */}
      <div className="space-y-2">
        {graph.recommendedActions.map((rec, idx) => {
          const done      = rec.status === 'approved';
          const skipped   = rec.status === 'overridden';
          const isOpen    = openId === rec.id;

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-xl border transition-colors ${
                done    ? 'border-low/30 bg-low/5 opacity-80'
                : skipped ? 'border-line/30 bg-transparent opacity-50'
                : 'border-line bg-surface hover:border-accent/25'
              }`}
            >
              {/* Main row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Risk reduction chip */}
                <div className={`shrink-0 text-center px-2 py-1 rounded-lg text-[10px] font-mono font-bold ${
                  done ? 'bg-low/15 text-low' : 'bg-accent/10 text-accent'
                }`}>
                  −{rec.projectedRiskReduction}%
                </div>

                {/* Title */}
                <p className="flex-1 text-xs font-medium text-text leading-snug truncate">
                  {rec.title}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {done ? (
                    <span className="text-[10px] font-mono text-low flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : skipped ? (
                    <span className="text-[10px] font-mono text-text-2">Skipped</span>
                  ) : (
                    <>
                      <button
                        onClick={() => { playClickSound(); setSkipId(rec.id); }}
                        className="p-1.5 rounded-lg hover:bg-surface-2 text-text-2 hover:text-sos transition-colors cursor-pointer"
                        title="Skip"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { playClickSound(); approveAction(rec.id); }}
                        className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-bg text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Approve
                      </button>
                    </>
                  )}

                  {/* Why toggle */}
                  <button
                    onClick={() => { playClickSound(); setOpenId(isOpen ? null : rec.id); }}
                    className="p-1.5 rounded-lg hover:bg-surface-2 text-text-2 hover:text-accent transition-colors cursor-pointer"
                  >
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${rec.confidence}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  />
                </div>
                <span className="text-[10px] font-mono text-text-2">{rec.confidence}%</span>
              </div>

              {/* Expandable "Why?" detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line/50 px-4 py-3 space-y-2.5">
                      <p className="text-[11px] text-text-2 leading-relaxed">
                        {rec.description}
                      </p>
                      <p className="text-[11px] text-text-2 italic leading-relaxed">
                        {rec.confidenceNarrative}
                      </p>
                      <div className="space-y-1">
                        {rec.factors.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-text-2">
                            <span className="w-24 truncate">{f.name}</span>
                            <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                              <div className="h-full bg-accent/50 rounded-full" style={{ width: `${f.score}%` }} />
                            </div>
                            <span className="font-mono w-6 text-right">{f.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Skip confirm — inline micro-modal */}
      <AnimatePresence>
        {skipId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface border border-line rounded-2xl p-5 w-full max-w-xs shadow-2xl space-y-4"
            >
              <p className="text-sm font-semibold text-text">Skip this action?</p>
              <p className="text-xs text-text-2">It will be logged in the audit trail.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSkipId(null)}
                  className="flex-1 py-2 rounded-xl border border-line text-text-2 text-xs font-medium hover:text-text transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { overrideAction(skipId, 'Skipped by officer'); setSkipId(null); }}
                  className="flex-1 py-2 rounded-xl bg-surface-2 border border-sos/30 text-sos text-xs font-semibold hover:bg-sos/10 transition-colors cursor-pointer"
                >
                  Yes, skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
