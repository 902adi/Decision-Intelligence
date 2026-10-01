import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { X, Smartphone, ExternalLink, Copy, Check, Radio } from 'lucide-react';

export const TwoDeviceDemoModal: React.FC = () => {
  const { isTwoDeviceModalOpen, setIsTwoDeviceModalOpen, showToast } = useAppStore();
  const { t } = useI18n();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const citizenUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?mode=citizen` 
    : 'http://localhost:5173?mode=citizen';

  useEffect(() => {
    if (!isTwoDeviceModalOpen) return;
    QRCode.toDataURL(citizenUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#141C29',
        light: '#E4E9F2',
      }
    }).then(setQrDataUrl).catch(console.error);
  }, [isTwoDeviceModalOpen, citizenUrl]);

  if (!isTwoDeviceModalOpen) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(citizenUrl);
      setCopied(true);
      showToast('Citizen URL copied to clipboard', 'info');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const openInNewWindow = () => {
    window.open(citizenUrl, 'RakshakCitizenDemo', 'width=430,height=820,menubar=no,toolbar=no');
    showToast('Citizen demo window opened', 'info');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="two-device-heading"
    >
      <div className="w-full max-w-md bg-surface border border-line rounded-panel shadow-calm p-6 text-text space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2 text-left">
            <Smartphone className="w-5 h-5 text-accent" />
            <h2 id="two-device-heading" className="font-heading font-semibold text-base">
              {t.officer.two_device_title}
            </h2>
          </div>
          <button 
            onClick={() => setIsTwoDeviceModalOpen(false)}
            className="w-8 h-8 rounded-control flex items-center justify-center text-text-2 hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-text-2 leading-relaxed text-left">
          {t.officer.two_device_desc}
        </p>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 rounded-control bg-surface-2 border border-line">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="Scan to open Citizen App" 
              className="w-48 h-48 rounded-lg shadow-sm"
            />
          ) : (
            <div className="w-48 h-48 rounded-lg bg-surface flex items-center justify-center text-text-2 text-xs">
              Generating QR...
            </div>
          )}
          <span className="text-[11px] font-mono text-text-2 mt-2">
            Instant peer sync via BroadcastChannel & Realtime
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={openInNewWindow}
            className="py-2.5 px-3 rounded-control bg-accent hover:bg-accent/90 text-bg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.officer.open_window_btn}</span>
          </button>

          <button
            onClick={copyLink}
            className="py-2.5 px-3 rounded-control bg-surface-2 hover:bg-surface border border-line text-text text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-low" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : t.officer.copy_link_btn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
