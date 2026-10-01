import React, { useState } from 'react';
import { useAppStore, AppMode } from '../../store/useAppStore';
import { useI18n, Language } from '../../i18n';
import { 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  Radio, 
  Smartphone, 
  ShieldAlert,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  LogOut,
  UserCheck
} from 'lucide-react';
import { isSoundMuted, setSoundMuted, playClickSound } from '../../utils/soundEffects';

export const Header: React.FC = () => {
  const { 
    mode, 
    setMode, 
    theme, 
    setTheme, 
    setIsSettingsOpen, 
    setIsTwoDeviceModalOpen,
    isLiveBackend,
    offlineCount,
    isOfficerAuthenticated,
    officerProfile,
    logoutOfficer
  } = useAppStore();
  const { t, language, setLanguage } = useI18n();

  const [soundState, setSoundState] = useState(!isSoundMuted());

  const toggleTheme = (e: React.MouseEvent) => {
    playClickSound();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    
    // View Transitions API if supported
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setTheme(nextTheme);
      });
    } else {
      setTheme(nextTheme);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    playClickSound();
    setLanguage(lang);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-surface/85 border-b border-line transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Wordmark */}
        <div 
          onClick={() => { playClickSound(); setMode('landing'); }}
          className="cursor-pointer group flex flex-col justify-center select-none"
          title="Rakshak Home"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-semibold text-lg sm:text-xl tracking-tight text-text group-hover:text-accent transition-colors">
              Rakshak
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-surface-2 border border-line text-text-2">
              {isLiveBackend ? t.app.live_data : t.app.demo_data}
            </span>
          </div>
          <span className="text-[11px] font-devanagari text-text-2 tracking-wider leading-none">
            रक्षक
          </span>
        </div>

        {/* Center Mode Switcher (Citizen / Officer) */}
        <div className="hidden md:flex items-center bg-surface-2 p-1 rounded-pill border border-line shadow-inner">
          <button
            onClick={() => { playClickSound(); setMode('citizen'); }}
            className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-all duration-200 cursor-pointer ${
              mode === 'citizen'
                ? 'bg-accent text-bg shadow-sm font-semibold'
                : 'text-text-2 hover:text-text hover:bg-surface'
            }`}
          >
            {t.nav.citizen}
          </button>
          <button
            onClick={() => { playClickSound(); setMode('officer'); }}
            className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              mode === 'officer'
                ? 'bg-accent text-bg shadow-sm font-semibold'
                : 'text-text-2 hover:text-text hover:bg-surface'
            }`}
          >
            <span>{t.nav.officer}</span>
            {isOfficerAuthenticated && (
              <span className="w-1.5 h-1.5 rounded-full bg-low animate-ping" />
            )}
          </button>
        </div>

        {/* Right Tools: Officer profile info, Language, Sound FX, Theme, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Officer Auth Badge & Sign Out in Officer View */}
          {mode === 'officer' && isOfficerAuthenticated && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-control bg-accent/10 border border-accent/30 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-accent" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-semibold text-text leading-none">
                  {officerProfile?.name.split(',')[0]}
                </span>
                <span className="text-[9px] font-mono text-text-2">
                  {officerProfile?.badgeId}
                </span>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  logoutOfficer();
                }}
                className="ml-1 p-1 rounded hover:bg-surface text-text-2 hover:text-sos transition-colors cursor-pointer"
                title="Lock Terminal / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Offline indicator if any queued */}
          {offlineCount > 0 && (
            <div 
              className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-pill bg-mod/20 text-mod border border-mod/30"
              title="Items stored offline, will sync when internet is restored"
            >
              <WifiOff className="w-3 h-3" />
              <span>{offlineCount} queued</span>
            </div>
          )}

          {/* Two-Device Demo QR Trigger (Officer view) */}
          <button
            onClick={() => { playClickSound(); setIsTwoDeviceModalOpen(true); }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-control text-xs font-medium bg-surface-2 hover:bg-surface border border-line text-text-2 hover:text-text transition-colors cursor-pointer"
            title="Open Phone Demo QR Code"
          >
            <Smartphone className="w-3.5 h-3.5 text-accent" />
            <span className="hidden lg:inline">{t.officer.two_device_title.split(' ')[0]} Demo</span>
          </button>

          {/* Segmented Pill Language Toggle: EN | हिं | मरा with sliding thumb */}
          <div className="flex items-center bg-surface-2 p-0.5 rounded-pill border border-line">
            {(['en', 'hi', 'mr'] as Language[]).map((lang) => {
              const label = lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मरा';
              const isActive = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2 py-1 text-xs rounded-pill transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-accent text-bg font-semibold shadow-xs' 
                      : 'text-text-2 hover:text-text hover:bg-surface/50'
                  }`}
                  aria-label={`Switch to ${label}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Sound FX Mute/Unmute Toggle */}
          <button
            onClick={() => {
              const nextMute = !isSoundMuted();
              setSoundMuted(nextMute);
              if (!nextMute) playClickSound();
              // Trigger re-render by local state toggle
              setSoundState(!soundState);
            }}
            className="w-9 h-9 rounded-control flex items-center justify-center bg-surface-2 hover:bg-surface border border-line text-text-2 hover:text-text transition-colors focus:ring-2 focus:ring-accent cursor-pointer"
            aria-label="Toggle Sound Effects"
            title={soundState ? 'Sound FX: On' : 'Sound FX: Muted'}
          >
            {soundState ? (
              <Volume2 className="w-4 h-4 text-accent" />
            ) : (
              <VolumeX className="w-4 h-4 text-text-2 opacity-60" />
            )}
          </button>

          {/* Theme Toggle (Sun/Moon with smooth reveal) */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-control flex items-center justify-center bg-surface-2 hover:bg-surface border border-line text-text-2 hover:text-text transition-colors focus:ring-2 focus:ring-accent cursor-pointer"
            aria-label="Toggle light or dark theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-mod transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-accent transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Settings Sheet trigger */}
          <button
            onClick={() => { playClickSound(); setIsSettingsOpen(true); }}
            className="w-9 h-9 rounded-control flex items-center justify-center bg-surface-2 hover:bg-surface border border-line text-text-2 hover:text-text transition-colors focus:ring-2 focus:ring-accent cursor-pointer"
            aria-label="Open settings"
            title={t.settings.title}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
