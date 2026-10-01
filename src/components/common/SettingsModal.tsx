import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { X, Moon, Sun, Type, Volume2, Eye, Shield, Trash2, Info } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen,
    theme,
    setTheme,
    textSize,
    setTextSize,
    calmMode,
    setCalmMode,
    audioAtmosphere,
    setAudioAtmosphere,
    colorblindSafe,
    setColorblindSafe,
    deleteUserData
  } = useAppStore();
  const { t } = useI18n();

  if (!isSettingsOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
    >
      <div className="w-full max-w-md bg-surface border border-line rounded-panel shadow-calm p-5 sm:p-6 text-text space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 id="settings-heading" className="font-heading font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            {t.settings.title}
          </h2>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="w-8 h-8 rounded-control flex items-center justify-center text-text-2 hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme mode */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-2 uppercase tracking-wider block">
            {t.settings.theme}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-control border text-left flex items-center gap-2.5 transition-all ${
                theme === 'dark' 
                  ? 'border-accent bg-accent/10 text-accent font-medium' 
                  : 'border-line bg-surface-2 text-text-2 hover:text-text'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs">{t.settings.dark}</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-control border text-left flex items-center gap-2.5 transition-all ${
                theme === 'light' 
                  ? 'border-accent bg-accent/10 text-accent font-medium' 
                  : 'border-line bg-surface-2 text-text-2 hover:text-text'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-xs">{t.settings.light}</span>
            </button>
          </div>
        </div>

        {/* Text Size Scale */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-2 uppercase tracking-wider block">
            {t.settings.text_size}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'small', label: t.settings.text_small },
              { id: 'normal', label: t.settings.text_normal },
              { id: 'large', label: t.settings.text_large },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => setTextSize(size.id as any)}
                className={`py-2 px-3 rounded-control border text-center transition-all ${
                  textSize === size.id
                    ? 'border-accent bg-accent/10 text-accent font-medium'
                    : 'border-line bg-surface-2 text-text-2 hover:text-text'
                }`}
              >
                <span className="text-xs">{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calm Mode */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5 pr-4">
            <span className="text-sm font-medium block">{t.settings.calm_mode}</span>
            <span className="text-xs text-text-2 block">{t.settings.calm_mode_desc}</span>
          </div>
          <button
            onClick={() => setCalmMode(!calmMode)}
            className={`w-12 h-6 rounded-pill transition-colors p-0.5 border ${
              calmMode ? 'bg-accent border-accent' : 'bg-surface-2 border-line'
            }`}
            aria-pressed={calmMode}
          >
            <div className={`w-5 h-5 rounded-pill bg-bg transition-transform ${calmMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Audio Atmosphere */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5 pr-4">
            <span className="text-sm font-medium block">{t.settings.audio}</span>
            <span className="text-xs text-text-2 block">{t.settings.audio_desc}</span>
          </div>
          <button
            onClick={() => setAudioAtmosphere(!audioAtmosphere)}
            className={`w-12 h-6 rounded-pill transition-colors p-0.5 border ${
              audioAtmosphere ? 'bg-accent border-accent' : 'bg-surface-2 border-line'
            }`}
            aria-pressed={audioAtmosphere}
          >
            <div className={`w-5 h-5 rounded-pill bg-bg transition-transform ${audioAtmosphere ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Colorblind Safe */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5 pr-4">
            <span className="text-sm font-medium block">{t.settings.colorblind}</span>
            <span className="text-xs text-text-2 block">{t.settings.colorblind_desc}</span>
          </div>
          <button
            onClick={() => setColorblindSafe(!colorblindSafe)}
            className={`w-12 h-6 rounded-pill transition-colors p-0.5 border ${
              colorblindSafe ? 'bg-accent border-accent' : 'bg-surface-2 border-line'
            }`}
            aria-pressed={colorblindSafe}
          >
            <div className={`w-5 h-5 rounded-pill bg-bg transition-transform ${colorblindSafe ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Privacy Data Erasure */}
        <div className="border-t border-line pt-4 space-y-2">
          <span className="text-xs font-medium text-text-2 uppercase tracking-wider block">
            {t.citizen.privacy_title}
          </span>
          <p className="text-xs text-text-2 leading-relaxed">
            {t.citizen.privacy_point3}
          </p>
          <button
            onClick={() => {
              if (window.confirm('Delete all your session check-ins and emergency reports on this device?')) {
                deleteUserData();
                setIsSettingsOpen(false);
              }
            }}
            className="w-full py-2.5 px-3 rounded-control border border-line bg-surface-2 hover:bg-sos/10 hover:border-sos/40 text-text-2 hover:text-sos flex items-center justify-center gap-2 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.citizen.delete_my_data}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-control bg-surface-2 border border-line text-[11px] text-text-2 flex items-start gap-2">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>{t.app.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
