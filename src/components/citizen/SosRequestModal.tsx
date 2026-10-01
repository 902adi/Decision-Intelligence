import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { 
  X, 
  PhoneCall, 
  Users, 
  LifeBuoy, 
  Cross, 
  Droplet, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SosRequestModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    selectedWardId, 
    userAnonId, 
    submitSos, 
    activeCitizenSos, 
    updateSosStatus, 
    setIsHelplinesOpen 
  } = useAppStore();
  const { t } = useI18n();

  const [peopleCount, setPeopleCount] = useState(2);
  const [needType, setNeedType] = useState<'rescue' | 'medical' | 'food_water'>('rescue');
  const [hasVulnerable, setHasVulnerable] = useState(false);
  const [shareGps, setShareGps] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen && !activeCitizenSos) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let preciseLocation: { lat: number; lng: number; accuracy: number } | undefined = undefined;
    if (shareGps && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        preciseLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      } catch {
        // Fallback to ward centroid approximation
      }
    }

    await submitSos({
      anonUserId: userAnonId,
      wardId: selectedWardId,
      peopleCount,
      needType,
      hasVulnerable,
      preciseLocation,
    });
    setIsSubmitting(false);
  };

  const handleCancelSos = async () => {
    if (activeCitizenSos) {
      await updateSosStatus(activeCitizenSos.id, 'resolved');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-title"
    >
      <div className="w-full max-w-lg bg-surface border border-line rounded-panel shadow-sos-glow p-5 sm:p-6 text-text space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sos/20 text-sos flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 id="sos-title" className="font-heading font-semibold text-base sm:text-lg text-text">
                {activeCitizenSos ? t.citizen.sos_tracking_title : t.citizen.sos_modal_title}
              </h2>
              <p className="text-xs text-text-2">{t.citizen.sos_modal_desc}</p>
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

        {/* ALWAYS PRESENT 112 DIRECT CALL BACKUP */}
        <div className="p-3 rounded-control bg-sos/15 border border-sos/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-sos" />
            <span className="text-xs text-text font-medium">In critical danger? Dial 112 immediately</span>
          </div>
          <button
            onClick={() => setIsHelplinesOpen(true)}
            className="px-3 py-1.5 rounded-control bg-sos hover:bg-sos/90 text-white font-semibold text-xs shrink-0"
          >
            Call 112
          </button>
        </div>

        {/* IF USER HAS AN ACTIVE SOS -> SHOW LIVE STEP TRACKER */}
        {activeCitizenSos ? (
          <div className="space-y-6 py-2">
            <div className="p-4 rounded-control bg-surface-2 border border-line space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-text-2">
                  Request #{activeCitizenSos.id.slice(-6)}
                </span>
                <span className="px-2 py-0.5 rounded-pill text-[11px] font-semibold bg-accent/20 text-accent border border-accent/30 capitalize">
                  {activeCitizenSos.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress Steps: Received -> Assigned -> En Route -> Resolved */}
              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                {[
                  { id: 'new', label: t.citizen.sos_step_received, time: 'Just now' },
                  { id: 'assigned', label: t.citizen.sos_step_assigned, time: 'Team Alpha Assigned' },
                  { id: 'enroute', label: t.citizen.sos_step_enroute, time: 'Boat en route' },
                  { id: 'resolved', label: t.citizen.sos_step_resolved, time: 'Safe extraction' }
                ].map((step, idx) => {
                  const stepOrder = ['new', 'assigned', 'enroute', 'resolved'];
                  const currentIndex = stepOrder.indexOf(activeCitizenSos.status === 'acknowledged' ? 'assigned' : activeCitizenSos.status);
                  const isDone = idx <= currentIndex;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div key={step.id} className="flex items-center gap-3 relative z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isDone 
                          ? 'bg-accent text-bg shadow-sm' 
                          : 'bg-surface-2 border border-line text-text-2'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <span className={`text-xs block font-medium ${isCurrent ? 'text-accent' : 'text-text'}`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] text-text-2 block">{step.time}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-text-2">Keep your mobile phone dry and volume high.</span>
              <button
                onClick={handleCancelSos}
                className="px-3.5 py-1.5 rounded-control border border-line hover:border-sos text-text-2 hover:text-sos text-xs transition-colors"
              >
                {t.citizen.sos_cancel_btn}
              </button>
            </div>
          </div>
        ) : (
          /* SOS SUBMISSION FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* People count */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" />
                {t.citizen.people_count_label}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, '5+'].map((cnt, i) => {
                  const val = typeof cnt === 'number' ? cnt : 5;
                  const isSelected = peopleCount === val;
                  return (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setPeopleCount(val)}
                      className={`py-2 text-xs font-semibold rounded-control border transition-all ${
                        isSelected 
                          ? 'border-accent bg-accent/15 text-accent' 
                          : 'border-line bg-surface-2 text-text-2 hover:text-text'
                      }`}
                    >
                      {cnt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Need Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-2 block">
                Primary Emergency Need
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNeedType('rescue')}
                  className={`p-2.5 rounded-control border text-left flex flex-col gap-1 transition-all ${
                    needType === 'rescue'
                      ? 'border-accent bg-accent/15 text-accent font-medium'
                      : 'border-line bg-surface-2 text-text-2 hover:text-text'
                  }`}
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span className="text-[11px] leading-tight">{t.citizen.need_rescue}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNeedType('medical')}
                  className={`p-2.5 rounded-control border text-left flex flex-col gap-1 transition-all ${
                    needType === 'medical'
                      ? 'border-accent bg-accent/15 text-accent font-medium'
                      : 'border-line bg-surface-2 text-text-2 hover:text-text'
                  }`}
                >
                  <Cross className="w-4 h-4" />
                  <span className="text-[11px] leading-tight">{t.citizen.need_medical}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNeedType('food_water')}
                  className={`p-2.5 rounded-control border text-left flex flex-col gap-1 transition-all ${
                    needType === 'food_water'
                      ? 'border-accent bg-accent/15 text-accent font-medium'
                      : 'border-line bg-surface-2 text-text-2 hover:text-text'
                  }`}
                >
                  <Droplet className="w-4 h-4" />
                  <span className="text-[11px] leading-tight">{t.citizen.need_food_water}</span>
                </button>
              </div>
            </div>

            {/* Vulnerable check */}
            <label className="flex items-start gap-2.5 p-3 rounded-control bg-surface-2 border border-line cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasVulnerable}
                onChange={(e) => setHasVulnerable(e.target.checked)}
                className="mt-0.5 rounded border-line text-accent focus:ring-accent"
              />
              <span className="text-xs text-text leading-tight">
                {t.citizen.vulnerable_checkbox}
              </span>
            </label>

            {/* GPS Sharing consent */}
            <label className="flex items-start gap-2.5 p-3 rounded-control bg-surface-2 border border-line cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shareGps}
                onChange={(e) => setShareGps(e.target.checked)}
                className="mt-0.5 rounded border-line text-accent focus:ring-accent"
              />
              <div className="space-y-0.5">
                <span className="text-xs text-text font-medium block leading-tight">
                  {t.citizen.gps_checkbox}
                </span>
                <span className="text-[11px] text-text-2 block leading-tight">
                  {t.citizen.gps_explanation}
                </span>
              </div>
            </label>

            {/* Submit SOS button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-control bg-sos hover:bg-sos/95 text-white font-heading font-semibold text-sm tracking-wide shadow-sos-glow flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Alert...' : t.citizen.sos_confirm_btn}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
