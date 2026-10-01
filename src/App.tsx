import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { WeatherCanvas } from './components/weather/WeatherCanvas';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenView } from './components/citizen/CitizenView';
import { OfficerLayout } from './components/officer/OfficerLayout';
import { OfficerSignInPage } from './components/officer/OfficerSignInPage';
import { SettingsModal } from './components/common/SettingsModal';
import { HelplinesModal, FloatingSosButton } from './components/common/HelplinesModal';
import { TwoDeviceDemoModal } from './components/common/TwoDeviceDemoModal';
import { CitizenPrivacyConsent } from './components/citizen/CitizenPrivacyConsent';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const { 
    mode, 
    setMode, 
    initSubscriptions, 
    toastMessage, 
    hideToast,
    isOfficerAuthenticated 
  } = useAppStore();

  useEffect(() => {
    // Check URL parameters for direct mobile citizen launch (e.g. ?mode=citizen)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'citizen') {
        setMode('citizen');
      } else if (urlMode === 'officer') {
        setMode('officer');
      }
    }

    // Initialize realtime listeners and offline sync
    const cleanup = initSubscriptions();
    return cleanup;
  }, [initSubscriptions, setMode]);

  return (
    <div className="min-h-screen relative bg-bg text-text transition-colors duration-300 font-sans selection:bg-accent/20 selection:text-accent">
      {/* Signature Feature: Living Weather Canvas */}
      <WeatherCanvas 
        opacity={
          mode === 'landing' ? 1 : 
          mode === 'officer' ? 0.35 : 
          0.15
        } 
      />

      {/* Top Accessible Navigation Header */}
      <Header />

      {/* Main Content Area with Smooth Page Transition Motion */}
      <main id="main-content" className="relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingPage />
            </motion.div>
          )}

          {mode === 'citizen' && (
            <motion.div
              key="citizen"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <CitizenView />
            </motion.div>
          )}

          {mode === 'officer' && (
            <motion.div
              key={isOfficerAuthenticated ? "officer-dashboard" : "officer-signin"}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {isOfficerAuthenticated ? <OfficerLayout /> : <OfficerSignInPage />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Thumb-reachable Floating SOS on every page */}
      <FloatingSosButton />

      {/* Modals & Consent Sheets */}
      <SettingsModal />
      <HelplinesModal />
      <TwoDeviceDemoModal />
      <CitizenPrivacyConsent />

      {/* Soft Toast Notification (calm, non-intrusive) */}
      {toastMessage && (
        <div 
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-control bg-surface border border-line shadow-calm flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2 duration-200 max-w-sm w-full mx-4"
          role="status"
          aria-live="polite"
        >
          {toastMessage.type === 'alert' ? (
            <AlertCircle className="w-4 h-4 text-sos shrink-0" />
          ) : toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-low shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-accent shrink-0" />
          )}
          <span className="text-text font-medium flex-1 leading-tight">{toastMessage.text}</span>
          <button 
            onClick={hideToast}
            className="w-5 h-5 rounded flex items-center justify-center text-text-2 hover:text-text"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
