import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { rivergateRoads, rivergateCamps, rivergateWards } from '../../data/rivergate';
import { Navigation, AlertTriangle, CheckCircle2, Building2, Ban, ShieldCheck } from 'lucide-react';

export const EvacuationView: React.FC = () => {
  const { graph } = useAppStore();

  const floodedRoads = rivergateRoads.filter(r => graph.roadsStatus[r.id]?.isFlooded);
  const openRoads = rivergateRoads.filter(r => !graph.roadsStatus[r.id]?.isFlooded);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h2 className="font-heading font-semibold text-lg text-text">
            Evacuation Corridors & Shelter Intake
          </h2>
          <p className="text-xs text-text-2">
            Active Road Graph Status & Safe Transit Corridors to Relief Camps
          </p>
        </div>
      </div>

      {/* Camp Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {rivergateCamps.map((camp) => {
          const status = graph.campsStatus[camp.id];
          const pct = status ? status.occupancyPercent : 45;
          const hostWard = rivergateWards.find(w => w.id === camp.wardId);

          return (
            <div key={camp.id} className="p-4 rounded-panel bg-surface border border-line space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-sm text-text">
                  {camp.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-surface-2 border border-line text-accent">
                  W{hostWard?.number}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-2">Occupancy</span>
                  <span className="text-text font-bold">{status?.occupancy} / {camp.totalCapacity} ({pct}%)</span>
                </div>
                <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 80 ? 'bg-crit' : pct > 60 ? 'bg-mod' : 'bg-low'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Road Inundation & Blockage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flooded / Impassable Roads */}
        <div className="p-5 rounded-panel bg-surface border border-line space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-crit">
            <Ban className="w-4 h-4" />
            <h3 className="font-heading font-semibold text-sm text-text">
              Impassable Roadways ({floodedRoads.length})
            </h3>
          </div>

          {floodedRoads.length === 0 ? (
            <p className="text-xs text-text-2">All primary arterial highways and bridges are currently clear.</p>
          ) : (
            <div className="space-y-2">
              {floodedRoads.map((road) => (
                <div key={road.id} className="p-3 rounded-control bg-crit/10 border border-crit/30 text-xs space-y-1">
                  <span className="font-semibold text-text block">{road.name}</span>
                  <div className="flex justify-between text-[11px] text-crit font-mono">
                    <span>Threshold: {road.floodThresholdMm}mm</span>
                    <span>Water: {graph.roadsStatus[road.id]?.currentWaterMm}mm</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear / Safe Corridors */}
        <div className="p-5 rounded-panel bg-surface border border-line space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-low">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="font-heading font-semibold text-sm text-text">
              Open Safe Corridors ({openRoads.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {openRoads.map((road) => (
              <div key={road.id} className="p-3 rounded-control bg-surface-2 border border-line text-xs flex items-center justify-between">
                <span className="font-medium text-text">{road.name}</span>
                <span className="font-mono text-[11px] text-low">Clear & Dry</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
