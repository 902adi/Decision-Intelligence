import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { rivergateResources, rivergateWards, rivergateDepots } from '../../data/rivergate';
import { LifeBuoy, Droplet, Users, Cross, AlertCircle, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const { graph } = useAppStore();
  const { language } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h2 className="font-heading font-semibold text-lg text-text">
            Emergency Asset & Resource Inventory
          </h2>
          <p className="text-xs text-text-2">
            Pumps, Inflatable Rescue Boats, Swiftwater Squads, and High-Axle Ambulances
          </p>
        </div>
      </div>

      {/* Depots Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rivergateDepots.map((depot) => {
          const ward = rivergateWards.find(w => w.id === depot.wardId);
          const resourcesAtDepot = rivergateResources.filter(r => r.baseDepotId === depot.id);
          const deployedCount = resourcesAtDepot.filter(r => r.status === 'deployed').length;

          return (
            <div key={depot.id} className="p-4 rounded-panel bg-surface border border-line space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-sm text-text">
                  {depot.name}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-pill bg-surface-2 border border-line text-accent">
                  Ward {ward?.number}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-2">
                <span>Total Staged: {resourcesAtDepot.length} units</span>
                <span className="font-mono text-text">Deployed: {deployedCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {rivergateResources.map((res) => {
          const assignedWard = rivergateWards.find(w => w.id === res.assignedWardId);
          const wardRisk = graph.wardRisks[res.assignedWardId]?.riskScore || 20;

          const Icon = 
            res.type === 'pump' ? Droplet :
            res.type === 'boat' ? LifeBuoy :
            res.type === 'rescue_team' ? Users : Cross;

          return (
            <div 
              key={res.id} 
              className="p-4 rounded-panel bg-surface border border-line space-y-3 hover:border-accent/40 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-control bg-surface-2 text-accent flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-text block leading-tight">
                      {res.name}
                    </span>
                    <span className="text-[11px] font-mono text-text-2 block">
                      {res.capacityRate}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-pill text-[10px] font-mono capitalize ${
                  res.status === 'deployed' 
                    ? 'bg-low/20 text-low border border-low/30' 
                    : 'bg-surface-2 text-text-2 border border-line'
                }`}>
                  {res.status}
                </span>
              </div>

              <div className="p-2.5 rounded-control bg-surface-2 border border-line text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-text-2">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>Ward {assignedWard?.number}: {assignedWard?.name}</span>
                </div>
                <span className="font-mono font-bold text-accent text-[11px]">
                  {wardRisk}/100 Risk
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
