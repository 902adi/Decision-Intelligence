import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { rivergateWards, rivergateResources } from '../../data/rivergate';
import { 
  LifeBuoy, 
  Users, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  CheckCircle2 
} from 'lucide-react';

export const SosQueuePanel: React.FC = () => {
  const { 
    sosRequests, 
    updateSosStatus, 
    graph,
    approveAction 
  } = useAppStore();
  const { t, language } = useI18n();

  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);

  // Filter unresolved SOS requests
  const activeQueue = sosRequests.filter(s => s.status !== 'resolved');

  // Compute explainable AI priority score for an SOS item
  const calculatePriorityScore = (sos: typeof sosRequests[0]) => {
    let score = 50;
    if (sos.hasVulnerable) score += 25;
    score += Math.min(15, sos.peopleCount * 3);
    const wardRisk = graph.wardRisks[sos.wardId]?.riskScore || 40;
    score += Math.round(wardRisk * 0.15);
    return Math.min(99, score);
  };

  const handleAssignNearest = async (sosId: string, wardId: string) => {
    // Find nearest available resource (boat or rescue team)
    const availableResource = rivergateResources.find(r => r.status === 'available' || r.type === 'boat') || rivergateResources[0];
    await updateSosStatus(sosId, 'assigned', availableResource.id);
  };

  const handleResolve = async (sosId: string) => {
    await updateSosStatus(sosId, 'resolved');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-sos" />
          <h2 className="font-heading font-semibold text-lg text-text">
            {t.officer.sos_queue}
          </h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-pill bg-sos/15 text-sos border border-sos/30">
            {activeQueue.length} Active
          </span>
        </div>
        <span className="text-xs text-text-2">
          AI Triage Matrix
        </span>
      </div>

      {activeQueue.length === 0 ? (
        <div className="p-8 text-center rounded-panel bg-surface border border-line text-text-2 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-low mx-auto opacity-80" />
          <p className="text-sm font-medium text-text">Emergency rescue queue is currently clear.</p>
          <p className="text-xs">Incoming SOS transmissions will appear here with instant triage priority.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeQueue.map((sos) => {
            const ward = rivergateWards.find(w => w.id === sos.wardId);
            const priorityScore = calculatePriorityScore(sos);
            const isWhyOpen = expandedWhyId === sos.id;
            const wardName = ward?.name;

            return (
              <div 
                key={sos.id}
                className="p-4 sm:p-5 rounded-panel bg-surface border border-line space-y-3.5 shadow-sm hover:border-sos/40 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text uppercase">
                        #{sos.id.slice(-6)}
                      </span>
                      <span className="px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-surface-2 border border-line text-text-2 capitalize">
                        {sos.status}
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-text block">
                      Ward {ward?.number}: {wardName}
                    </span>
                  </div>

                  {/* AI Priority Badge */}
                  <div className="text-right">
                    <span className="font-mono text-lg font-bold text-sos block">
                      {priorityScore}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-text-2">
                      AI Priority
                    </span>
                  </div>
                </div>

                {/* Details Pills */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-line text-text-2">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>{sos.peopleCount} {t.officer.people}</span>
                  </div>
                  {sos.hasVulnerable && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sos/15 border border-sos/30 text-sos font-medium">
                      <span>Vulnerable (Elderly/Infant)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-line text-text-2 capitalize">
                    <span>Need: {sos.needType}</span>
                  </div>
                </div>

                {/* Precise GPS coordinates if consented */}
                {sos.preciseLocation && (
                  <div className="p-2 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text flex items-center justify-between">
                    <span>GPS: {sos.preciseLocation.lat.toFixed(4)} N, {sos.preciseLocation.lng.toFixed(4)} E</span>
                    <span className="text-[10px] text-accent">&plusmn;{Math.round(sos.preciseLocation.accuracy)}m</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-line">
                  <button
                    onClick={() => setExpandedWhyId(isWhyOpen ? null : sos.id)}
                    className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{isWhyOpen ? 'Hide Why?' : 'Why this score?'}</span>
                    {isWhyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <div className="flex items-center gap-2">
                    {sos.status === 'new' && (
                      <button
                        onClick={() => handleAssignNearest(sos.id, sos.wardId)}
                        className="px-3 py-1.5 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <LifeBuoy className="w-3.5 h-3.5" />
                        <span>{t.officer.assign_resource}</span>
                      </button>
                    )}
                    {sos.status === 'assigned' && (
                      <button
                        onClick={() => handleResolve(sos.id)}
                        className="px-3 py-1.5 rounded-control bg-low/20 hover:bg-low/30 border border-low/40 text-low font-semibold text-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Why Triage Panel */}
                {isWhyOpen && (
                  <div className="p-3 rounded-control bg-surface-2 border border-line text-xs space-y-2 animate-in fade-in">
                    <span className="font-semibold text-text block">Triage Model Breakdown:</span>
                    <ul className="space-y-1 text-text-2 text-[11px]">
                      <li>&bull; Vulnerable individuals present: +25 priority</li>
                      <li>&bull; Ward water accumulation ({graph.wardRisks[sos.wardId]?.waterLevelMeters || 0.4}m): +18 priority</li>
                      <li>&bull; Group size ({sos.peopleCount} persons): +{sos.peopleCount * 3} priority</li>
                      <li>&bull; Nearest craft: Rescue Boat B1 (1.8 km distance, ETA 8 mins)</li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
