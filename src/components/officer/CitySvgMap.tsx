import React, { useState } from 'react';
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
// (no icon imports needed — map header is minimal)


import { GoogleMapsView } from './GoogleMapsView';

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

  const getRiskFill = (category: string, isSelected: boolean) => {
    switch (category) {
      case 'crit': return isSelected ? 'rgba(196, 99, 110, 0.65)' : 'rgba(196, 99, 110, 0.45)';
      case 'high': return isSelected ? 'rgba(214, 141, 99, 0.60)' : 'rgba(214, 141, 99, 0.40)';
      case 'mod': return isSelected ? 'rgba(212, 176, 108, 0.55)' : 'rgba(212, 176, 108, 0.35)';
      default: return isSelected ? 'rgba(120, 182, 151, 0.50)' : 'rgba(120, 182, 151, 0.25)';
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

  return (
    <div className="bg-surface border border-line rounded-xl p-4 space-y-3 shadow-sm relative">
      {/* Minimal Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text">Live City Map</span>
        {/* Map / Satellite toggle */}
        <div className="flex bg-surface-2 p-0.5 rounded-lg border border-line text-[11px] font-medium">
          <button
            onClick={() => setMapMode('vector')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              mapMode === 'vector' ? 'bg-accent text-bg font-semibold' : 'text-text-2 hover:text-text'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              mapMode === 'satellite' ? 'bg-accent text-bg font-semibold' : 'text-text-2 hover:text-text'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {mapMode === 'satellite' ? (
        <GoogleMapsView />
      ) : (
        /* SVG Canvas Map */
        <div className="relative aspect-[4/3] w-full bg-surface-2/60 border border-line rounded-control overflow-hidden select-none">
        <svg 
          viewBox="0 0 850 620" 
          className="w-full h-full"
          role="img"
          aria-label="Map of 12 wards and road network of Rivergate"
        >
          <defs>
            {/* Colorblind safe svg patterns */}
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

          {/* Background grid */}
          <g opacity="0.08" stroke="currentColor">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="620" />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 100} x2="850" y2={i * 100} />
            ))}
          </g>

          {/* Drains */}
          <g stroke="var(--water)" strokeWidth="3" strokeDasharray="6 4" opacity="0.45" fill="none">
            {drainChannels.map((d, i) => (
              <path key={`drain-${i}`} d={d} />
            ))}
          </g>

          {/* River Geometry */}
          <path 
            d={riverPath} 
            fill="none" 
            stroke="var(--water)" 
            strokeWidth={36 + Math.min(20, graph.riverLevelRiseMeters * 6)} 
            strokeLinecap="round"
            opacity="0.3"
          />
          <path 
            d={riverPath} 
            fill="none" 
            stroke="var(--water)" 
            strokeWidth={18 + Math.min(10, graph.riverLevelRiseMeters * 3)} 
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* 12 Ward Polygons */}
          <g>
            {rivergateWards.map((w) => {
              const risk = graph.wardRisks[w.id] || { riskScore: 20, riskCategory: 'low' };
              const isSelected = selectedWardId === w.id;
              const isHovered = hoveredWardId === w.id;
              const isHotspot = hotspotWardId === w.id;
              const strokeColor = getRiskStroke(risk.riskCategory);
              const fillColor = getRiskFill(risk.riskCategory, isSelected || isHovered);

              return (
                <g 
                  key={w.id} 
                  className="cursor-pointer transition-opacity duration-200"
                  onClick={() => setSelectedWardId(w.id)}
                  onMouseEnter={() => setHoveredWardId(w.id)}
                  onMouseLeave={() => setHoveredWardId(null)}
                >
                  <polygon
                    points={w.svgPolygon}
                    fill={fillColor}
                    stroke={isSelected ? 'var(--text)' : strokeColor}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                    strokeDasharray={isSelected ? '4 2' : 'none'}
                    className="transition-all duration-300"
                  />

                  {/* Colorblind overlay if turned on */}
                  {colorblindSafe && (
                    <polygon
                      points={w.svgPolygon}
                      fill={
                        risk.riskCategory === 'crit' ? 'url(#pattern-cross-crit)' :
                        risk.riskCategory === 'high' ? 'url(#pattern-stripes-high)' :
                        risk.riskCategory === 'mod' ? 'url(#pattern-stripes-mod)' : 'url(#pattern-dots)'
                      }
                      opacity="0.45"
                      pointerEvents="none"
                    />
                  )}

                  {/* Hotspot Pulse ring if simulated */}
                  {isHotspot && (
                    <circle
                      cx={w.centroid.x}
                      cy={w.centroid.y}
                      r="32"
                      fill="none"
                      stroke="var(--crit)"
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Ward Label: Number + short name + risk score */}
                  <text
                    x={w.centroid.x}
                    y={w.centroid.y - 8}
                    textAnchor="middle"
                    fill="var(--text)"
                    fontSize="10.5"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                    className="pointer-events-none"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  >
                    W{w.number}
                  </text>
                  <text
                    x={w.centroid.x}
                    y={w.centroid.y + 5}
                    textAnchor="middle"
                    fill="var(--text-2)"
                    fontSize="8.5"
                    fontWeight="500"
                    fontFamily="Inter, sans-serif"
                    className="pointer-events-none"
                    style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                  >
                    {w.name.length > 9 ? w.name.slice(0, 9) + '…' : w.name}
                  </text>
                  <text
                    x={w.centroid.x}
                    y={w.centroid.y + 17}
                    textAnchor="middle"
                    fill={isSelected || isHovered ? strokeColor : 'var(--text-2)'}
                    fontSize="9"
                    fontWeight="800"
                    fontFamily="JetBrains Mono, monospace"
                    className="pointer-events-none"
                    opacity={isSelected || isHovered ? 1 : 0.7}
                  >
                    {risk.riskScore}%
                  </text>
                </g>
              );
            })}
          </g>

          {/* Road Network & Flooded Road markers */}
          {showRoads && (
            <g>
              {rivergateRoads.map((road) => {
                const status = graph.roadsStatus[road.id] || { isFlooded: false };
                const isFlooded = status.isFlooded;
                const pathStr = `M ${road.pathPoints.map(p => p.join(',')).join(' L ')}`;

                return (
                  <g key={road.id}>
                    <path
                      d={pathStr}
                      fill="none"
                      stroke={isFlooded ? 'var(--crit)' : 'var(--text-2)'}
                      strokeWidth={isFlooded ? 2.5 : 1.5}
                      strokeDasharray={isFlooded ? '4 3' : 'none'}
                      opacity={isFlooded ? 0.9 : 0.4}
                    />
                    {isFlooded && (
                      <circle
                        cx={(road.pathPoints[0][0] + road.pathPoints[1][0]) / 2}
                        cy={(road.pathPoints[0][1] + road.pathPoints[1][1]) / 2}
                        r="6"
                        fill="var(--crit)"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Active Evacuation Route for selected ward */}
          {selectedWardId && graph.evacuationRoutes[selectedWardId] && (
            <g>
              <path
                d={`M ${graph.evacuationRoutes[selectedWardId].pathCoordinates.map(p => p.join(',')).join(' L ')}`}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                className="animate-pulse"
                opacity="0.9"
              />
            </g>
          )}

          {/* Relief Camps Markers */}
          {showCamps && (
            <g>
              {rivergateCamps.map((camp) => (
                <g key={camp.id} transform={`translate(${camp.coordinates.x}, ${camp.coordinates.y})`}>
                  <circle r="14" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
                  <rect x="-6" y="-6" width="12" height="12" fill="var(--accent)" rx="2" />
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fill="var(--text)"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                    className="drop-shadow-xs"
                  >
                    {camp.code}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Assets & Resources Markers */}
          {showResources && (
            <g>
              {rivergateResources.filter(r => r.status === 'deployed').map((res) => {
                const wardObj = rivergateWards.find(w => w.id === res.assignedWardId);
                if (!wardObj) return null;
                const offsetX = res.type === 'pump' ? -14 : res.type === 'boat' ? 14 : 0;
                const offsetY = res.type === 'rescue_team' ? 14 : -14;

                return (
                  <circle
                    key={res.id}
                    cx={wardObj.centroid.x + offsetX}
                    cy={wardObj.centroid.y + offsetY}
                    r="4"
                    fill="var(--accent-2)"
                    stroke="var(--surface)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          )}

          {/* Incident Reports Pins */}
          {showReports && (
            <g>
              {incidentReports.map((rep, idx) => {
                const w = rivergateWards.find(w => w.id === rep.wardId);
                if (!w) return null;
                const offset = (idx % 3) * 8 - 8;
                return (
                  <g key={rep.id} transform={`translate(${w.centroid.x + offset}, ${w.centroid.y - 18})`}>
                    <circle r="5" fill={rep.status === 'verified' ? 'var(--high)' : 'var(--mod)'} stroke="var(--surface)" strokeWidth="1" />
                  </g>
                );
              })}
            </g>
          )}

          {/* SOS Pins */}
          {showSos && (
            <g>
              {sosRequests.filter(s => s.status !== 'resolved').map((sos, idx) => {
                const w = rivergateWards.find(w => w.id === sos.wardId);
                if (!w) return null;
                return (
                  <g key={sos.id} transform={`translate(${w.centroid.x + 12}, ${w.centroid.y - 12})`}>
                    <circle r="7" fill="var(--sos)" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                    <circle r="5" fill="var(--sos)" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 right-3 p-2.5 rounded-control bg-surface/90 backdrop-blur-md border border-line shadow-calm text-[10px] space-y-1.5 pointer-events-none">
          <p className="font-semibold text-text-2 uppercase tracking-wide text-[9px]">Risk Level</p>
          {[
            { color: 'var(--low)',  label: 'Safe' },
            { color: 'var(--mod)',  label: 'Watch' },
            { color: 'var(--high)', label: 'High' },
            { color: 'var(--crit)', label: 'Critical' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border border-white/10" style={{ background: item.color }} />
              <span className="text-text-2">{item.label}</span>
            </div>
          ))}
          <div className="border-t border-line/60 pt-1.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-text-2 opacity-40" />
              <span className="text-text-2">Open road</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5" style={{ background: 'var(--crit)', border: 'none' }} />
              <span className="text-text-2">Flooded road</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5" style={{ background: 'var(--water)', opacity: 0.8 }} />
              <span className="text-text-2">River / drain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'var(--accent)' }} />
              <span className="text-text-2">Evacuation route</span>
            </div>
          </div>
        </div>

        {/* Floating Selected Ward Quick Action */}
        {selectedWardId && (() => {
          const sw = rivergateWards.find(w => w.id === selectedWardId);
          const risk = graph.wardRisks[selectedWardId];
          return (
            <div className="absolute bottom-3 left-3 p-3 rounded-control bg-surface/95 backdrop-blur-md border border-line shadow-calm text-xs space-y-2 w-44">
              <div>
                <p className="font-semibold text-text leading-tight">Ward {sw?.number}: {sw?.name}</p>
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
                  <span className="font-mono text-[10px] font-bold text-text">{risk?.riskScore || 0}</span>
                </div>
                <p className="text-[10px] text-text-2 mt-0.5">Water: {risk?.waterLevelMeters || 0}m • Elev: {sw?.elevation}m</p>
              </div>
              <button
                onClick={() => setHotspotWard(hotspotWardId === selectedWardId ? null : selectedWardId)}
                className={`w-full py-1.5 rounded-control text-[10px] font-medium border transition-colors cursor-pointer ${
                  hotspotWardId === selectedWardId
                    ? 'bg-crit text-white border-crit'
                    : 'bg-surface-2 border-line hover:border-crit hover:text-crit'
                }`}
              >
                {hotspotWardId === selectedWardId ? 'Reset Flood Sim' : '⚡ Simulate Flood'}
              </button>
            </div>
          );
        })()}
      </div>
      )}
    </div>
  );
};
