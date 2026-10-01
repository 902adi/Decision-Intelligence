import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { 
  FileText, 
  Download, 
  Check, 
  X, 
  Clock, 
  User, 
  Search, 
  RotateCcw, 
  ShieldCheck 
} from 'lucide-react';

export const DecisionLogView: React.FC = () => {
  const { decisions, showToast } = useAppStore();
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDecisions = decisions.filter((d) => {
    const q = searchTerm.toLowerCase();
    return d.actionTitle.toLowerCase().includes(q) || 
           d.officerId.toLowerCase().includes(q) ||
           (d.officerNote && d.officerNote.toLowerCase().includes(q));
  });

  const exportSummary = () => {
    const reportObj = {
      title: 'Rakshak AI - Flood Command Audit Log',
      generatedAt: new Date().toISOString(),
      totalDecisions: decisions.length,
      decisions: decisions,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rakshak_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Decision log exported successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="font-heading font-semibold text-lg text-text">
            {t.officer.decision_log}
          </h2>
          <p className="text-xs text-text-2">
            Immutable Audit Trail of AI Recommendations, Approvals, and Officer Overrides
          </p>
        </div>

        <button
          onClick={exportSummary}
          className="px-4 py-2 rounded-control bg-surface-2 hover:bg-surface border border-line text-text hover:text-accent font-medium text-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.officer.export_log}</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-text-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by action title, officer name, or justification note..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-control bg-surface border border-line text-text placeholder:text-text-2 focus:border-accent"
        />
      </div>

      {/* Decision Log List */}
      <div className="space-y-3">
        {filteredDecisions.length === 0 ? (
          <div className="p-8 rounded-panel bg-surface border border-line text-center text-xs text-text-2">
            No decisions logged yet. Approving or overriding AI actions will populate this audit log.
          </div>
        ) : (
          filteredDecisions.map((dec) => {
            const isApproved = dec.status === 'approved';
            const isOverridden = dec.status === 'overridden';

            return (
              <div 
                key={dec.id}
                className="p-4 sm:p-5 rounded-panel bg-surface border border-line space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-heading font-semibold text-sm text-text block">
                      {dec.actionTitle}
                    </span>
                    <span className="text-[11px] font-mono text-text-2 flex items-center gap-2 mt-0.5">
                      <span>ID: #{dec.id.slice(-6)}</span>
                      <span>&bull;</span>
                      <span>{new Date(dec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-mono font-semibold uppercase flex items-center gap-1 ${
                    isApproved 
                      ? 'bg-low/15 border border-low/30 text-low' 
                      : 'bg-mod/15 border border-mod/30 text-mod'
                  }`}>
                    {isApproved ? <Check className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                    {dec.status}
                  </span>
                </div>

                {/* Impact & Officer Note */}
                <div className="p-3 rounded-control bg-surface-2 border border-line text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-text-2 text-[11px]">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>Officer: <strong>{dec.officerId}</strong></span>
                  </div>
                  {dec.officerNote && (
                    <p className="text-text italic">
                      &ldquo;{dec.officerNote}&rdquo;
                    </p>
                  )}
                  {dec.projectedImpact && (
                    <span className="text-[11px] font-mono text-accent block">
                      Impact: {dec.projectedImpact}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
