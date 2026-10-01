import { 
  CitizenCheckin, 
  IncidentReport, 
  SosRequest, 
  DecisionLogItem, 
  AlertItem, 
  WeatherSnapshot,
  RealtimeEventPayload 
} from './types';
import { Ward, ReliefCamp, ResourceItem } from '../data/rivergate';

export interface DataService {
  isLive: boolean;
  init(): Promise<void>;
  
  // Data queries
  getWards(): Promise<Ward[]>;
  getCamps(): Promise<ReliefCamp[]>;
  getAlerts(): Promise<AlertItem[]>;
  getIncidentReports(): Promise<IncidentReport[]>;
  getSosRequests(): Promise<SosRequest[]>;
  getDecisions(): Promise<DecisionLogItem[]>;
  getWeatherSnapshot(): Promise<WeatherSnapshot>;

  // Citizen submissions
  submitCheckin(checkin: Omit<CitizenCheckin, 'id' | 'createdAt'>): Promise<{ success: boolean; id: string; offlineQueued?: boolean }>;
  submitReport(report: Omit<IncidentReport, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; id: string; offlineQueued?: boolean }>;
  submitSos(sos: Omit<SosRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ success: boolean; id: string; offlineQueued?: boolean }>;

  // Officer actions
  updateSosStatus(sosId: string, status: SosRequest['status'], assignedResourceId?: string): Promise<boolean>;
  updateReportStatus(reportId: string, status: IncidentReport['status']): Promise<boolean>;
  submitDecision(decision: Omit<DecisionLogItem, 'id' | 'createdAt'>): Promise<DecisionLogItem>;

  // Subscriptions & Realtime
  subscribe(callback: (event: RealtimeEventPayload) => void): () => void;

  // Privacy & GDPR deletion
  deleteMyData(anonUserId: string): Promise<void>;
}
