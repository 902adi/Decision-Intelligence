import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ShieldCheck, ArrowRight, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound, playAlertChime } from '../../utils/soundEffects';

export const OfficerSignInPage: React.FC = () => {
  const { loginOfficer, setMode } = useAppStore();

  const [name, setName]         = useState('');
  const [badge, setBadge]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const enter = (asDemo = false) => {
    playClickSound();
    setIsLoading(true);
    setTimeout(() => {
      playAlertChime();
      loginOfficer({
        name:    asDemo ? 'Demo Officer' : (name.trim() || 'Duty Officer'),
        badgeId: asDemo ? 'RDMA-0000'   : (badge.trim() || 'OFFICER-01'),
        role:    'Relief Commissioner',
        station: 'Rivergate Central EOC',
      });
    }, 900);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Thin accent top bar */}
        <div className="h-px bg-accent w-full" />

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-2 border-line border-t-accent"
              />
              <p className="text-xs font-mono text-text-2">Verifying clearance…</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8 space-y-7">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span className="text-[11px] font-mono text-accent uppercase tracking-widest">Officer Access</span>
            </div>
            <h2 className="font-heading font-bold text-2xl text-text tracking-tight">Command Room</h2>
            <p className="text-sm text-text-2">Authorized RDMA personnel only.</p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-text-2 font-medium">Name or call sign</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Officer Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-line text-text text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-2 font-medium">Badge / Service ID</label>
              <input
                type="text"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="RDMA-7492"
                className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-line text-text text-sm font-mono focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <button
              onClick={() => enter(false)}
              disabled={isLoading}
              className="w-full mt-1 py-3 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <span>Enter Command Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[11px] text-text-2 font-mono">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {/* Demo button */}
          <button
            onClick={() => enter(true)}
            disabled={isLoading}
            className="w-full py-2.5 rounded-control border border-line hover:border-accent/40 text-text-2 hover:text-text text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Fingerprint className="w-4 h-4 text-accent" />
            <span>Quick demo access</span>
          </button>

          {/* Back link */}
          <p className="text-center">
            <button
              onClick={() => { playClickSound(); setMode('citizen'); }}
              className="text-xs text-text-2 hover:text-accent transition-colors cursor-pointer"
            >
              ← Back to citizen view
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
