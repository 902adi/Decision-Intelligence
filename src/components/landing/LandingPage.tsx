import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { rivergateWards } from '../../data/rivergate';
import { 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  LifeBuoy, 
  CheckCircle2, 
  Activity, 
  CloudRain, 
  Camera, 
  Compass, 
  MapPin 
} from 'lucide-react';
import { playClickSound } from '../../utils/soundEffects';

export const LandingPage: React.FC = () => {
  const { setMode, graph, setHotspotWard, setIsHelplinesOpen } = useAppStore();
  const { t } = useI18n();

  const [activeMiniWardId, setActiveMiniWardId] = useState<string>('ward-3');

  const selectedMiniWard = rivergateWards.find(w => w.id === activeMiniWardId) || rivergateWards[2];
  const miniRisk = graph.wardRisks[activeMiniWardId] || { riskScore: 78, waterLevelMeters: 0.95 };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-20 pb-28">
      {/* 1. Hero Section with Aerial Flood Image */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface/90 border border-line backdrop-blur-md text-xs font-mono text-text-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span>AI Flood Decision Intelligence &bull; Rivergate Basin</span>
          </div>

          <h1 className="font-heading font-black text-5xl sm:text-7xl text-text tracking-wider leading-none uppercase">
            RAKSHAK
          </h1>
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <span className="font-devanagari font-black text-2xl sm:text-3xl bg-gradient-to-r from-accent via-accent-2 to-accent bg-clip-text text-transparent tracking-widest leading-normal drop-shadow-[0_0_20px_rgba(127,181,176,0.35)]">
              रक्षक
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-pill bg-accent/15 text-accent border border-accent/30 font-bold uppercase tracking-wider">
              Decisive AI
            </span>
          </div>

          <p className="font-italic-accent text-2xl sm:text-3xl text-text-2 max-w-xl mx-auto leading-relaxed pt-2">
            &ldquo;Decide faster than the water rises.&rdquo;
          </p>
        </div>

        {/* Two Calm Decision Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => { playClickSound(); setMode('citizen'); }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-control bg-accent hover:bg-accent/90 text-bg font-heading font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all card-3d"
          >
            <span>Citizen Mode &mdash; Am I safe right now?</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => { playClickSound(); setMode('officer'); }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-control bg-surface hover:bg-surface-2 border border-line hover:border-accent text-text font-heading font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all card-3d"
          >
            <span>Officer Command &mdash; Send rescue & pumps</span>
          </button>
        </div>

        {/* Visual Hero Image Banner with 3D styling */}
        <div className="pt-4">
          <div className="relative rounded-panel overflow-hidden border border-line shadow-2xl card-3d max-w-2xl mx-auto aspect-video">
            <img 
              src="/images/aerial_flood.jpg" 
              alt="Drone aerial view of coastal flood and emergency response bridge" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-text">
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-pill bg-surface/90 backdrop-blur-md border border-line">
                Live Drone Surveillance &bull; Elevated Bridges Dry
              </span>
              <span className="font-mono text-[11px] text-accent font-semibold">
                Rivergate Safe Corridors
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Mini-Demo: Tap a ward and watch ripple cascade */}
      <section className="p-6 sm:p-8 rounded-panel bg-surface/90 backdrop-blur-md border border-line shadow-calm space-y-6 card-3d">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
            How The AI Helps
          </span>
          <h2 className="font-heading font-semibold text-xl sm:text-2xl text-text">
            Tap an area to see the ripple effect
          </h2>
          <p className="text-xs text-text-2 leading-relaxed">
            When water rises in one area, Rakshak instantly moves pumps, clears dry walking paths, and restocks food shelters.
          </p>
        </div>

        {/* Ward Selector Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {rivergateWards.slice(0, 6).map((w) => {
            const isSelected = activeMiniWardId === w.id;
            const wardRisk = graph.wardRisks[w.id];
            return (
              <button
                key={w.id}
                onClick={() => {
                  playClickSound();
                  setActiveMiniWardId(w.id);
                  setHotspotWard(w.id);
                }}
                className={`px-3 py-1.5 rounded-control text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-accent/20 border-accent text-accent shadow-xs'
                    : 'bg-surface-2 border-line text-text-2 hover:text-text'
                }`}
              >
                Ward {w.number}: {w.name} ({wardRisk?.riskScore || 40} Risk)
              </button>
            );
          })}
        </div>

        {/* 4 Connected Module Cards drifting together */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Module 1: Watch */}
          <div className="p-4 rounded-control bg-surface-2 border border-line space-y-2 card-3d">
            <div className="flex items-center justify-between text-xs text-text-2 font-mono">
              <span className="uppercase font-semibold">1. Watch</span>
              <CloudRain className="w-3.5 h-3.5 text-water" />
            </div>
            <span className="font-heading font-semibold text-sm text-text block">
              {selectedMiniWard.name}
            </span>
            <p className="text-xs text-text-2">
              Water depth: <strong className="font-mono text-text">{miniRisk.waterLevelMeters}m</strong>. Ground elevation is {selectedMiniWard.elevation}m above river.
            </p>
          </div>

          {/* Module 2: Send Help */}
          <div className="p-4 rounded-control bg-surface-2 border border-line space-y-2 card-3d">
            <div className="flex items-center justify-between text-xs text-text-2 font-mono">
              <span className="uppercase font-semibold">2. Send Help</span>
              <LifeBuoy className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-heading font-semibold text-sm text-text block">
              Rescue Boats & Pumps
            </span>
            <p className="text-xs text-text-2">
              Sends 2 dewatering pumps. Lowers flood risk by 24% before homes submerge.
            </p>
          </div>

          {/* Module 3: Safe Path */}
          <div className="p-4 rounded-control bg-surface-2 border border-line space-y-2 card-3d">
            <div className="flex items-center justify-between text-xs text-text-2 font-mono">
              <span className="uppercase font-semibold">3. Safe Path</span>
              <Activity className="w-3.5 h-3.5 text-mod" />
            </div>
            <span className="font-heading font-semibold text-sm text-text block">
              Dry Walking Routes
            </span>
            <p className="text-xs text-text-2">
              Low road is underwater &rarr; routes citizens safely across the high elevated flyover.
            </p>
          </div>

          {/* Module 4: Food & Water */}
          <div className="p-4 rounded-control bg-surface-2 border border-line space-y-2 card-3d">
            <div className="flex items-center justify-between text-xs text-text-2 font-mono">
              <span className="uppercase font-semibold">4. Food & Water</span>
              <ShieldCheck className="w-3.5 h-3.5 text-low" />
            </div>
            <span className="font-heading font-semibold text-sm text-text block">
              Relief Shelters
            </span>
            <p className="text-xs text-text-2">
              Shelter food will last 5 hours &rarr; automatically orders fresh drinking water trucks.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Real Photos & Citizen First Design */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
            Simple for Everyone
          </span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text leading-tight">
            Clear, honest advice when every minute matters
          </h2>
          <p className="text-sm text-text-2 leading-relaxed">
            During floods, people feel frightened and confused. Rakshak avoids complicated technical words and gives you simple, actionable guidance in your own language.
          </p>

          <div className="space-y-2.5 text-xs text-text-2">
            <div className="flex items-start gap-2.5 p-3 rounded-control bg-surface border border-line card-3d">
              <CheckCircle2 className="w-4 h-4 text-low shrink-0 mt-0.5" />
              <span><strong>Works without internet:</strong> Save reports and SOS requests on your phone; they send automatically when signal returns.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-control bg-surface border border-line card-3d">
              <CheckCircle2 className="w-4 h-4 text-low shrink-0 mt-0.5" />
              <span><strong>No password needed:</strong> Anyone can ask for help or report rising water instantly without creating an account.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-control bg-surface border border-line card-3d">
              <CheckCircle2 className="w-4 h-4 text-low shrink-0 mt-0.5" />
              <span><strong>Available in 3 languages:</strong> English, Hindi (हिन्दी), and Marathi (मराठी) with clear Indian disaster helplines.</span>
            </div>
          </div>
        </div>

        {/* Real photo gallery card */}
        <div className="space-y-4">
          <div className="rounded-panel overflow-hidden border border-line shadow-calm card-3d relative aspect-[16/10]">
            <img 
              src="/images/rescue_boat.jpg" 
              alt="Emergency rescue boat in flooded street" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-xs text-text">
              <span className="font-semibold block">Active River Rescue Teams</span>
              <span className="text-[11px] text-text-2">Inflatable boats equipped with life vests and first-aid medics</span>
            </div>
          </div>

          <div className="rounded-panel overflow-hidden border border-line shadow-calm card-3d relative aspect-[16/10]">
            <img 
              src="/images/relief_camp.jpg" 
              alt="Warm indoor community relief shelter" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-xs text-text">
              <span className="font-semibold block">Clean, Organized Community Shelters</span>
              <span className="text-[11px] text-text-2">Fresh drinking water, hot food rations, and dry cots</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-line pt-8 space-y-4 text-center text-xs text-text-2">
        <p className="max-w-xl mx-auto leading-relaxed">
          {t.app.disclaimer}
        </p>
        <div className="flex justify-center gap-6 text-xs text-accent">
          <button onClick={() => setIsHelplinesOpen(true)} className="hover:underline">
            Verified Helplines (112, 108, NDRF)
          </button>
          <span>&bull;</span>
          <button onClick={() => setMode('officer')} className="hover:underline">
            Officer Command Center
          </button>
        </div>
        <p className="text-[11px] text-text-2/60 font-mono">
          Rakshak &copy; 2026 &bull; Designed for Human Decision Intelligence
        </p>
      </footer>
    </div>
  );
};
