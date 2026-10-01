import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Cpu, Radio, Sparkles, CheckCircle2 } from 'lucide-react';

interface RakshakIntroBootProps {
  onComplete: () => void;
}

const BOOT_STEPS = [
  { label: 'Connecting Rivergate Sensor Telemetry...', duration: 400 },
  { label: 'Calibrating 12 City Ward Topography...', duration: 450 },
  { label: 'Spinning 500 Monte Carlo Simulation Kernels...', duration: 500 },
  { label: 'Decisive Flood Intelligence Online.', duration: 350 },
];

export const RakshakIntroBoot: React.FC<RakshakIntroBootProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Step progression
    if (currentStepIndex < BOOT_STEPS.length - 1) {
      timeout = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
        setProgress((prev) => Math.min(95, prev + 26));
      }, BOOT_STEPS[currentStepIndex].duration);
    } else {
      // Final step finish
      timeout = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onComplete, 400);
        }, 300);
      }, BOOT_STEPS[currentStepIndex].duration);
    }

    return () => clearTimeout(timeout);
  }, [currentStepIndex, onComplete]);

  const handleSkip = () => {
    setIsDone(true);
    setTimeout(onComplete, 200);
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070B11] text-text select-none overflow-hidden"
        >
          {/* Background Ambient Radar Glow & Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(127,181,176,0.12)_0%,transparent_70%)] pointer-events-none" />
          
          {/* Subtle animated radar ring */}
          <motion.div
            animate={{ scale: [0.8, 1.4, 2], opacity: [0.3, 0.15, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-96 h-96 rounded-full border border-accent/30 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-6">
            {/* Glowing Logo Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-2xl bg-surface border border-accent/40 shadow-[0_0_40px_-5px_rgba(127,181,176,0.4)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-accent/10" />
                <Shield className="w-10 h-10 text-accent relative z-10" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 rounded-3xl border border-accent/20 border-t-accent/60 pointer-events-none"
              />
            </motion.div>

            {/* Brand Titles */}
            <div className="space-y-1.5">
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="font-heading text-2xl font-black tracking-tight text-white">
                  रक्षक
                </span>
                <span className="text-accent/60 font-mono">·</span>
                <span className="font-heading text-2xl font-extrabold tracking-widest text-accent uppercase">
                  RAKSHAK
                </span>
              </motion.div>
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-[11px] font-mono uppercase tracking-widest text-text-2"
              >
                AI Flood Decision Intelligence
              </motion.p>
            </div>

            {/* Boot Progress Bar */}
            <div className="w-full space-y-2 pt-2">
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent via-accent-2 to-accent rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </div>

              {/* Status Step Label */}
              <div className="h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="text-[11px] font-mono text-accent/90 truncate"
                  >
                    {BOOT_STEPS[currentStepIndex].label}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Skip action */}
            <button
              onClick={handleSkip}
              className="text-[10px] font-mono text-text-2 hover:text-accent transition-colors pt-2 cursor-pointer uppercase tracking-wider"
            >
              [ Press anywhere to enter ]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
