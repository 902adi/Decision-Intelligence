import { DataService } from './DataService';
import { SupabaseAdapter } from './SupabaseAdapter';
import { MockAdapter } from './MockAdapter';

const mode = import.meta.env.VITE_DATA_MODE || 'simulation';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const dataService: DataService = (mode === 'live' && url && key) 
  ? new SupabaseAdapter() 
  : new MockAdapter();

// Initialize the data service
dataService.init().catch(console.error);

export * from './types';
export * from './DataService';
export * from './offlineQueue';
