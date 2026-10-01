import { create } from 'zustand';
import { runDecisionPipeline, DecisionGraphState } from '../engine/pipeline';
import { 
  IncidentReport, 
  SosRequest, 
  CitizenCheckin, 
  DecisionLogItem, 
  AlertItem, 
  dataService,
  offlineQueue 
} from '../services';

export type AppMode = 'landing' | 'citizen' | 'officer';
export type OfficerTab = 'map' | 'sos' | 'weather' | 'log';
export type ThemeMode = 'dark' | 'light';
export type TextSize = 'small' | 'normal' | 'large';

export interface OfficerProfile {
  name: string;
  badgeId: string;
  role: string;
  station: string;
}

interface AppState {
  // Navigation & Shell
  mode: AppMode;
  officerTab: OfficerTab;
  isOfficerAuthenticated: boolean;
  officerProfile: OfficerProfile | null;
  theme: ThemeMode;
  textSize: TextSize;
  calmMode: boolean;
  audioAtmosphere: boolean;
  colorblindSafe: boolean;
  isSettingsOpen: boolean;
  isHelplinesOpen: boolean;
  isTwoDeviceModalOpen: boolean;
  toastMessage: { id: string; text: string; type?: 'info' | 'alert' | 'success' } | null;

  // Citizen State
  selectedWardId: string;
  userAnonId: string;
  userHasConsented: boolean;
  activeCitizenSos: SosRequest | null;
  offlineCount: number;

  // Decision Engine & Simulation
  rainfallMmH: number;
  riverLevelRiseMeters: number;
  timeHour: number;
  isPlayingTime: boolean;
  hotspotWardId: string | null;
  approvedActionIds: string[];
  overriddenActionIds: string[];
  graph: DecisionGraphState;

  // Live Signals from Services
  incidentReports: IncidentReport[];
  sosRequests: SosRequest[];
  citizenCheckins: CitizenCheckin[];
  decisions: DecisionLogItem[];
  alerts: AlertItem[];
  isLiveBackend: boolean;

  // Actions
  setMode: (mode: AppMode) => void;
  setOfficerTab: (tab: OfficerTab) => void;
  loginOfficer: (profile?: Partial<OfficerProfile>) => void;
  logoutOfficer: () => void;
  setTheme: (theme: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  setCalmMode: (calm: boolean) => void;
  setAudioAtmosphere: (audio: boolean) => void;
  setColorblindSafe: (cb: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsHelplinesOpen: (open: boolean) => void;
  setIsTwoDeviceModalOpen: (open: boolean) => void;
  setSelectedWardId: (wardId: string) => void;
  setConsent: (consented: boolean) => void;
  setRainfall: (mmH: number) => void;
  setTimeHour: (hour: number) => void;
  toggleTimePlay: () => void;
  setHotspotWard: (wardId: string | null) => void;
  approveAction: (actionId: string, officerName?: string) => Promise<void>;
  overrideAction: (actionId: string, note?: string, officerName?: string) => Promise<void>;
  submitReport: (report: Omit<IncidentReport, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  submitSos: (sos: Omit<SosRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  submitCheckin: (status: 'safe' | 'need_help' | 'evacuating') => Promise<void>;
  updateSosStatus: (sosId: string, status: SosRequest['status'], resourceId?: string) => Promise<void>;
  verifyReport: (reportId: string) => Promise<void>;
  rejectReport: (reportId: string) => Promise<void>;
  deleteUserData: () => Promise<void>;
  showToast: (text: string, type?: 'info' | 'alert' | 'success') => void;
  hideToast: () => void;
  initSubscriptions: () => () => void;
}

const getStoredUserId = (): string => {
  if (typeof localStorage === 'undefined') return 'anon-user-default';
  let id = localStorage.getItem('rakshak_anon_id');
  if (!id) {
    id = `anon-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    localStorage.setItem('rakshak_anon_id', id);
  }
  return id;
};

const getStoredConsent = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem('rakshak_privacy_consent') === 'true';
};

const initialRainfall = 140;
const initialRiverRise = 2.8;
const initialGraph = runDecisionPipeline({
  rainfallMmH: initialRainfall,
  riverLevelRiseMeters: initialRiverRise,
  timeHour: 2,
  hotspotWardId: 'ward-3',
  approvedActionIds: [],
  overriddenActionIds: [],
});

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation & Shell
  mode: 'landing',
  officerTab: 'map',
  isOfficerAuthenticated: typeof localStorage !== 'undefined' && localStorage.getItem('rakshak_officer_auth') === 'true',
  officerProfile: typeof localStorage !== 'undefined' && localStorage.getItem('rakshak_officer_profile') 
    ? JSON.parse(localStorage.getItem('rakshak_officer_profile')!) 
    : {
        name: 'Dr. Vikramaditya Patil, IAS',
        badgeId: 'RDMA-7492',
        role: 'Chief Relief Commissioner',
        station: 'Rivergate Central EOC'
      },
  theme: (typeof localStorage !== 'undefined' && (localStorage.getItem('rakshak_theme') as ThemeMode)) || 'dark',
  textSize: (typeof localStorage !== 'undefined' && (localStorage.getItem('rakshak_text_size') as TextSize)) || 'normal',
  calmMode: (typeof localStorage !== 'undefined' && localStorage.getItem('rakshak_calm_mode') === 'true') || false,
  audioAtmosphere: false,
  colorblindSafe: (typeof localStorage !== 'undefined' && localStorage.getItem('rakshak_colorblind') === 'true') || false,
  isSettingsOpen: false,
  isHelplinesOpen: false,
  isTwoDeviceModalOpen: false,
  toastMessage: null,

  // Citizen
  selectedWardId: 'ward-3',
  userAnonId: getStoredUserId(),
  userHasConsented: getStoredConsent(),
  activeCitizenSos: null,
  offlineCount: 0,

  // Engine
  rainfallMmH: initialRainfall,
  riverLevelRiseMeters: initialRiverRise,
  timeHour: 2,
  isPlayingTime: false,
  hotspotWardId: 'ward-3',
  approvedActionIds: [],
  overriddenActionIds: [],
  graph: initialGraph,

  // Signals
  incidentReports: [],
  sosRequests: [],
  citizenCheckins: [],
  decisions: [],
  alerts: [],
  isLiveBackend: dataService.isLive,

  setMode: (mode) => set({ mode }),
  setOfficerTab: (tab) => set({ officerTab: tab }),

  loginOfficer: (profile) => {
    const defaultProfile: OfficerProfile = {
      name: 'Dr. Vikramaditya Patil, IAS',
      badgeId: 'RDMA-7492',
      role: 'Chief Relief Commissioner',
      station: 'Rivergate Central EOC'
    };
    const finalProfile = { ...defaultProfile, ...(profile || {}) };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rakshak_officer_auth', 'true');
      localStorage.setItem('rakshak_officer_profile', JSON.stringify(finalProfile));
    }
    set({ isOfficerAuthenticated: true, officerProfile: finalProfile });
  },

  logoutOfficer: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('rakshak_officer_auth');
    }
    set({ isOfficerAuthenticated: false });
  },
  
  setTheme: (theme) => {
    localStorage.setItem('rakshak_theme', theme);
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
    set({ theme });
  },

  setTextSize: (size) => {
    localStorage.setItem('rakshak_text_size', size);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-text-size', size);
    }
    set({ textSize: size });
  },

  setCalmMode: (calm) => {
    localStorage.setItem('rakshak_calm_mode', String(calm));
    set({ calmMode: calm });
  },

  setAudioAtmosphere: (audio) => set({ audioAtmosphere: audio }),

  setColorblindSafe: (cb) => {
    localStorage.setItem('rakshak_colorblind', String(cb));
    set({ colorblindSafe: cb });
  },

  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setIsHelplinesOpen: (open) => set({ isHelplinesOpen: open }),
  setIsTwoDeviceModalOpen: (open) => set({ isTwoDeviceModalOpen: open }),
  setSelectedWardId: (wardId) => set({ selectedWardId: wardId }),
  
  setConsent: (consented) => {
    localStorage.setItem('rakshak_privacy_consent', String(consented));
    set({ userHasConsented: consented });
  },

  setRainfall: (mmH) => {
    const { riverLevelRiseMeters, timeHour, hotspotWardId, approvedActionIds, overriddenActionIds, incidentReports } = get();
    const verifiedWardIds = incidentReports.filter(r => r.status === 'verified').map(r => r.wardId);
    const newRise = Number((mmH * 0.02).toFixed(2));
    const newGraph = runDecisionPipeline({
      rainfallMmH: mmH,
      riverLevelRiseMeters: newRise,
      timeHour,
      hotspotWardId,
      approvedActionIds,
      overriddenActionIds,
      verifiedReportWardIds: verifiedWardIds,
    });
    set({ rainfallMmH: mmH, riverLevelRiseMeters: newRise, graph: newGraph });
  },

  setTimeHour: (hour) => {
    const { rainfallMmH, riverLevelRiseMeters, hotspotWardId, approvedActionIds, overriddenActionIds, incidentReports } = get();
    const verifiedWardIds = incidentReports.filter(r => r.status === 'verified').map(r => r.wardId);
    const newGraph = runDecisionPipeline({
      rainfallMmH,
      riverLevelRiseMeters,
      timeHour: hour,
      hotspotWardId,
      approvedActionIds,
      overriddenActionIds,
      verifiedReportWardIds: verifiedWardIds,
    });
    set({ timeHour: hour, graph: newGraph });
  },

  toggleTimePlay: () => {
    const isPlaying = !get().isPlayingTime;
    set({ isPlayingTime: isPlaying });
  },

  setHotspotWard: (wardId) => {
    const { rainfallMmH, riverLevelRiseMeters, timeHour, approvedActionIds, overriddenActionIds, incidentReports } = get();
    const verifiedWardIds = incidentReports.filter(r => r.status === 'verified').map(r => r.wardId);
    const newGraph = runDecisionPipeline({
      rainfallMmH,
      riverLevelRiseMeters,
      timeHour,
      hotspotWardId: wardId,
      approvedActionIds,
      overriddenActionIds,
      verifiedReportWardIds: verifiedWardIds,
    });
    set({ hotspotWardId: wardId, graph: newGraph });
  },

  approveAction: async (actionId, officerName = 'Officer HQ-1') => {
    const { approvedActionIds, overriddenActionIds, graph, rainfallMmH, riverLevelRiseMeters, timeHour, hotspotWardId } = get();
    const action = graph.recommendedActions.find(a => a.id === actionId);
    const nextApproved = [...approvedActionIds, actionId];
    const nextOverridden = overriddenActionIds.filter(id => id !== actionId);

    const newGraph = runDecisionPipeline({
      rainfallMmH,
      riverLevelRiseMeters,
      timeHour,
      hotspotWardId,
      approvedActionIds: nextApproved,
      overriddenActionIds: nextOverridden,
    });

    set({ approvedActionIds: nextApproved, overriddenActionIds: nextOverridden, graph: newGraph });

    if (action) {
      await dataService.submitDecision({
        recommendationId: action.id,
        actionTitle: action.title,
        targetWardId: action.targetWardOrCampId,
        status: 'approved',
        officerId: officerName,
        officerNote: 'Approved under standard flood mitigation SOP.',
        projectedImpact: `Projected risk reduction: ${action.projectedRiskReduction}%`,
        confidence: action.confidence,
      });
      get().showToast(`Approved: ${action.title}`, 'success');
    }
  },

  overrideAction: async (actionId, note = 'Overridden for priority sector coverage', officerName = 'Officer HQ-1') => {
    const { approvedActionIds, overriddenActionIds, graph, rainfallMmH, riverLevelRiseMeters, timeHour, hotspotWardId } = get();
    const action = graph.recommendedActions.find(a => a.id === actionId);
    const nextOverridden = [...overriddenActionIds, actionId];
    const nextApproved = approvedActionIds.filter(id => id !== actionId);

    const newGraph = runDecisionPipeline({
      rainfallMmH,
      riverLevelRiseMeters,
      timeHour,
      hotspotWardId,
      approvedActionIds: nextApproved,
      overriddenActionIds: nextOverridden,
    });

    set({ approvedActionIds: nextApproved, overriddenActionIds: nextOverridden, graph: newGraph });

    if (action) {
      await dataService.submitDecision({
        recommendationId: action.id,
        actionTitle: action.title,
        targetWardId: action.targetWardOrCampId,
        status: 'overridden',
        officerId: officerName,
        officerNote: note,
        projectedImpact: 'Resources maintained at reserve staging line.',
        confidence: action.confidence,
      });
      get().showToast(`Overridden: ${action.title}`, 'alert');
    }
  },

  submitReport: async (report) => {
    const res = await dataService.submitReport(report);
    if (res.offlineQueued) {
      get().showToast('Saved on your phone, will send when online.', 'info');
    } else {
      get().showToast('Report submitted. Emergency desk notified.', 'success');
    }
  },

  submitSos: async (sos) => {
    const res = await dataService.submitSos(sos);
    const fullSos: SosRequest = {
      ...sos,
      id: res.id,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ activeCitizenSos: fullSos });
    if (res.offlineQueued) {
      get().showToast('Saved on your phone, will send when online.', 'info');
    } else {
      get().showToast('Rescue alert sent to Command Center.', 'alert');
    }
  },

  submitCheckin: async (status) => {
    const { userAnonId, selectedWardId } = get();
    const res = await dataService.submitCheckin({
      anonUserId: userAnonId,
      wardId: selectedWardId,
      status,
      approxLocation: `Ward ${selectedWardId.replace('ward-', '')} Area`
    });
    if (res.offlineQueued) {
      get().showToast('Saved on your phone, will send when online.', 'info');
    } else {
      get().showToast('Status recorded. Thank you.', 'success');
    }
  },

  updateSosStatus: async (sosId, status, resourceId) => {
    await dataService.updateSosStatus(sosId, status, resourceId);
    get().showToast(`SOS status updated to ${status}`, 'info');
  },

  verifyReport: async (reportId) => {
    await dataService.updateReportStatus(reportId, 'verified');
    get().showToast('Report verified. Ward risk updated.', 'info');
  },

  rejectReport: async (reportId) => {
    await dataService.updateReportStatus(reportId, 'rejected');
    get().showToast('Report marked as rejected.', 'info');
  },

  deleteUserData: async () => {
    const { userAnonId } = get();
    await dataService.deleteMyData(userAnonId);
    set({ activeCitizenSos: null });
    get().showToast('All local and submitted records have been deleted.', 'info');
  },

  showToast: (text, type = 'info') => {
    set({ toastMessage: { id: String(Date.now()), text, type } });
    setTimeout(() => {
      if (get().toastMessage?.text === text) {
        set({ toastMessage: null });
      }
    }, 4500);
  },

  hideToast: () => set({ toastMessage: null }),

  initSubscriptions: () => {
    // Initial fetch
    Promise.all([
      dataService.getIncidentReports(),
      dataService.getSosRequests(),
      dataService.getAlerts(),
      dataService.getDecisions(),
    ]).then(([reports, sos, alerts, decisions]) => {
      set({
        incidentReports: reports,
        sosRequests: sos,
        alerts,
        decisions,
      });

      // Check if user has active SOS
      const mySos = sos.find(s => s.anonUserId === get().userAnonId && s.status !== 'resolved');
      if (mySos) set({ activeCitizenSos: mySos });
    });

    // Offline queue counter subscriber
    const unsubQueue = offlineQueue.subscribe((count) => {
      set({ offlineCount: count });
    });

    // Real-time updates subscription
    const unsubRealtime = dataService.subscribe((event) => {
      const { table, eventType, record } = event;
      if (table === 'incident_reports') {
        set((state) => {
          let updated = [...state.incidentReports];
          if (eventType === 'INSERT') {
            if (!updated.some(r => r.id === record.id)) updated.unshift(record);
            state.showToast(`New Incident Report in Ward ${record.ward_id || record.wardId}`, 'info');
          } else if (eventType === 'UPDATE') {
            const idx = updated.findIndex(r => r.id === record.id);
            if (idx >= 0) updated[idx] = record;
          }
          return { incidentReports: updated };
        });
      } else if (table === 'sos_requests') {
        set((state) => {
          let updated = [...state.sosRequests];
          if (eventType === 'INSERT') {
            if (!updated.some(s => s.id === record.id)) updated.unshift(record);
            state.showToast(`⚠️ Priority SOS Request received!`, 'alert');
          } else if (eventType === 'UPDATE') {
            const idx = updated.findIndex(s => s.id === record.id);
            if (idx >= 0) updated[idx] = record;
            if (record.anonUserId === state.userAnonId || record.anon_user_id === state.userAnonId) {
              state.showToast(`Rescue update: Status is now "${record.status}"`, 'success');
              return { sosRequests: updated, activeCitizenSos: record.status === 'resolved' ? null : record };
            }
          }
          return { sosRequests: updated };
        });
      } else if (table === 'decisions') {
        set((state) => ({
          decisions: [record, ...state.decisions]
        }));
      }
    });

    return () => {
      unsubQueue();
      unsubRealtime();
    };
  }
}));
