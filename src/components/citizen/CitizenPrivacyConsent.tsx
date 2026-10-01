import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { ShieldCheck, Check, Lock, MapPin, Clock } from 'lucide-react';

export const CitizenPrivacyConsent: React.FC = () => {
  const { userHasConsented, setConsent } = useAppStore();
  const { t } = useI18n();

  if (userHasConsented) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div className="w-full max-w-lg bg-surface border border-line rounded-panel shadow-calm p-6 text-text space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 id="consent-title" className="font-heading font-semibold text-lg text-text">
              {t.citizen.privacy_title}
            </h2>
            <p className="text-xs text-text-2">
              {t.citizen.privacy_desc}
            </p>
          </div>
        </div>

        {/* Protection Points */}
        <div className="space-y-3.5 text-xs text-text-2">
          <div className="flex items-start gap-3 p-3 rounded-control bg-surface-2 border border-line">
            <Lock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-text block mb-0.5">Anonymous Access</strong>
              <span>{t.citizen.privacy_point1}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-control bg-surface-2 border border-line">
            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-text block mb-0.5">Protected Location</strong>
              <span>{t.citizen.privacy_point2}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-control bg-surface-2 border border-line">
            <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-text block mb-0.5">Automatic Data Purge</strong>
              <span>{t.citizen.privacy_point3}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setConsent(true)}
          className="w-full py-3 px-4 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
        >
          <Check className="w-4 h-4" />
          <span>{t.citizen.privacy_agree_btn}</span>
        </button>
      </div>
    </div>
  );
};
