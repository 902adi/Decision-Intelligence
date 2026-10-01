import { DataService } from './DataService';
import { 
  CitizenCheckin, 
  IncidentReport, 
  SosRequest, 
  DecisionLogItem, 
  AlertItem, 
  WeatherSnapshot,
  RealtimeEventPayload 
} from './types';
import { Ward, ReliefCamp, rivergateWards, rivergateCamps } from '../data/rivergate';
import { offlineQueue } from './offlineQueue';

export class MockAdapter implements DataService {
  public isLive = false;
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(event: RealtimeEventPayload) => void> = [];

  private checkins: CitizenCheckin[] = [
    { id: 'chk-1', anonUserId: 'anon-101', wardId: 'ward-5', status: 'safe', approxLocation: 'Greenfield Centroid', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'chk-2', anonUserId: 'anon-102', wardId: 'ward-8', status: 'safe', approxLocation: 'Highridge Centroid', createdAt: new Date(Date.now() - 3000000).toISOString() },
    { id: 'chk-3', anonUserId: 'anon-103', wardId: 'ward-3', status: 'need_help', approxLocation: 'Fishermen Wharf Pier', createdAt: new Date(Date.now() - 2400000).toISOString() },
    { id: 'chk-4', anonUserId: 'anon-104', wardId: 'ward-1', status: 'evacuating', approxLocation: 'Promenade North', createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 'chk-5', anonUserId: 'anon-105', wardId: 'ward-3', status: 'need_help', approxLocation: 'Wharf Lane 4', createdAt: new Date(Date.now() - 1200000).toISOString() }
  ];

  private reports: IncidentReport[] = [
    {
      id: 'rep-1',
      anonUserId: 'anon-201',
      type: 'water_rising',
      wardId: 'ward-3',
      severity: 'severe',
      note: 'Water 1.2m deep near fish landing jetty. 4 families trapped in single-story homes.',
      roundedLocation: 'Ward 3, Wharf Lane',
      status: 'verified',
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'rep-2',
      anonUserId: 'anon-202',
      type: 'road_blocked',
      wardId: 'ward-1',
      severity: 'severe',
      note: 'Marine Drive completely submerged near culvert 2. High current flowing into residential street.',
      roundedLocation: 'Ward 1, South Crossway',
      status: 'verified',
      createdAt: new Date(Date.now() - 1200000).toISOString()
    },
    {
      id: 'rep-3',
      anonUserId: 'anon-203',
      type: 'power_out',
      wardId: 'ward-4',
      severity: 'moderate',
      note: 'Transformer sparking near mill entrance. Power grid tripping intermittently.',
      roundedLocation: 'Ward 4, Mill Gate East',
      status: 'unverified',
      createdAt: new Date(Date.now() - 600000).toISOString()
    }
  ];

  private sosRequests: SosRequest[] = [
    {
      id: 'sos-1',
      anonUserId: 'anon-301',
      wardId: 'ward-3',
      peopleCount: 4,
      needType: 'rescue',
      hasVulnerable: true,
      status: 'assigned',
      assignedResourceId: 'boat-1',
      createdAt: new Date(Date.now() - 1500000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'sos-2',
      anonUserId: 'anon-302',
      wardId: 'ward-1',
      peopleCount: 2,
      needType: 'medical',
      hasVulnerable: true,
      status: 'new',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      updatedAt: new Date(Date.now() - 600000).toISOString(),
    }
  ];

  private decisions: DecisionLogItem[] = [
    {
      id: 'dec-1',
      recommendationId: 'rec-boat-ward-3',
      actionTitle: 'Dispatch Swiftwater Boat B1 to Ward 3',
      targetWardId: 'ward-3',
      status: 'approved',
      officerId: 'Officer R. Sharma (HQ-04)',
      officerNote: 'Immediate priority; 4 trapped near landing jetty with vulnerable seniors.',
      projectedImpact: 'Estimated 18 people evacuated before water reaches ceiling level.',
      confidence: 95,
      createdAt: new Date(Date.now() - 1200000).toISOString()
    }
  ];

  private alerts: AlertItem[] = [
    {
      id: 'alt-1',
      severity: 'critical',
      messageEn: 'Flash flood warning issued for Ward 3 & Ward 1. Move to Greenfield Stadium Shelter.',
      messageHi: 'वार्ड 3 और वार्ड 1 के लिए त्वरित बाढ़ चेतावनी। ग्रीनफील्ड स्टेडियम राहत शिविर में जाएं।',
      messageMr: 'प्रभाग ३ व प्रभाग १ साठी तीव्र पुराचा इशारा. ग्रीनफिल्ड स्टेडियम मदत शिबिराकडे त्वरित जावे.',
      affectedWardId: 'ward-3',
      createdAt: new Date().toISOString()
    }
  ];

  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('rakshak_realtime_sync');
        this.channel.onmessage = (event) => {
          if (event.data && event.data.table) {
            this.handleRemoteEvent(event.data as RealtimeEventPayload);
          }
        };
      } catch {
        // Fallback gracefully
      }
    }

    // Load persisted state if exists
    if (typeof localStorage !== 'undefined') {
      try {
        const storedReports = localStorage.getItem('rakshak_mock_reports');
        if (storedReports) this.reports = JSON.parse(storedReports);

        const storedSos = localStorage.getItem('rakshak_mock_sos');
        if (storedSos) this.sosRequests = JSON.parse(storedSos);

        const storedDecisions = localStorage.getItem('rakshak_mock_decisions');
        if (storedDecisions) this.decisions = JSON.parse(storedDecisions);

        const storedCheckins = localStorage.getItem('rakshak_mock_checkins');
        if (storedCheckins) this.checkins = JSON.parse(storedCheckins);
      } catch (e) {
        console.warn('Could not parse mock state from localStorage', e);
      }
    }
  }

  private saveState() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('rakshak_mock_reports', JSON.stringify(this.reports));
      localStorage.setItem('rakshak_mock_sos', JSON.stringify(this.sosRequests));
      localStorage.setItem('rakshak_mock_decisions', JSON.stringify(this.decisions));
      localStorage.setItem('rakshak_mock_checkins', JSON.stringify(this.checkins));
    } catch {}
  }

  private broadcast(payload: RealtimeEventPayload) {
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch {}
    }
    // Also notify local listeners
    this.listeners.forEach(cb => cb(payload));
  }

  private handleRemoteEvent(payload: RealtimeEventPayload) {
    // Update local state when remote tab posts
    if (payload.table === 'incident_reports') {
      if (payload.eventType === 'INSERT') {
        if (!this.reports.some(r => r.id === payload.record.id)) {
          this.reports.unshift(payload.record);
        }
      } else if (payload.eventType === 'UPDATE') {
        const idx = this.reports.findIndex(r => r.id === payload.record.id);
        if (idx >= 0) this.reports[idx] = payload.record;
      }
    } else if (payload.table === 'sos_requests') {
      if (payload.eventType === 'INSERT') {
        if (!this.sosRequests.some(s => s.id === payload.record.id)) {
          this.sosRequests.unshift(payload.record);
        }
      } else if (payload.eventType === 'UPDATE') {
        const idx = this.sosRequests.findIndex(s => s.id === payload.record.id);
        if (idx >= 0) this.sosRequests[idx] = payload.record;
      }
    } else if (payload.table === 'citizen_checkins') {
      if (payload.eventType === 'INSERT') {
        this.checkins.unshift(payload.record);
      }
    } else if (payload.table === 'decisions') {
      if (payload.eventType === 'INSERT') {
        this.decisions.unshift(payload.record);
      }
    }
    this.saveState();
    this.listeners.forEach(cb => cb(payload));
  }

  public async getWards(): Promise<Ward[]> {
    return rivergateWards;
  }

  public async getCamps(): Promise<ReliefCamp[]> {
    return rivergateCamps;
  }

  public async getAlerts(): Promise<AlertItem[]> {
    return this.alerts;
  }

  public async getIncidentReports(): Promise<IncidentReport[]> {
    return [...this.reports];
  }

  public async getSosRequests(): Promise<SosRequest[]> {
    return [...this.sosRequests];
  }

  public async getDecisions(): Promise<DecisionLogItem[]> {
    return [...this.decisions];
  }

  public async getWeatherSnapshot(): Promise<WeatherSnapshot> {
    return {
      rainfallMm: 140.0,
      riverLevelMeters: 2.80,
      source: 'Sensor Mesh (Simulated)',
      timestamp: new Date().toISOString()
    };
  }

  public async submitCheckin(checkin: Omit<CitizenCheckin, 'id' | 'createdAt'>) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('checkin', checkin);
      return { success: true, id: `offline-${Date.now()}`, offlineQueued: true };
    }

    const newCheckin: CitizenCheckin = {
      ...checkin,
      id: `chk-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.checkins.unshift(newCheckin);
    this.saveState();

    this.broadcast({
      table: 'citizen_checkins',
      eventType: 'INSERT',
      record: newCheckin
    });

    return { success: true, id: newCheckin.id };
  }

  public async submitReport(report: Omit<IncidentReport, 'id' | 'createdAt' | 'status'>) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('report', report);
      return { success: true, id: `offline-${Date.now()}`, offlineQueued: true };
    }

    const newReport: IncidentReport = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'unverified',
      createdAt: new Date().toISOString()
    };
    this.reports.unshift(newReport);
    this.saveState();

    this.broadcast({
      table: 'incident_reports',
      eventType: 'INSERT',
      record: newReport
    });

    return { success: true, id: newReport.id };
  }

  public async submitSos(sos: Omit<SosRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('sos', sos);
      return { success: true, id: `offline-${Date.now()}`, offlineQueued: true };
    }

    const newSos: SosRequest = {
      ...sos,
      id: `sos-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.sosRequests.unshift(newSos);
    this.saveState();

    this.broadcast({
      table: 'sos_requests',
      eventType: 'INSERT',
      record: newSos
    });

    return { success: true, id: newSos.id };
  }

  public async updateSosStatus(sosId: string, status: SosRequest['status'], assignedResourceId?: string) {
    const item = this.sosRequests.find(s => s.id === sosId);
    if (!item) return false;
    item.status = status;
    if (assignedResourceId) item.assignedResourceId = assignedResourceId;
    item.updatedAt = new Date().toISOString();
    this.saveState();

    this.broadcast({
      table: 'sos_requests',
      eventType: 'UPDATE',
      record: item
    });
    return true;
  }

  public async updateReportStatus(reportId: string, status: IncidentReport['status']) {
    const item = this.reports.find(r => r.id === reportId);
    if (!item) return false;
    item.status = status;
    this.saveState();

    this.broadcast({
      table: 'incident_reports',
      eventType: 'UPDATE',
      record: item
    });
    return true;
  }

  public async submitDecision(decision: Omit<DecisionLogItem, 'id' | 'createdAt'>) {
    const newDecision: DecisionLogItem = {
      ...decision,
      id: `dec-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.decisions.unshift(newDecision);
    this.saveState();

    this.broadcast({
      table: 'decisions',
      eventType: 'INSERT',
      record: newDecision
    });
    return newDecision;
  }

  public subscribe(callback: (event: RealtimeEventPayload) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public async deleteMyData(anonUserId: string): Promise<void> {
    this.checkins = this.checkins.filter(c => c.anonUserId !== anonUserId);
    this.reports = this.reports.filter(r => r.anonUserId !== anonUserId);
    this.sosRequests = this.sosRequests.filter(s => s.anonUserId !== anonUserId);
    this.saveState();
  }
}
