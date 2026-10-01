import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { rivergateWards } from '../../data/rivergate';
import { 
  X, 
  AlertTriangle, 
  Droplets, 
  Ban, 
  Zap, 
  HeartPulse, 
  MapPin, 
  Camera, 
  Send 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportProblemModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { selectedWardId, userAnonId, submitReport } = useAppStore();
  const { t, language } = useI18n();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reportType, setReportType] = useState<'water_rising' | 'road_blocked' | 'power_out' | 'medical'>('water_rising');
  const [wardId, setWardId] = useState(selectedWardId);
  const [note, setNote] = useState('');
  const [hasSimulatedPhoto, setHasSimulatedPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitReport({
      anonUserId: userAnonId,
      type: reportType,
      wardId,
      severity: reportType === 'water_rising' || reportType === 'medical' ? 'severe' : 'moderate',
      note: note.trim() || undefined,
      roundedLocation: `${rivergateWards.find(w => w.id === wardId)?.name} Area`,
      photoUrl: hasSimulatedPhoto ? '/flood_evidence.jpg' : undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  const reportTypes = [
    { id: 'water_rising', label: t.citizen.type_water, icon: Droplets, color: 'text-water' },
    { id: 'road_blocked', label: t.citizen.type_road, icon: Ban, color: 'text-mod' },
    { id: 'power_out', label: t.citizen.type_power, icon: Zap, color: 'text-crit' },
    { id: 'medical', label: t.citizen.type_medical, icon: HeartPulse, color: 'text-sos' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <div className="w-full max-w-md bg-surface border border-line rounded-panel shadow-calm p-5 sm:p-6 text-text space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <div>
              <h2 id="report-title" className="font-heading font-semibold text-base sm:text-lg">
                {t.citizen.report_title}
              </h2>
              <p className="text-xs text-text-2">{t.citizen.report_subtitle}</p>
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

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= num ? 'bg-accent' : 'bg-surface-2'
              }`}
            />
          ))}
        </div>

        {/* Step 1: What is happening? */}
        {step === 1 && (
          <div className="space-y-3">
            <span className="text-xs font-medium text-text-2 block">
              {t.citizen.report_step1}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {reportTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = reportType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setReportType(item.id as any);
                      setStep(2);
                    }}
                    className={`p-3.5 rounded-control border text-left flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'border-accent bg-accent/15 text-accent' 
                        : 'border-line bg-surface-2 text-text hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <span className="text-xs text-text-2">Next &rarr;</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Where? (Ward auto-filled) */}
        {step === 2 && (
          <div className="space-y-4">
            <span className="text-xs font-medium text-text-2 block">
              {t.citizen.report_step2}
            </span>
            <div className="space-y-1.5">
              <label className="text-xs text-text flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent" />
                Select Affected Ward
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-control bg-surface-2 border border-line text-text focus:border-accent"
              >
                {rivergateWards.map((w) => (
                  <option key={w.id} value={w.id}>
                    Ward {w.number}: {language === 'hi' ? w.nameHi : language === 'mr' ? w.nameMr : w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-control border border-line text-xs text-text-2 hover:text-text"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-control bg-accent text-bg font-semibold text-xs shadow-sm"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Note & Optional Photo */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <span className="text-xs font-medium text-text-2 block">
              {t.citizen.report_step3}
            </span>

            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.citizen.report_note_placeholder}
              className="w-full p-3 text-xs rounded-control bg-surface-2 border border-line text-text placeholder:text-text-2 focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            />

            {/* Optional Photo Attachment */}
            <div className="p-3 rounded-control bg-surface-2 border border-dashed border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent" />
                <span className="text-xs text-text-2">
                  {hasSimulatedPhoto ? 'Photo attached (flood_scene.jpg)' : 'Attach camera photo (optional)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasSimulatedPhoto(!hasSimulatedPhoto)}
                className="text-xs text-accent hover:underline font-medium"
              >
                {hasSimulatedPhoto ? 'Remove' : 'Select Photo'}
              </button>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3.5 py-2 rounded-control border border-line text-xs text-text-2 hover:text-text"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-98 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : t.citizen.report_submit_btn}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
