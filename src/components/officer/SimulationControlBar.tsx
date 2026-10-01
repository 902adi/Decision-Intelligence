import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  CloudRain, 
  Users, 
  AlertTriangle, 
  LifeBuoy, 
  Building2, 
  Database,
  Volume2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { playPhenomenonSound } from '../../utils/soundEffects';

export const SimulationControlBar: React.FC = () => {
  const { 
    graph, 
    rainfallMmH, 
    setRainfall, 
    timeHour, 
    setTimeHour, 
    isPlayingTime, 
    toggleTimePlay,
    isLiveBackend 
  } = useAppStore();
  const { t } = useI18n();

  // Auto-advance timer when isPlayingTime is true
  useEffect(() => {
    if (!isPlayingTime) return;
    const interval = setInterval(() => {
      const nextHour = (timeHour + 1) % 7;
      setTimeHour(nextHour);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlayingTime, timeHour, setTimeHour]);

  const scenarios = [
    { id: 'normal_day', label: 'Normal Day', rain: 15 },
    { id: 'heavy_rain', label: 'Heavy Rain', rain: 65 },
    { id: 'cloudburst_2am', label: 'Cloudburst at 2 AM', rain: 140 },
    { id: 'dam_release', label: 'Dam Release', rain: 185 },
  ];

  const handleScenarioSelect = (sc: typeof scenarios[0]) => {
    playPhenomenonSound(sc.id as any);
    setRainfall(sc.rain);
  };

  return (
    <div className="space-y-4">
      {/* 1. Calm KPI Row with 3D elevation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users,      bg: 'bg-mod/15',      color: 'text-mod',      label: 'People needing help',          value: graph.peopleAtRiskCount.toLocaleString(), unit: '' },
          { icon: AlertTriangle, bg: 'bg-crit/15',  color: 'text-crit',     label: t.officer.kpi_critical_wards,  value: graph.criticalWardsCount,               unit: '/ 12' },
          { icon: LifeBuoy,   bg: 'bg-accent/15',   color: 'text-accent',   label: t.officer.kpi_assets_active,   value: graph.assetsDeployedCount,              unit: 'units' },
          { icon: Building2,  bg: 'bg-accent-2/15', color: 'text-accent-2', label: t.officer.kpi_camp_capacity,   value: `${graph.campCapacityUsedPercent}%`,     unit: '' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 rounded-panel bg-surface border border-line flex items-center gap-3 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-control ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-text-2 block">{kpi.label}</span>
                <span className={`font-mono text-xl sm:text-2xl font-bold text-text tabular-nums`}>
                  {kpi.value}
                  {kpi.unit && <span className="text-xs text-text-2 font-normal ml-1">{kpi.unit}</span>}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Controls Bar: Scenarios, Rainfall slider, and Time Scrubber */}
      <div className="p-4 sm:p-5 rounded-panel bg-surface border border-line space-y-4 shadow-sm">
        {/* Scenario Pills & Data Source */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-2 uppercase tracking-wider">
              Scenarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {scenarios.map((sc) => {
                const isActive = Math.abs(rainfallMmH - sc.rain) < 15;
                return (
                  <motion.button
                    key={sc.id}
                    onClick={() => handleScenarioSelect(sc)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className={`px-3 py-1 rounded-pill text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-accent text-bg font-semibold shadow-xs'
                        : 'bg-surface-2 border border-line text-text-2 hover:text-text hover:border-accent/40'
                    }`}
                  >
                    {sc.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-2 font-mono">
            <Database className="w-3.5 h-3.5 text-accent" />
            <span>Mode: {isLiveBackend ? 'Live Postgres' : 'Deterministic Sim'}</span>
          </div>
        </div>

        {/* Sliders: Rainfall and Time Scrubber */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Rainfall Intensity Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-text flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-accent" />
                {t.officer.rainfall_intensity}
              </span>
              <span className="font-mono font-bold text-accent tabular-nums">
                {rainfallMmH} mm/h ({graph.riverLevelRiseMeters}m river rise)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={240}
              step={5}
              value={rainfallMmH}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
              aria-label="Rainfall slider"
            />
          </div>

          {/* Time Scrubber (T+0h to T+6h) with play/pause */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-text flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" />
                {t.officer.time_travel}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTimePlay}
                  className="p-1 rounded-md bg-surface-2 hover:bg-surface border border-line text-text flex items-center gap-1 text-[11px]"
                  title={isPlayingTime ? 'Pause timeline' : 'Auto-play timeline projection'}
                >
                  {isPlayingTime ? <Pause className="w-3 h-3 text-mod" /> : <Play className="w-3 h-3 text-accent" />}
                  <span>{isPlayingTime ? 'Pause' : 'Play'}</span>
                </button>
                <span className="font-mono font-bold text-accent tabular-nums">
                  T+{timeHour}h
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={6}
                step={1}
                value={timeHour}
                onChange={(e) => setTimeHour(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
                aria-label="Timeline scrubber"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
