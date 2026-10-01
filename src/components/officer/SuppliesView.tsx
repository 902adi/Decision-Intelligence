import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { rivergateCamps } from '../../data/rivergate';
import { Package, Droplet, Cross, AlertTriangle, Truck, Clock, CheckCircle2 } from 'lucide-react';

export const SuppliesView: React.FC = () => {
  const { graph, approveAction } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h2 className="font-heading font-semibold text-lg text-text">
            Relief Camp Logistics & Stock Burn Rates
          </h2>
          <p className="text-xs text-text-2">
            Dynamic Depletion Velocity & Automated Resupply Triggers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rivergateCamps.map((camp) => {
          const status = graph.campsStatus[camp.id];
          const isCritical = status?.foodHoursLeft < 6 || status?.waterHoursLeft < 6;

          return (
            <div 
              key={camp.id}
              className={`p-5 rounded-panel border space-y-4 shadow-sm transition-colors ${
                isCritical 
                  ? 'border-crit/40 bg-surface' 
                  : 'border-line bg-surface'
              }`}
            >
              {/* Camp Header */}
              <div className="flex items-start justify-between border-b border-line pb-3">
                <div>
                  <span className="font-heading font-semibold text-base text-text block">
                    {camp.name}
                  </span>
                  <span className="text-xs text-text-2">
                    Current Occupancy: <strong>{status?.occupancy || camp.currentOccupancy}</strong> persons
                  </span>
                </div>
                {isCritical ? (
                  <span className="px-2.5 py-1 rounded-pill bg-crit/15 border border-crit/30 text-crit text-xs font-mono font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Resupply Critical
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-pill bg-low/15 border border-low/30 text-low text-xs font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Stock Stable
                  </span>
                )}
              </div>

              {/* 3 Metric Meters */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {/* Food */}
                <div className="p-3 rounded-control bg-surface-2 border border-line space-y-1">
                  <div className="flex items-center gap-1.5 text-text-2">
                    <Package className="w-3.5 h-3.5 text-accent" />
                    <span>Food Packets</span>
                  </div>
                  <span className="font-mono text-base font-bold text-text block">
                    {camp.foodPackets}
                  </span>
                  <span className={`text-[11px] font-mono block ${
                    (status?.foodHoursLeft || 10) < 6 ? 'text-crit font-bold' : 'text-text-2'
                  }`}>
                    ETA: {status?.foodHoursLeft || 8}h left
                  </span>
                </div>

                {/* Water */}
                <div className="p-3 rounded-control bg-surface-2 border border-line space-y-1">
                  <div className="flex items-center gap-1.5 text-text-2">
                    <Droplet className="w-3.5 h-3.5 text-water" />
                    <span>Drinking Water</span>
                  </div>
                  <span className="font-mono text-base font-bold text-text block">
                    {camp.drinkingWaterLiters} L
                  </span>
                  <span className={`text-[11px] font-mono block ${
                    (status?.waterHoursLeft || 10) < 6 ? 'text-crit font-bold' : 'text-text-2'
                  }`}>
                    ETA: {status?.waterHoursLeft || 9}h left
                  </span>
                </div>

                {/* Medical */}
                <div className="p-3 rounded-control bg-surface-2 border border-line space-y-1">
                  <div className="flex items-center gap-1.5 text-text-2">
                    <Cross className="w-3.5 h-3.5 text-mod" />
                    <span>Medical Kits</span>
                  </div>
                  <span className="font-mono text-base font-bold text-text block">
                    {camp.medicalKits}
                  </span>
                  <span className="text-[11px] font-mono text-text-2 block">
                    ETA: {status?.medicalHoursLeft || 14}h left
                  </span>
                </div>
              </div>

              {/* Resupply Recommendation Alert */}
              {status?.recommendedResupply && (
                <div className="p-3 rounded-control bg-surface-2 border border-mod/30 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-mod shrink-0" />
                    <span className="text-text">{status.recommendedResupply}</span>
                  </div>
                  <button
                    onClick={() => approveAction(`rec-supply-${camp.id}`)}
                    className="px-3 py-1 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold text-xs shrink-0"
                  >
                    Dispatch Bowsers
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
