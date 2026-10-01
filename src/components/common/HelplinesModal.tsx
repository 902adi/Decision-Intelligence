import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { helplinesData, smartRouterOptions, HelplineItem, SmartRouterOption } from '../../data/helplines';
import { 
  X, 
  PhoneCall, 
  Search, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  ExternalLink,
  AlertTriangle 
} from 'lucide-react';

export const HelplinesModal: React.FC = () => {
  const { isHelplinesOpen, setIsHelplinesOpen, showToast } = useAppStore();
  const { t, language } = useI18n();

  const [activeTab, setActiveTab] = useState<'router' | 'all'>('router');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSituation, setSelectedSituation] = useState<SmartRouterOption | null>(smartRouterOptions[0]);
  const [confirmCallNumber, setConfirmCallNumber] = useState<string | null>(null);

  if (!isHelplinesOpen) return null;

  const handleCallAttempt = (num: string) => {
    setConfirmCallNumber(num);
  };

  const executeCall = (num: string) => {
    setConfirmCallNumber(null);
    showToast(`${t.helplines.demo_call_alert} (${num})`, 'alert');
  };

  const filteredHelplines = helplinesData.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = item.name[language]?.toLowerCase().includes(q) || item.name.en.toLowerCase().includes(q);
    const numMatch = item.number.includes(q);
    const descMatch = item.description[language]?.toLowerCase().includes(q);
    return nameMatch || numMatch || descMatch;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="helplines-heading"
    >
      <div className="w-full max-w-2xl bg-surface border border-line rounded-panel shadow-calm p-5 sm:p-6 text-text space-y-5 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-line pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sos/15 text-sos flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 id="helplines-heading" className="font-heading font-semibold text-lg leading-tight">
                {t.helplines.title}
              </h2>
              <p className="text-xs text-text-2">{t.helplines.last_verified}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHelplinesOpen(false)}
            className="w-8 h-8 rounded-control flex items-center justify-center text-text-2 hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pinned 112 Unified Emergency Bar */}
        <div className="p-3.5 rounded-control bg-sos/10 border border-sos/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-sos tracking-wider">112</span>
            <div>
              <span className="text-sm font-semibold text-text block">
                {helplinesData[0].name[language] || helplinesData[0].name.en}
              </span>
              <span className="text-xs text-text-2 hidden sm:block">
                {t.app.disclaimer}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleCallAttempt('112')}
            className="px-4 py-2 rounded-control bg-sos hover:bg-sos/90 text-white font-semibold text-xs tracking-wide shadow-sos-glow flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            {t.helplines.call_now}
          </button>
        </div>

        {/* Segmented Subtabs: Smart Router vs All Helplines */}
        <div className="flex bg-surface-2 p-1 rounded-pill border border-line shrink-0">
          <button
            onClick={() => setActiveTab('router')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all ${
              activeTab === 'router'
                ? 'bg-accent text-bg font-semibold shadow-xs'
                : 'text-text-2 hover:text-text'
            }`}
          >
            {t.helplines.smart_router_title}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all ${
              activeTab === 'all'
                ? 'bg-accent text-bg font-semibold shadow-xs'
                : 'text-text-2 hover:text-text'
            }`}
          >
            {t.helplines.subtitle}
          </button>
        </div>

        {/* Tab 1: Smart Router "Who should I call?" */}
        {activeTab === 'router' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-2 block">
                {t.helplines.smart_router_prompt}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {smartRouterOptions.map((opt) => {
                  const isSelected = selectedSituation?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedSituation(opt)}
                      className={`p-3 rounded-control text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected 
                          ? 'border-accent bg-accent/10 text-accent shadow-xs' 
                          : 'border-line bg-surface-2 text-text-2 hover:text-text hover:border-text-2/40'
                      }`}
                    >
                      <span className="font-medium text-text block mb-1">
                        {t.helplines[opt.titleKey]}
                      </span>
                      <span className="font-mono text-[11px] text-accent">
                        {opt.recommendedNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Router Guidance Card */}
            {selectedSituation && (
              <div className="p-4 rounded-control bg-surface-2 border border-line space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-text-2 font-mono block">
                      {t.helplines.recommended_number}
                    </span>
                    <span className="text-sm font-semibold text-accent block">
                      {selectedSituation.serviceName[language] || selectedSituation.serviceName.en}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCallAttempt(selectedSituation.recommendedNumber)}
                    className="px-3.5 py-1.5 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {t.helplines.call_now}
                  </button>
                </div>

                {/* What to say */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    {t.helplines.what_to_say}
                  </span>
                  <div className="p-2.5 rounded-md bg-surface border border-line text-xs font-mono text-text italic">
                    {selectedSituation.script[language] || selectedSituation.script.en}
                  </div>
                </div>

                {/* Have ready */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-text flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-low" />
                    {t.helplines.have_ready}
                  </span>
                  <p className="text-text-2 pl-5">
                    {selectedSituation.haveReady[language] || selectedSituation.haveReady.en}
                  </p>
                </div>

                {/* Why this number */}
                <div className="space-y-1 text-xs border-t border-line/60 pt-2 text-text-2">
                  <span className="font-medium text-text block">
                    {t.helplines.why_this_service}
                  </span>
                  <p className="leading-relaxed">
                    {selectedSituation.why[language] || selectedSituation.why.en}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Helplines Directory */}
        {activeTab === 'all' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-text-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emergency services, NDRF, police, ambulance..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-control bg-surface-2 border border-line text-text placeholder:text-text-2 focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Helpline List */}
            <div className="space-y-2">
              {filteredHelplines.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-control bg-surface-2 border border-line flex items-center justify-between gap-3 hover:border-accent/40 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-accent text-sm">
                        {item.number}
                      </span>
                      {item.isDemo && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-mod/20 text-mod border border-mod/30">
                          Demo
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-text block truncate">
                      {item.name[language] || item.name.en}
                    </span>
                    <span className="text-[11px] text-text-2 block line-clamp-1">
                      {item.description[language] || item.description.en}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCallAttempt(item.number)}
                    className="shrink-0 px-3 py-1.5 rounded-control bg-surface border border-line hover:border-accent text-text hover:text-accent font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation step dialog if call button pressed */}
        {confirmCallNumber && (
          <div className="p-4 rounded-control bg-surface-2 border border-accent text-xs space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-2 text-text">
              <AlertTriangle className="w-4 h-4 text-mod shrink-0 mt-0.5" />
              <span>
                {t.helplines.confirm_call} <strong>{confirmCallNumber}</strong>. (In this prototype control room, no real cellular call is placed.)
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmCallNumber(null)}
                className="px-3 py-1.5 rounded-control border border-line bg-surface text-text-2 hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={() => executeCall(confirmCallNumber)}
                className="px-4 py-1.5 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold"
              >
                Simulate Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FloatingSosButton: React.FC = () => {
  const { setIsHelplinesOpen } = useAppStore();

  return (
    <button
      onClick={() => setIsHelplinesOpen(true)}
      className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-pill bg-sos hover:bg-sos/90 text-white font-heading font-semibold text-xs tracking-wider shadow-sos-glow flex items-center gap-2 transition-transform active:scale-95 group focus:ring-4 focus:ring-sos/40"
      aria-label="Emergency Helplines and SOS"
      title="Open Emergency Helplines (112, NDRF, Disaster Services)"
    >
      <PhoneCall className="w-4 h-4 group-hover:animate-bounce" />
      <span>SOS / 112</span>
    </button>
  );
};
