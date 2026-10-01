import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { 
  rivergateWards, 
  rivergateRoads, 
  rivergateCamps, 
  rivergateResources, 
  riverPath, 
  drainChannels,
  Ward 
} from '../../data/rivergate';
import { GoogleMapsView } from './GoogleMapsView';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Navigation, 
  LifeBuoy, 
  Building2, 
  AlertTriangle, 
  Zap, 
  Maximize2,
  Info
} from 'lucide-react';
import { playClickSound } from '../../utils/soundEffects';

export const CitySvgMap: React.FC = () => {
  const { 
    graph, 
    selectedWardId, 
    setSelectedWardId, 
    setHotspotWard, 
    hotspotWardId,
    colorblindSafe,
    incidentReports,
    sosRequests,
    citizenCheckins 
  } = useAppStore();
  const { language } = useI18n();

  // Map mode: Vector graph vs Google Maps satellite
  const [mapMode, setMapMode] = useState<'vector' | 'satellite'>('vector');

  // Map layer visibility toggles
  const [showRoads, setShowRoads] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showCamps, setShowCamps] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showSos, setShowSos] = useState(true);
  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);

  const getRiskFill = (category: string, isSelected: boolean, isHovered: boolean) => {
    switch (category) {
      case 'crit': 
        return isSelected ? 'rgba(196, 99, 110, 0.70)' : isHovered ? 'rgba(196, 99, 110, 0.55)' : 'rgba(196, 99, 110, 0.38)';
      case 'high': 
        return isSelected ? 'rgba(214, 141, 99, 0.65)' : isHovered ? 'rgba(214, 141, 99, 0.50)' : 'rgba(214, 141, 99, 0.32)';
      case 'mod': 
        return isSelected ? 'rgba(212, 176, 108, 0.60)' : isHovered ? 'rgba(212, 176, 108, 0.45)' : 'rgba(212, 176, 108, 0.28)';
      default: 
        return isSelected ? 'rgba(120, 182, 151, 0.55)' : isHovered ? 'rgba(120, 182, 151, 0.40)' : 'rgba(120, 182, 151, 0.20)';
    }
  };

  const getRiskStroke = (category: string) => {
    switch (category) {
      case 'crit': return 'var(--crit)';
      case 'high': return 'var(--high)';
      case 'mod': return 'var(--mod)';
      default: return 'var(--low)';
    }
  };

  const activeHoveredWard = rivergateWards.find(w => w.id === hoveredWardId);
  const hoveredRisk = hoveredWardId ? graph.wardRisks[hoveredWardId] : null;

  return (
    <div className="space-y-3">
      {/* ── Minimal Header with Layer Toggles & Mode Switch ────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Live Hydrologic Map
          </span>
          <span className="text-[11px] font-mono text-text-2 hidden sm:inline">
            12 Wards · Rivergate Basin
          </span>
        </div>

        {/* Controls: Layer Toggles & Vector/Satellite switch */}
        <div className="flex items-center gap-1.5">
          {/* Layer toggles */}
          <div className="hidden md:flex items-center bg-surface-2 p-0.5 rounded-pill border border-line text-[10px] font-mono">
            <button
              onClick={() => { playClickSound(); setShowRoads(!showRoads); }}
              className={`px-2 py-0.5 rounded-pill transition-colors cursor-pointer ${
                showRoads ? 'bg-surface text-text font-semibold shadow-xs' : 'text-text-2 hover:text-text opacity-60'
              }`}
              title="Toggle Roads"
            >
              Roads
            </button>
            <button
              onClick={() => { playClickSound(); setShowResources(!showResources); }}
              className={`px-2 py-0.5 rounded-pill transition-colors cursor-pointer ${
                showResources ? 'bg-surface text-accent font-semibold shadow-xs' : 'text-text-2 hover:text-text opacity-60'
              }`}
              title="Toggle Pumps & Boats"
            >
              Assets
            </button>
            <button
              onClick={() => { playClickSound(); setShowCamps(!showCamps); }}
              className={`px-2 py-0.5 rounded-pill transition-colors cursor-pointer ${
                showCamps ? 'bg-surface text-text font-semibold shadow-xs' : 'text-text-2 hover:text-text opacity-60'
              }`}
              title="Toggle Relief Camps"
            >
              Camps
            </button>
            <button
              onClick={() => { playClickSound(); setShowSos(!showSos); }}
              className={`px-2 py-0.5 rounded-pill transition-colors cursor-pointer ${
                showSos ? 'bg-sos text-white font-semibold shadow-xs' : 'text-text-2 hover:text-text opacity-60'
              }`}
              title="Toggle SOS Pins"
            >
              SOS
            </button>
          </div>

          {/* Map / Satellite Toggle */}
          <div className="flex bg-surface-2 p-0.5 rounded-pill border border-line text-[11px] font-medium">
            <button
              onClick={() => { playClickSound(); setMapMode('vector'); }}
              className={`px-2.5 py-0.5 rounded-pill transition-all cursor-pointer ${
                mapMode === 'vector' ? 'bg-accent text-bg font-bold shadow-xs' : 'text-text-2 hover:text-text'
              }`}
            >
              Vector
            </button>
            <button
              onClick={() => { playClickSound(); setMapMode('satellite'); }}
              className={`px-2.5 py-0.5 rounded-pill transition-all cursor-pointer ${
                mapMode === 'satellite' ? 'bg-accent text-bg font-bold shadow-xs' : 'text-text-2 hover:text-text'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {mapMode === 'satellite' ? (
        <div className="h-[340px] sm:h-[370px] rounded-control overflow-hidden border border-line">
          <GoogleMapsView />
        </div>
      ) : (
        /* Shortened & Sleek Vector Canvas Map */
        <div className="relative h-[330px] sm:h-[360px] w-full bg-[#0E1522] border border-line/80 rounded-control overflow-hidden select-none shadow-inner">
          <svg 
            viewBox="0 0 850 600" 
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full"
            role="img"
            aria-label="Interactive map of 12 wards and flood flow"
          >
            <defs>
              {/* Colorblind patterns */}
              <pattern id="pattern-dots" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="var(--low)" />
              </pattern>
              <pattern id="pattern-stripes-mod" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="var(--mod)" strokeWidth="2.5" />
              </pattern>
              <pattern id="pattern-stripes-high" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="var(--high)" strokeWidth="3" />
              </pattern>
              <pattern id="pattern-cross-crit" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 0 5 L 10 5 M 5 0 L 5 10" stroke="var(--crit)" strokeWidth="2" />
              </pattern>
            </defs>

            {/* Subtle cyber grid */}
            <g opacity="0.06" stroke="currentColor">
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="600" />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <line key={`h-${i}`} x1="0" y1={i * 100} x2="850" y2={i * 100} />
              ))}
            </g>

            {/* Drainage Channels */}
            <g stroke="var(--water)" strokeWidth="2.5" strokeDasharray="5 4" opacity="0.35" fill="none">
              {drainChannels.map((d, i) => (
                <path key={`drain-${i}`} d={d} />
              ))}
            </g>

            {/* River Flow Geometry */}
            <path 
              d={riverPath} 
              fill="none" 
              stroke="var(--water)" 
              strokeWidth={32 + Math.min(18, graph.riverLevelRiseMeters * 5)} 
              strokeLinecap="round"
              opacity="0.25"
            />
            <path 
              d={riverPath} 
              fill="none" 
              stroke="var(--water)" 
              strokeWidth={16 + Math.min(8, graph.riverLevelRiseMeters * 2.5)} 
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* 12 Ward Polygons */}
            <g>
              {rivergateWards.map((w) => {
                const risk = graph.wardRisks[w.id] || { riskScore: 20, riskCategory: 'low', waterLevelMeters: 0.1 };
                const isSelected = selectedWardId === w.id;
                const isHovered = hoveredWardId === w.id;
                const isHotspot = hotspotWardId === w.id;
                const strokeColor = getRiskStroke(risk.riskCategory);
                const fillColor = getRiskFill(risk.riskCategory, isSelected, isHovered);

                return (
                  <g 
                    key={w.id} 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => { playClickSound(); setSelectedWardId(w.id); }}
                    onMouseEnter={() => setHoveredWardId(w.id)}
                    onMouseLeave={() => setHoveredWardId(null)}
                  >
                    <polygon
                      points={w.svgPolygon}
                      fill={fillColor}
                      stroke={isSelected ? '#FFFFFF' : strokeColor}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.2}
                      strokeDasharray={isSelected ? '4 2' : 'none'}
                      style={{
                        filter: isHovered || isSelected ? `drop-shadow(0 0 8px ${strokeColor})` : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    />

                    {/* Colorblind overlay */}
                    {colorblindSafe && (
                      <polygon
                        points={w.svgPolygon}
                        fill={
                          risk.riskCategory === 'crit' ? 'url(#pattern-cross-crit)' :
                          risk.riskCategory === 'high' ? 'url(#pattern-stripes-high)' :
                          risk.riskCategory === 'mod' ? 'url(#pattern-stripes-mod)' : 'url(#pattern-dots)'
                        }
                        opacity="0.4"
                        pointerEvents="none"
                      />
                    )}

                    {/* Hotspot Simulation Ring */}
                    {isHotspot && (
                      <circle
                        cx={w.centroid.x}
                        cy={w.centroid.y}
                        r="30"
                        fill="none"
                        stroke="var(--crit)"
                        strokeWidth="2.5"
                        opacity="0.85"
                        className="animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                    )}

                    {/* Ward Labels */}
                    <text
                      x={w.centroid.x}
                      y={w.centroid.y - 7}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="Outfit, sans-serif"
                      className="pointer-events-none"
                      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}
                    >
                      W{w.number}
                    </text>
                    <text
                      x={w.centroid.x}
                      y={w.centroid.y + 5}
                      textAnchor="middle"
                      fill="var(--text-2)"
                      fontSize="8.5"
                      fontWeight="600"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                      className="pointer-events-none"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                    >
                      {w.name.length > 9 ? w.name.slice(0, 8) + '…' : w.name}
                    </text>
                    <text
                      x={w.centroid.x}
                      y={w.centroid.y + 17}
                      textAnchor="middle"
                      fill={isSelected || isHovered ? strokeColor : 'var(--text)'}
                      fontSize="9.5"
                      fontWeight="800"
                      fontFamily="JetBrains Mono, monospace"
                      className="pointer-events-none"
                    >
                      {risk.riskScore}%
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Road Network */}
            {showRoads && (
              <g strokeLinecap="round" strokeLinejoin="round">
                {rivergateRoads.map((r) => {
                  const status = graph.roadsStatus[r.id];
                  const isFlooded = status?.isFlooded;
                  const pointsStr = r.pathPoints.map(p => `${p[0]},${p[1]}`).join(' ');
                  return (
                    <polyline
                      key={r.id}
                      points={pointsStr}
                      fill="none"
                      stroke={isFlooded ? 'var(--crit)' : 'rgba(150, 163, 186, 0.35)'}
                      strokeWidth={isFlooded ? 3 : 1.5}
                      strokeDasharray={isFlooded ? '4 2' : 'none'}
                    />
                  );
                })}
              </g>
            )}

            {/* Relief Camps */}
            {showCamps && (
              <g>
                {rivergateCamps.map((camp) => (
                  <g key={camp.id} transform={`translate(${camp.coordinates.x}, ${camp.coordinates.y})`}>
                    <circle r="7" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" />
                    <circle r="3.5" fill="var(--accent)" />
                  </g>
                ))}
              </g>
            )}

            {/* SOS Active Pins */}
            {showSos && (
              <g>
                {sosRequests.filter(s => s.status !== 'resolved').map((sos) => {
                  const w = rivergateWards.find(w => w.id === sos.wardId);
                  if (!w) return null;
                  return (
                    <g key={sos.id} transform={`translate(${w.centroid.x + 12}, ${w.centroid.y - 12})`}>
                      <circle r="8" fill="var(--sos)" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '1.4s' }} />
                      <circle r="5" fill="var(--sos)" />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Floating Live Ward Hover Tooltip */}
          <AnimatePresence>
            {activeHoveredWard && hoveredRisk && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-3 left-3 p-3 rounded-control bg-surface/95 backdrop-blur-md border border-line shadow-xl text-xs space-y-1.5 w-48 pointer-events-none z-30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-text">
                    Ward {activeHoveredWard.number}: {activeHoveredWard.name}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    hoveredRisk.riskCategory === 'crit' ? 'bg-crit/20 text-crit border-crit/40' :
                    hoveredRisk.riskCategory === 'high' ? 'bg-high/20 text-high border-high/40' :
                    hoveredRisk.riskCategory === 'mod' ? 'bg-mod/20 text-mod border-mod/40' :
                    'bg-low/20 text-low border-low/40'
                  }`}>
                    {hoveredRisk.riskScore}% Risk
                  </span>
                </div>
                <div className="text-[10px] text-text-2 space-y-0.5">
                  <p>Water Level: <strong className="text-text font-mono">{hoveredRisk.waterLevelMeters}m</strong></p>
                  <p>Elevation: <strong className="text-text font-mono">{activeHoveredWard.elevation}m MSL</strong></p>
                  <p>Population: <strong className="text-text font-mono">{activeHoveredWard.population.toLocaleString()}</strong></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Selected Ward Simulation Drawer */}
          {selectedWardId && !activeHoveredWard && (() => {
            const sw = rivergateWards.find(w => w.id === selectedWardId);
            const risk = graph.wardRisks[selectedWardId];
            return (
              <div className="absolute bottom-3 left-3 p-3 rounded-control bg-surface/95 backdrop-blur-md border border-line shadow-xl text-xs space-y-2 w-48 z-30">
                <div>
                  <p className="font-heading font-bold text-text leading-tight">Ward {sw?.number}: {sw?.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1.5 flex-1 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${risk?.riskScore || 0}%`,
                          background: risk?.riskCategory === 'crit' ? 'var(--crit)' :
                                      risk?.riskCategory === 'high' ? 'var(--high)' :
                                      risk?.riskCategory === 'mod'  ? 'var(--mod)'  : 'var(--low)'
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-text">{risk?.riskScore || 0}%</span>
                  </div>
                  <p className="text-[10px] text-text-2 mt-0.5">Water: {risk?.waterLevelMeters || 0}m • Elev: {sw?.elevation}m</p>
                </div>
                <button
                  onClick={() => { playClickSound(); setHotspotWard(hotspotWardId === selectedWardId ? null : selectedWardId); }}
                  className={`w-full py-1.5 rounded-control text-[10px] font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    hotspotWardId === selectedWardId
                      ? 'bg-crit text-white border-crit'
                      : 'bg-surface-2 border-line hover:border-crit hover:text-crit'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  {hotspotWardId === selectedWardId ? 'Reset Hotspot' : 'Simulate Hotspot'}
                </button>
              </div>
            );
          })()}

          {/* Floating Compact Legend */}
          <div className="absolute bottom-3 right-3 p-2 rounded-control bg-surface/90 backdrop-blur-md border border-line shadow-calm text-[9px] font-mono flex items-center gap-2.5 pointer-events-none z-20">
            <span className="flex items-center gap-1 text-text-2">
              <span className="w-2 h-2 rounded-xs bg-low" /> Safe
            </span>
            <span className="flex items-center gap-1 text-text-2">
              <span className="w-2 h-2 rounded-xs bg-mod" /> Watch
            </span>
            <span className="flex items-center gap-1 text-text-2">
              <span className="w-2 h-2 rounded-xs bg-high" /> High
            </span>
            <span className="flex items-center gap-1 text-text-2">
              <span className="w-2 h-2 rounded-xs bg-crit" /> Critical
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
