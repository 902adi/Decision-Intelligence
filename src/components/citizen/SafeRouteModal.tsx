import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { rivergateWards, rivergateRoads } from '../../data/rivergate';
import { X, Navigation, CheckCircle2, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeRouteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { selectedWardId, graph } = useAppStore();
  const { t, language } = useI18n();

  if (!isOpen) return null;

  const currentWard = rivergateWards.find(w => w.id === selectedWardId) || rivergateWards[0];
  const route = graph.evacuationRoutes[selectedWardId];
  const wardName = currentWard.name;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-title"
    >
      <div className="w-full max-w-lg bg-surface border border-line rounded-panel shadow-calm p-5 sm:p-6 text-text space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-accent" />
            <div>
              <h2 id="route-title" className="font-heading font-semibold text-base sm:text-lg">
                Safe Evacuation Route
              </h2>
              <p className="text-xs text-text-2">From {wardName} to Safe Relief Camp</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-control flex items-center justify-center text-text-2 hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Highlights Card */}
        {route ? (
          <div className="space-y-4">
            <div className="p-4 rounded-control bg-surface-2 border border-line space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-text-2 uppercase">Destination</span>
                  <span className="text-sm font-semibold text-accent block">{route.campName}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-text block">{route.estimatedWalkMinutes} min</span>
                  <span className="text-[11px] text-text-2">{route.totalDistanceKm} km walking</span>
                </div>
              </div>

              {route.isSafe ? (
                <div className="flex items-center gap-2 p-2 rounded-md bg-low/15 border border-low/30 text-low text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Verified unflooded corridor with elevated pedestrian walkways.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-crit/15 border border-crit/30 text-crit text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Warning: Direct road ({route.blockedRoadName}) is submerged. Follow diversion.</span>
                </div>
              )}
            </div>

            {/* Turn-by-Turn Steps */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-2 block uppercase tracking-wider">
                Turn-by-Turn Safe Instructions
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-control bg-surface-2 border border-line flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-text block mb-0.5">Depart {wardName}</strong>
                    <span className="text-text-2">Move away from riverfront low-points toward the North Ridge Avenue. Do not attempt to wade through water above ankle level.</span>
                  </div>
                </div>

                <div className="p-3 rounded-control bg-surface-2 border border-line flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-text block mb-0.5">Follow Elevated Flyover (R6 / R10)</strong>
                    <span className="text-text-2">Stay along high-grade embankments. Police and volunteers are stationed at checkpoints with drinking water and flashlights.</span>
                  </div>
                </div>

                <div className="p-3 rounded-control bg-surface-2 border border-line flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-text block mb-0.5">Arrive at {route.campName}</strong>
                    <span className="text-text-2">Proceed directly to Intake Gate 2 for registration, dry rations, and medical triage if required.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency note */}
            <div className="p-3 rounded-control bg-surface-2 border border-line text-[11px] text-text-2 flex items-center justify-between">
              <span>If your route becomes cut off by rising water, climb to second floor and trigger SOS immediately.</span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-text-2">
            No route calculated for this ward.
          </div>
        )}
      </div>
    </div>
  );
};
