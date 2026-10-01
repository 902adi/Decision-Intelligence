import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { 
  SplitSquareVertical, 
  Sparkles, 
  Clock, 
  Users, 
  Package, 
  ShieldCheck, 
  TrendingDown, 
  ArrowRight 
} from 'lucide-react';

export const ScenarioLab: React.FC = () => {
  const { graph } = useAppStore();
  const { t } = useI18n();

  const aiPeopleAtRisk = graph.peopleAtRiskCount;
  const manualPeopleAtRisk = Math.round(aiPeopleAtRisk * 2.4 + 11500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h2 className="font-heading font-semibold text-lg text-text">
            {t.officer.scenario_lab}
          </h2>
          <p className="text-xs text-text-2">
            Side-by-Side Simulation: Rakshak AI Decision Intelligence vs Reactive Manual Protocol
          </p>
        </div>
      </div>

      {/* Side by Side Comparative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Plan A: AI Optimized Plan */}
        <div className="p-5 sm:p-6 rounded-panel bg-surface border-2 border-accent space-y-5 shadow-calm relative">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-semibold text-base text-accent">
                {t.officer.ai_plan}
              </h3>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-pill bg-accent/20 text-accent font-semibold">
              Proactive (T-2h)
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Projected Citizens at Risk</span>
              <span className="font-mono text-xl font-bold text-accent">
                {aiPeopleAtRisk.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Average Dispatch Response Time</span>
              <span className="font-mono text-xl font-bold text-accent">
                14 mins
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Camp Supplies Preserved</span>
              <span className="font-mono text-xl font-bold text-accent">
                84%
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Safe Road Corridors Maintained</span>
              <span className="font-mono text-xl font-bold text-accent">
                9 of 13 roads
              </span>
            </div>
          </div>

          <div className="p-3 rounded-control bg-accent/10 border border-accent/30 text-xs text-accent space-y-1">
            <strong className="block font-semibold">Preemptive Reallocation:</strong>
            <p className="text-text-2 leading-relaxed">
              Diverts dewatering pumps to Mill Gate & Old Fort 90 minutes before river overflow, keeping elevated flyovers dry.
            </p>
          </div>
        </div>

        {/* Plan B: Manual Reactive Plan */}
        <div className="p-5 sm:p-6 rounded-panel bg-surface border border-line space-y-5 shadow-calm opacity-90">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-text-2" />
              <h3 className="font-heading font-semibold text-base text-text">
                {t.officer.manual_plan}
              </h3>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-pill bg-surface-2 text-text-2 font-semibold">
              Reactive (Post-overflow)
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Projected Citizens at Risk</span>
              <span className="font-mono text-xl font-bold text-crit">
                {manualPeopleAtRisk.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Average Dispatch Response Time</span>
              <span className="font-mono text-xl font-bold text-mod">
                58 mins
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Camp Supplies Preserved</span>
              <span className="font-mono text-xl font-bold text-mod">
                46%
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-surface-2 border border-line flex items-center justify-between">
              <span className="text-xs text-text-2">Safe Road Corridors Maintained</span>
              <span className="font-mono text-xl font-bold text-crit">
                4 of 13 roads
              </span>
            </div>
          </div>

          <div className="p-3 rounded-control bg-surface-2 border border-line text-xs space-y-1">
            <strong className="block font-semibold text-text">Delayed Reaction Hazard:</strong>
            <p className="text-text-2 leading-relaxed">
              Units dispatched only after 112 call backlog peaks. Causeway R7 submerges with trapped civilian traffic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
