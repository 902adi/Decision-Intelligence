import React from 'react';
import { useAppStore, OfficerTab } from '../../store/useAppStore';
import { Map, LifeBuoy, CloudRain, FileText, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CitySvgMap } from './CitySvgMap';
import { RecommendedActions } from './RecommendedActions';
import { SosQueuePanel } from './SosQueuePanel';
import { ForecastView } from './ForecastView';
import { DecisionLogView } from './DecisionLogView';
import { AnimatedBackground } from '../common/AnimatedBackground';
import { playClickSound } from '../../utils/soundEffects';


/* ─── Scenario presets ────────────────────────────────────────────── */
import { playPhenomenonSound } from '../../utils/soundEffects';

const SCENARIOS = [
  { id: 'normal_day',      label: 'Normal',      rain: 15  },
  { id: 'heavy_rain',      label: 'Heavy Rain',  rain: 65  },
  { id: 'cloudburst_2am',  label: 'Cloudburst',  rain: 140 },
  { id: 'dam_release',     label: 'Dam Release', rain: 185 },
] as const;

/* ─── Tabs ─────────────────────────────────────────────────────────── */
const TABS: Array<{ id: OfficerTab; label: string; icon: any }> = [
  { id: 'map',     label: 'Map',     icon: Map },
  { id: 'sos',     label: 'SOS',     icon: LifeBuoy },
  { id: 'weather', label: 'Weather', icon: CloudRain },
  { id: 'log',     label: 'Log',     icon: FileText },
];

/* ─── Component ─────────────────────────────────────────────────────── */
export const OfficerLayout: React.FC = () => {
  const {
    officerTab, setOfficerTab,
    sosRequests, officerProfile, logoutOfficer,
    rainfallMmH, setRainfall, graph,
  } = useAppStore();

  const activeSos = sosRequests.filter(s => s.status !== 'resolved').length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-bg relative">
      {/* Ambient background: rain + orbs, dimmed for officer context */}
      <AnimatedBackground rainfallMmH={rainfallMmH} section="officer" />

      {/* ── Top Status Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-line bg-surface/60 backdrop-blur-sm">
        {/* KPIs — just the two numbers that matter most in a crisis */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] text-text-2 uppercase tracking-wider">People at risk</p>
            <p className="font-mono text-lg font-bold text-text tabular-nums leading-tight">
              {graph.peopleAtRiskCount.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-7 bg-line" />
          <div>
            <p className="text-[10px] text-text-2 uppercase tracking-wider">Critical wards</p>
            <p className={`font-mono text-lg font-bold tabular-nums leading-tight ${graph.criticalWardsCount > 0 ? 'text-crit' : 'text-low'}`}>
              {graph.criticalWardsCount}
              <span className="text-xs text-text-2 font-normal"> / 12</span>
            </p>
          </div>
          <div className="w-px h-7 bg-line hidden sm:block" />
          <div className="hidden sm:block">
            <p className="text-[10px] text-text-2 uppercase tracking-wider">Rainfall</p>
            <p className="font-mono text-lg font-bold text-accent tabular-nums leading-tight">
              {rainfallMmH}<span className="text-xs text-text-2 font-normal"> mm/h</span>
            </p>
          </div>
        </div>

        {/* Scenario quick-switch + officer logout */}
        <div className="flex items-center gap-2">
          {/* Scenario pills — desktop only */}
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            {SCENARIOS.map(sc => {
              const isActive = Math.abs(rainfallMmH - sc.rain) < 15;
              return (
                <motion.button
                  key={sc.id}
                  onClick={() => { playClickSound(); playPhenomenonSound(sc.id); setRainfall(sc.rain); }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-2.5 py-1 rounded-pill text-[11px] font-medium transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-accent text-bg border-accent shadow-sm'
                      : 'bg-surface-2 text-text-2 border-line hover:text-text hover:border-accent/30'
                  }`}
                >
                  {sc.label}
                </motion.button>
              );
            })}
          </div>

          {/* Officer name + logout */}
          {officerProfile && (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-medium text-text leading-tight">{officerProfile.name.split(',')[0]}</p>
                <p className="text-[9px] font-mono text-accent">{officerProfile.badgeId}</p>
              </div>
              <button
                onClick={() => { playClickSound(); logoutOfficer(); }}
                className="p-1.5 rounded-control hover:bg-surface-2 text-text-2 hover:text-sos transition-colors cursor-pointer"
                title="Lock Terminal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 relative">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = officerTab === tab.id;
          const hasBadge = tab.id === 'sos' && activeSos > 0;
          return (
            <button
              key={tab.id}
              onClick={() => { playClickSound(); setOfficerTab(tab.id); }}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-t-control ${
                isActive
                  ? 'text-text bg-surface border border-b-0 border-line'
                  : 'text-text-2 hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {hasBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-sos text-white font-mono text-[9px] font-bold">
                  {activeSos}
                </span>
              )}
            </button>
          );
        })}
        {/* Bottom border that the active tab "sits on" */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-line" />
      </div>

      {/* ── Tab Content ────────────────────────────────────────────── */}
      <div className="flex-1 border-t border-line">
        <AnimatePresence mode="wait">
          <motion.div
            key={officerTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {officerTab === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0 h-full">
                {/* Left: Full map */}
                <div className="p-4 lg:border-r border-line">
                  <CitySvgMap />
                </div>
                {/* Right: Slim AI actions panel */}
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-11rem)]">
                  <RecommendedActions />
                </div>
              </div>
            )}

            {officerTab === 'sos' && (
              <div className="p-4 sm:p-6 max-w-3xl mx-auto">
                <SosQueuePanel />
              </div>
            )}

            {officerTab === 'weather' && (
              <div className="p-4 sm:p-6 max-w-3xl mx-auto">
                <ForecastView />
              </div>
            )}

            {officerTab === 'log' && (
              <div className="p-4 sm:p-6 max-w-3xl mx-auto">
                <DecisionLogView />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Mobile Scenario Strip ──────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-3 py-2 flex justify-around">
        {SCENARIOS.map(sc => {
          const isActive = Math.abs(rainfallMmH - sc.rain) < 15;
          return (
            <button
              key={sc.id}
              onClick={() => { playClickSound(); playPhenomenonSound(sc.id); setRainfall(sc.rain); }}
              className={`px-2.5 py-1 rounded-pill text-[10px] font-medium transition-all cursor-pointer border ${
                isActive
                  ? 'bg-accent text-bg border-accent'
                  : 'bg-surface-2 text-text-2 border-line'
              }`}
            >
              {sc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
