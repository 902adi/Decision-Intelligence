import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ShieldCheck, ArrowRight, Fingerprint, CloudLightning, Shield, Radio, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound, playAlertChime } from '../../utils/soundEffects';
import { playCalmDistantThunder } from '../weather/thunderAudio';
import { AnimatedBackground } from '../common/AnimatedBackground';

export const OfficerSignInPage: React.FC = () => {
  const { loginOfficer, setMode } = useAppStore();

  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [selectedRole, setSelectedRole] = useState<'commissioner' | 'commander' | 'logistics'>('commissioner');
  const [enableStorm, setEnableStorm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: 'commissioner', label: 'Commissioner', title: 'Relief Commissioner', code: 'RDMA-7492' },
    { id: 'commander', label: 'Commander', title: 'Incident Commander', code: 'CMD-3381' },
    { id: 'logistics', label: 'Logistics', title: 'Supply Chief', code: 'LOG-9104' },
  ] as const;

  const toggleStorm = () => {
    playClickSound();
    const next = !enableStorm;
    setEnableStorm(next);
    if (next) {
      playCalmDistantThunder();
    }
  };

  const enter = (asDemo = false) => {
    playClickSound();
    setIsLoading(true);
    const activeRoleObj = roles.find(r => r.id === selectedRole)!;

    setTimeout(() => {
      playAlertChime();
      loginOfficer({
        name: asDemo ? (name.trim() || 'Dr. Vikramaditya Patil, IAS') : (name.trim() || 'Duty Officer'),
        badgeId: asDemo ? activeRoleObj.code : (badge.trim() || activeRoleObj.code),
        role: activeRoleObj.title,
        station: 'Rivergate Central EOC',
      });
    }, 850);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-bg relative overflow-hidden">
      {/* Dynamic Rain and Thunderstorm Ambient Background */}
      <AnimatedBackground 
        rainfallMmH={enableStorm ? 160 : 40} 
        section="officer" 
        enableThunderstorm={enableStorm} 
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-surface/90 backdrop-blur-xl border border-line/90 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Glowing Top Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-accent via-accent-2 to-accent w-full" />

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface/95 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-2 border-line border-t-accent shadow-[0_0_20px_rgba(127,181,176,0.5)]"
              />
              <div className="text-center space-y-1">
                <p className="text-xs font-mono font-bold text-accent uppercase tracking-wider">Verifying Security Clearance</p>
                <p className="text-[11px] text-text-2 font-mono">Connecting Rivergate EOC Decisive Node...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-7 sm:p-8 space-y-6">
          {/* Header with Storm FX Switch */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-widest">
                  Command Room Terminal
                </span>
              </div>
              <h1 className="font-heading font-black text-2xl text-text tracking-tight pt-1">
                RAKSHAK
              </h1>
              <p className="text-xs text-text-2">
                Authorized disaster response officers & incident leads.
              </p>
            </div>

            {/* Storm FX Toggle Switch */}
            <motion.button
              onClick={toggleStorm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-control border transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-semibold ${
                enableStorm
                  ? 'bg-accent/15 text-accent border-accent/40 shadow-xs'
                  : 'bg-surface-2 text-text-2 border-line hover:text-text'
              }`}
              title="Toggle Thunderstorm Effects"
            >
              <CloudLightning className={`w-3.5 h-3.5 ${enableStorm ? 'text-accent animate-pulse' : 'text-text-2'}`} />
              <span className="hidden sm:inline">{enableStorm ? 'Storm: ON' : 'Storm: OFF'}</span>
            </motion.button>
          </div>

          {/* Role selector toggle pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-text-2 block uppercase tracking-wider">
              Assigned Operational Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-surface-2 p-1 rounded-control border border-line">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { playClickSound(); setSelectedRole(r.id); }}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-accent text-bg shadow-sm font-bold'
                        : 'text-text-2 hover:text-text hover:bg-surface/60'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs text-text-2 font-medium">Officer Name or Call Sign</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dr. Vikramaditya Patil, IAS"
                className="w-full px-3.5 py-2.5 rounded-control bg-bg/90 border border-line hover:border-accent/40 text-text text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-2 font-medium">Badge ID / Passcode</label>
              <input
                type="text"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder={roles.find(r => r.id === selectedRole)?.code || 'RDMA-7492'}
                className="w-full px-3.5 py-2.5 rounded-control bg-bg/90 border border-line hover:border-accent/40 text-text text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            <motion.button
              onClick={() => enter(false)}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 py-3 rounded-control bg-accent hover:bg-accent/90 text-bg font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-glow active:scale-[0.98] disabled:opacity-50"
            >
              <span>Access Command Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[10px] text-text-2 font-mono uppercase tracking-wider">Fast Track Demo</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {/* Quick Demo Button with interactive hover */}
          <motion.button
            onClick={() => enter(true)}
            disabled={isLoading}
            whileHover={{ scale: 1.01, borderColor: 'var(--accent)' }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2.5 rounded-control bg-surface-2/80 hover:bg-surface-2 border border-line text-text text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Fingerprint className="w-4 h-4 text-accent" />
            <span>Instant RDMA Clearance (One-Click)</span>
          </motion.button>

          {/* Back link */}
          <p className="text-center pt-1">
            <button
              onClick={() => { playClickSound(); setMode('citizen'); }}
              className="text-xs text-text-2 hover:text-accent transition-colors cursor-pointer"
            >
              ← Return to Citizen Safe View
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
