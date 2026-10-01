export interface CitizenCheckin {
  id: string;
  anonUserId: string;
  wardId: string;
  status: 'safe' | 'need_help' | 'evacuating';
  approxLocation?: string;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  anonUserId: string;
  type: 'water_rising' | 'road_blocked' | 'power_out' | 'medical';
  wardId: string;
  severity: 'low' | 'moderate' | 'severe';
  photoUrl?: string;
  note?: string;
  roundedLocation?: string;
  status: 'unverified' | 'verified' | 'rejected';
  createdAt: string;
}

export interface SosRequest {
  id: string;
  anonUserId: string;
  wardId: string;
  peopleCount: number;
  needType: 'rescue' | 'medical' | 'food_water';
  hasVulnerable: boolean;
  preciseLocation?: { lat: number; lng: number; accuracy: number };
  status: 'new' | 'acknowledged' | 'assigned' | 'resolved';
  assignedResourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionLogItem {
  id: string;
  recommendationId: string;
  actionTitle: string;
  targetWardId?: string;
  status: 'approved' | 'overridden' | 'pending';
  officerId: string;
  officerNote?: string;
  projectedImpact?: string;
  confidence?: number;
  createdAt: string;
}

export interface AlertItem {
  id: string;
  severity: 'info' | 'advisory' | 'warning' | 'critical';
  messageEn: string;
  messageHi: string;
  messageMr: string;
  affectedWardId?: string;
  createdAt: string;
}

export interface WeatherSnapshot {
  rainfallMm: number;
  riverLevelMeters: number;
  source: string;
  timestamp: string;
}

export interface RealtimeEventPayload {
  table: 'incident_reports' | 'sos_requests' | 'citizen_checkins' | 'decisions' | 'alerts';
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
}
