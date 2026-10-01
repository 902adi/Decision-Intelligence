import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
import { MockAdapter } from './MockAdapter';
import { offlineQueue } from './offlineQueue';

export class SupabaseAdapter implements DataService {
  public isLive = true;
  private supabase: SupabaseClient | null = null;
  private fallbackMock: MockAdapter;
  private listeners: Array<(event: RealtimeEventPayload) => void> = [];

  constructor() {
    this.fallbackMock = new MockAdapter();
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (url && anonKey && url.startsWith('http')) {
      try {
        this.supabase = createClient(url, anonKey);
      } catch (e) {
        console.warn('Could not initialize Supabase client:', e);
        this.isLive = false;
      }
    } else {
      this.isLive = false;
    }
  }

  public async init(): Promise<void> {
    if (!this.isLive || !this.supabase) {
      await this.fallbackMock.init();
      return;
    }

    try {
      // Setup Realtime Subscription
      this.supabase
        .channel('public-events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reports' }, (payload) => {
          this.notify({
            table: 'incident_reports',
            eventType: payload.eventType as any,
            record: payload.new || payload.old
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, (payload) => {
          this.notify({
            table: 'sos_requests',
            eventType: payload.eventType as any,
            record: payload.new || payload.old
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'citizen_checkins' }, (payload) => {
          this.notify({
            table: 'citizen_checkins',
            eventType: payload.eventType as any,
            record: payload.new || payload.old
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions' }, (payload) => {
          this.notify({
            table: 'decisions',
            eventType: payload.eventType as any,
            record: payload.new || payload.old
          });
        })
        .subscribe();
    } catch {
      this.isLive = false;
      await this.fallbackMock.init();
    }
  }

  private notify(payload: RealtimeEventPayload) {
    this.listeners.forEach(cb => cb(payload));
  }

  public async getWards(): Promise<Ward[]> {
    if (!this.isLive || !this.supabase) return this.fallbackMock.getWards();
    try {
      const { data, error } = await this.supabase.from('wards').select('*');
      if (error || !data || data.length === 0) return rivergateWards;
      return data.map((w: any) => ({
        id: w.id,
        number: w.number,
        name: w.name,
        nameHi: w.name_hi,
        nameMr: w.name_mr,
        elevation: Number(w.elevation),
        population: w.population,
        vulnerablePopulation: w.vulnerable_population,
        drainCapacity: w.drain_capacity,
        distanceToRiver: w.distance_to_river,
        centroid: { x: w.centroid_x, y: w.centroid_y },
        svgPolygon: w.polygon_points
      }));
    } catch {
      return this.fallbackMock.getWards();
    }
  }

  public async getCamps(): Promise<ReliefCamp[]> {
    if (!this.isLive || !this.supabase) return this.fallbackMock.getCamps();
    try {
      const { data, error } = await this.supabase.from('camps').select('*');
      if (error || !data || data.length === 0) return rivergateCamps;
      return data.map((c: any) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        nameHi: c.name_hi,
        nameMr: c.name_mr,
        wardId: c.ward_id,
        coordinates: { x: c.coord_x, y: c.coord_y },
        totalCapacity: c.total_capacity,
        currentOccupancy: c.current_occupancy,
        foodPackets: c.food_packets,
        drinkingWaterLiters: c.drinking_water_liters,
        medicalKits: c.medical_kits,
        hourlyFoodBurnRate: 0.12,
        hourlyWaterBurnRate: 0.35,
      }));
    } catch {
      return this.fallbackMock.getCamps();
    }
  }

  public async getAlerts(): Promise<AlertItem[]> {
    if (!this.isLive || !this.supabase) return this.fallbackMock.getAlerts();
    try {
      const { data, error } = await this.supabase.from('alerts').select('*').order('created_at', { ascending: false });
      if (error || !data) return this.fallbackMock.getAlerts();
      return data.map((a: any) => ({
        id: a.id,
        severity: a.severity,
        messageEn: a.message_en,
        messageHi: a.message_hi,
        messageMr: a.message_mr,
        affectedWardId: a.affected_ward_id,
        createdAt: a.created_at
      }));
    } catch {
      return this.fallbackMock.getAlerts();
    }
  }

  public async getIncidentReports(): Promise<IncidentReport[]> {
    if (!this.isLive || !this.supabase) return this.fallbackMock.getIncidentReports();
    try {
      const { data, error } = await this.supabase.from('incident_reports').select('*').order('created_at', { ascending: false });
      if (error || !data) return this.fallbackMock.getIncidentReports();
      return data.map((r: any) => ({
        id: r.id,
        anonUserId: r.anon_user_id,
        type: r.type,
        wardId: r.ward_id,
        severity: r.severity,
        photoUrl: r.photo_url,
        note: r.note,
        roundedLocation: r.rounded_location,
        status: r.status,
        createdAt: r.created_at
      }));
    } catch {
      return this.fallbackMock.getIncidentReports();
    }
  }

  public async getSosRequests(): Promise<SosRequest[]> {
    if (!this.isLive || !this.supabase) return this.fallbackMock.getSosRequests();
    try {
      const { data, error } = await this.supabase.from('sos_requests').select('*').order('created_at', { ascending: false });
      if (error || !data) return this.fallbackMock.getSosRequests();
      return data.map((s: any) => ({
        id: s.id,
        anonUserId: s.anon_user_id,
        wardId: s.ward_id,
        peopleCount: s.people_count,
        needType: s.need_type,
        hasVulnerable: s.has_vulnerable,
        preciseLocation: s.precise_location,
        status: s.status,
        assignedResourceId: s.assigned_resource_id,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }));
    } catch {
      return this.fallbackMock.getSosRequests();
    }
  }

  public async getDecisions(): Promise<DecisionLogItem[]> {
    if (!this.isLive || !this.supabase) return this.fallbackMock.getDecisions();
    try {
      const { data, error } = await this.supabase.from('decisions').select('*').order('created_at', { ascending: false });
      if (error || !data) return this.fallbackMock.getDecisions();
      return data.map((d: any) => ({
        id: d.id,
        recommendationId: d.recommendation_id,
        actionTitle: d.action_title,
        targetWardId: d.target_ward_id,
        status: d.status,
        officerId: d.officer_id,
        officerNote: d.officer_note,
        projectedImpact: d.projected_impact,
        confidence: d.confidence,
        createdAt: d.created_at
      }));
    } catch {
      return this.fallbackMock.getDecisions();
    }
  }

  public async getWeatherSnapshot(): Promise<WeatherSnapshot> {
    if (!this.isLive || !this.supabase) return this.fallbackMock.getWeatherSnapshot();
    try {
      const { data, error } = await this.supabase.from('weather_snapshots').select('*').order('ts', { ascending: false }).limit(1).single();
      if (error || !data) return this.fallbackMock.getWeatherSnapshot();
      return {
        rainfallMm: Number(data.rainfall_mm),
        riverLevelMeters: Number(data.river_level),
        source: data.source,
        timestamp: data.ts
      };
    } catch {
      return this.fallbackMock.getWeatherSnapshot();
    }
  }

  public async submitCheckin(checkin: Omit<CitizenCheckin, 'id' | 'createdAt'>) {
    if (!this.isLive || !this.supabase) return this.fallbackMock.submitCheckin(checkin);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('checkin', checkin);
      return { success: true, id: `offline-${Date.now()}`, offlineQueued: true };
    }
    try {
      const { data, error } = await this.supabase.from('citizen_checkins').insert({
        anon_user_id: checkin.anonUserId,
        ward_id: checkin.wardId,
        status: checkin.status,
        approx_location: checkin.approxLocation
      }).select().single();
      if (error) throw error;
      return { success: true, id: data.id };
    } catch {
      return this.fallbackMock.submitCheckin(checkin);
    }
  }

  public async submitReport(report: Omit<IncidentReport, 'id' | 'createdAt' | 'status'>) {
    if (!this.isLive || !this.supabase) return this.fallbackMock.submitReport(report);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('report', report);
      return { success: true, id: `offline-${Date.now()}`, offlineQueued: true };
    }
    try {
      const { data, error } = await this.supabase.from('incident_reports').insert({
        anon_user_id: report.anonUserId,
        type: report.type,
        ward_id: report.wardId,
        severity: report.severity,
        photo_url: report.photoUrl,
        note: report.note,
        rounded_location: report.roundedLocation,
        status: 'unverified'
      }).select().single();
      if (error) throw error;
      return { success: true, id: data.id };
    } catch {
      return this.fallbackMock.submitReport(report);
    }
  }

  public async submitSos(sos: Omit<SosRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    if (!this.isLive || !this.supabase) return this.fallbackMock.submitSos(sos);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('sos', sos);
      return { success: true, id: `offline-${Date.now()}`, offlineQueued: true };
    }
    try {
      const { data, error } = await this.supabase.from('sos_requests').insert({
        anon_user_id: sos.anonUserId,
        ward_id: sos.wardId,
        people_count: sos.peopleCount,
        need_type: sos.needType,
        has_vulnerable: sos.hasVulnerable,
        precise_location: sos.preciseLocation,
        status: 'new'
      }).select().single();
      if (error) throw error;
      return { success: true, id: data.id };
    } catch {
      return this.fallbackMock.submitSos(sos);
    }
  }

  public async updateSosStatus(sosId: string, status: SosRequest['status'], assignedResourceId?: string) {
    if (!this.isLive || !this.supabase) return this.fallbackMock.updateSosStatus(sosId, status, assignedResourceId);
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (assignedResourceId) updateData.assigned_resource_id = assignedResourceId;
      const { error } = await this.supabase.from('sos_requests').update(updateData).eq('id', sosId);
      return !error;
    } catch {
      return this.fallbackMock.updateSosStatus(sosId, status, assignedResourceId);
    }
  }

  public async updateReportStatus(reportId: string, status: IncidentReport['status']) {
    if (!this.isLive || !this.supabase) return this.fallbackMock.updateReportStatus(reportId, status);
    try {
      const { error } = await this.supabase.from('incident_reports').update({ status }).eq('id', reportId);
      return !error;
    } catch {
      return this.fallbackMock.updateReportStatus(reportId, status);
    }
  }

  public async submitDecision(decision: Omit<DecisionLogItem, 'id' | 'createdAt'>) {
    if (!this.isLive || !this.supabase) return this.fallbackMock.submitDecision(decision);
    try {
      const { data, error } = await this.supabase.from('decisions').insert({
        recommendation_id: decision.recommendationId,
        action_title: decision.actionTitle,
        target_ward_id: decision.targetWardId,
        status: decision.status,
        officer_id: decision.officerId,
        officer_note: decision.officerNote,
        projected_impact: decision.projectedImpact,
        confidence: decision.confidence
      }).select().single();
      if (error) throw error;
      return {
        id: data.id,
        recommendationId: data.recommendation_id,
        actionTitle: data.action_title,
        targetWardId: data.target_ward_id,
        status: data.status,
        officerId: data.officer_id,
        officerNote: data.officer_note,
        projectedImpact: data.projected_impact,
        confidence: data.confidence,
        createdAt: data.created_at
      };
    } catch {
      return this.fallbackMock.submitDecision(decision);
    }
  }

  public subscribe(callback: (event: RealtimeEventPayload) => void): () => void {
    if (!this.isLive || !this.supabase) {
      return this.fallbackMock.subscribe(callback);
    }
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public async deleteMyData(anonUserId: string): Promise<void> {
    if (!this.isLive || !this.supabase) {
      return this.fallbackMock.deleteMyData(anonUserId);
    }
    try {
      await this.supabase.from('citizen_checkins').delete().eq('anon_user_id', anonUserId);
      await this.supabase.from('incident_reports').delete().eq('anon_user_id', anonUserId);
      await this.supabase.from('sos_requests').delete().eq('anon_user_id', anonUserId);
    } catch {
      return this.fallbackMock.deleteMyData(anonUserId);
    }
  }
}
