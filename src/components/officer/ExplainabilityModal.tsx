import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Cpu, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Gauge } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { playClickSound } from '../../utils/soundEffects';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({ isOpen, onClose }) => {
  const { graph, showToast } = useAppStore();
  const { verdict } = graph;

  if (!isOpen || !verdict) return null;

  const handleRequestFact = (factLabel: string) => {
    playClickSound();
    showToast(`Dispatch request sent: "${factLabel}"`, 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface border border-line rounded-panel shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-2/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-control bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text flex items-center gap-2">
                  Decision Intelligence Explainability
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-accent/20 text-accent border border-accent/30 font-semibold">
                    Monte Carlo Engine
                  </span>
                </h2>
                <p className="text-xs text-text-2">
                  500 simulations · Non-deterministic parameter perturbation
                </p>
              </div>
            </div>
            <button
              onClick={() => { playClickSound(); onClose(); }}
              className="p-1.5 rounded-control text-text-2 hover:text-text hover:bg-surface-3 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-text">
            
            {/* 1. Simulation Summary */}
            <div className="p-4 rounded-control bg-surface-2 border border-line space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-text-2 font-medium">Simulation Method</span>
                <span className="font-mono text-xs text-accent font-semibold">{verdict.runsTotal} Seeds Tested</span>
              </div>
              <p className="text-xs text-text-2 leading-relaxed">
                Tested 5 candidate disaster-response plans across <strong className="text-text">{verdict.runsTotal} stochastic scenarios</strong> varying rainfall intensity (±20%), drainage blockages (0–35%), river surge multipliers, and citizen report reliability.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 bg-surface-3 rounded-control p-2.5 text-center border border-line">
                  <span className="block text-[10px] text-text-2 uppercase font-mono">Robust Winner</span>
                  <span className="font-bold text-sm text-accent capitalize">{verdict.planId.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex-1 bg-surface-3 rounded-control p-2.5 text-center border border-line">
                  <span className="block text-[10px] text-text-2 uppercase font-mono">Simulation Win-Rate</span>
                  <span className="font-bold text-sm text-text font-mono">
                    {verdict.runsWhereBest} / {verdict.runsTotal} ({verdict.confidencePct}%)
                  </span>
                </div>
                <div className="flex-1 bg-surface-3 rounded-control p-2.5 text-center border border-line">
                  <span className="block text-[10px] text-text-2 uppercase font-mono">Confidence</span>
                  <span className={`font-bold text-sm ${verdict.confidenceLabel === 'High' ? 'text-low' : verdict.confidenceLabel === 'Medium' ? 'text-mod' : 'text-crit'}`}>
                    {verdict.confidenceLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Rejected Alternatives */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-2 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-mod" />
                Why Alternatives Were Rejected
              </h3>
              <div className="space-y-2">
                {verdict.alternativesRejected.map((alt) => (
                  <div key={alt.planId} className="p-3 rounded-control bg-surface-2 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text">{alt.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-3 text-text-2">
                          Avg: {alt.expectedSafe.toLocaleString()} safe
                        </span>
                      </div>
                      <p className="text-xs text-text-2">{alt.reason}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono font-semibold text-crit px-2 py-1 rounded bg-crit/10 border border-crit/30 self-start sm:self-auto">
                      Sub-optimal
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Assumptions with Live vs Demo Tags */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-2 flex items-center gap-1.5 font-medium">
                <Gauge className="w-3.5 h-3.5 text-accent" />
                Model Assumptions & Data Provenance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {verdict.assumptionsUsed.map((assump, idx) => (
                  <div key={idx} className="p-2.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-text-2">{assump.label}</p>
                      <p className="text-xs font-semibold text-text font-mono">{assump.value}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-pill border ${
                      assump.dataType === 'Live data'
                        ? 'bg-low/15 text-low border-low/30'
                        : assump.dataType === 'Estimated'
                        ? 'bg-mod/15 text-mod border-mod/30'
                        : 'bg-surface-3 text-text-2 border-line'
                    }`}>
                      {assump.dataType}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Confidence Boosters (What would increase confidence?) */}
            {verdict.confidenceBoosts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-text-2 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  What Would Increase Decision Confidence?
                </h3>
                <div className="space-y-2">
                  {verdict.confidenceBoosts.map((boost, idx) => (
                    <div key={idx} className="p-3 rounded-control bg-accent/10 border border-accent/30 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-text">{boost.fact}</p>
                        <p className="text-[11px] text-text-2">
                          Increases confidence from <strong className="font-mono text-text">{boost.currentConfidence}%</strong> to <strong className="font-mono text-accent">+{boost.boostedConfidence}%</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleRequestFact(boost.requestLabel)}
                        className="shrink-0 px-3 py-1.5 rounded-control bg-accent text-bg text-xs font-semibold hover:bg-accent/90 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        {boost.requestLabel}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-line bg-surface-2/80 flex items-center justify-between">
            <span className="text-[11px] text-text-2">
              Rakshak AI Decision Intelligence · Model v2.4 (Monte Carlo)
            </span>
            <button
              onClick={() => { playClickSound(); onClose(); }}
              className="px-4 py-1.5 rounded-control bg-surface-3 hover:bg-surface text-xs font-semibold text-text transition-colors border border-line cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
