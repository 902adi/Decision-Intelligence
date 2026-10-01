import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  /** 0-240 mm/h rainfall drives rain intensity and orb colours */
  rainfallMmH?: number;
  /** Which section this is in — affects orb tint slightly */
  section?: 'citizen' | 'officer';
  /** Force thunderstorm flash effect */
  enableThunderstorm?: boolean;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

export const AnimatedBackground: React.FC<Props> = ({ 
  rainfallMmH = 0, 
  section = 'citizen',
  enableThunderstorm = false
}) => {
  const intensity = Math.min(1, rainfallMmH / 200); // 0..1
  const isStormActive = enableThunderstorm || rainfallMmH >= 110;

  // Lightning flash state
  const [flashKey, setFlashKey] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!isStormActive) return;

    const scheduleNextFlash = () => {
      // Random interval between 5s and 14s
      const delay = 5000 + Math.random() * 9000;
      return setTimeout(() => {
        setIsFlashing(true);
        setFlashKey(prev => prev + 1);
        setTimeout(() => setIsFlashing(false), 600);
        timer = scheduleNextFlash();
      }, delay);
    };

    let timer = scheduleNextFlash();
    return () => clearTimeout(timer);
  }, [isStormActive]);

  /* ── Rain drops ────────────────────────────────────────────────────
     At 0 mm/h → 0 drops. At 200+ mm/h → 45 drops.
  ──────────────────────────────────────────────────────────────────── */
  const drops = useMemo(() => {
    const count = Math.round(lerp(0, 45, intensity));
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 37 + (i % 7) * 11) % 100}%`,
      height: `${lerp(16, 42, Math.random())}px`,
      opacity: lerp(0.15, 0.55, intensity) * (0.6 + Math.random() * 0.4),
      duration: `${lerp(1.6, 0.75, intensity) + Math.random() * 0.5}s`,
      delay: `${(Math.random() * 2).toFixed(2)}s`,
    }));
  }, [intensity]);

  /* ── Orb palette based on rainfall ──────────────────────────────── */
  const orbColor1 = intensity < 0.3
    ? 'rgba(127,181,176,0.07)'
    : intensity < 0.6
    ? 'rgba(94,143,181,0.1)'
    : intensity < 0.85
    ? 'rgba(214,141,99,0.09)'
    : 'rgba(196,99,110,0.12)';

  const orbColor2 = intensity < 0.5
    ? 'rgba(94,143,181,0.06)'
    : 'rgba(140,151,201,0.09)';

  const officerTint = section === 'officer' ? 0.75 : 1;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      style={{ opacity: officerTint }}
    >
      {/* Ambient Lightning Flash Overlay */}
      {isFlashing && (
        <motion.div
          key={flashKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.38, 0.08, 0.52, 0] }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="fixed inset-0 bg-cyan-100/15 backdrop-brightness-125 pointer-events-none z-10 mix-blend-screen"
        />
      )}

      {/* Orb 1 — top-left */}
      <div
        className="bg-orb"
        style={{
          width: '520px',
          height: '520px',
          top: '-120px',
          left: '-80px',
          background: orbColor1,
          animationDuration: `${lerp(18, 10, intensity)}s`,
        }}
      />

      {/* Orb 2 — bottom-right */}
      <div
        className="bg-orb bg-orb-2"
        style={{
          width: '420px',
          height: '420px',
          bottom: '-100px',
          right: '-60px',
          background: orbColor2,
          animationDuration: `${lerp(22, 13, intensity)}s`,
          animationDelay: '3s',
        }}
      />

      {/* Orb 3 — centre-right */}
      {intensity > 0.3 && (
        <div
          className="bg-orb"
          style={{
            width: '300px',
            height: '300px',
            top: '35%',
            right: '15%',
            background: 'rgba(94,143,181,0.07)',
            animationDuration: `${lerp(25, 15, intensity)}s`,
            animationDelay: '7s',
          }}
        />
      )}

      {/* Rain drops */}
      {drops.map(drop => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            height: drop.height,
            opacity: drop.opacity,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
          }}
        />
      ))}
    </div>
  );
};
