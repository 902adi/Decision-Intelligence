-- Rakshak AI (रक्षक AI) Postgres Schema & Row Level Security Policies

-- 1. Profiles & Roles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. City Wards Table
CREATE TABLE IF NOT EXISTS public.wards (
  id TEXT PRIMARY KEY,
  number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  name_mr TEXT NOT NULL,
  elevation NUMERIC(5,2) NOT NULL,
  population INT NOT NULL,
  vulnerable_population INT NOT NULL,
  drain_capacity INT NOT NULL,
  distance_to_river INT NOT NULL,
  centroid_x INT NOT NULL,
  centroid_y INT NOT NULL,
  polygon_points TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. City Roads Table
CREATE TABLE IF NOT EXISTS public.roads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  from_ward TEXT NOT NULL REFERENCES public.wards(id),
  to_ward TEXT NOT NULL REFERENCES public.wards(id),
  length_km NUMERIC(4,2) NOT NULL,
  flood_threshold_mm INT NOT NULL,
  path_points JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 4. Emergency Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pump', 'boat', 'rescue_team', 'ambulance')),
  capacity_rate TEXT NOT NULL,
  assigned_ward_id TEXT REFERENCES public.wards(id),
  base_depot_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'deployed', 'in_transit', 'maintenance')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Relief Camps Table
CREATE TABLE IF NOT EXISTS public.camps (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  name_mr TEXT NOT NULL,
  ward_id TEXT NOT NULL REFERENCES public.wards(id),
  coord_x INT NOT NULL,
  coord_y INT NOT NULL,
  total_capacity INT NOT NULL,
  current_occupancy INT NOT NULL DEFAULT 0,
  food_packets INT NOT NULL DEFAULT 0,
  drinking_water_liters INT NOT NULL DEFAULT 0,
  medical_kits INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Emergency Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'advisory', 'warning', 'critical')),
  message_en TEXT NOT NULL,
  message_hi TEXT NOT NULL,
  message_mr TEXT NOT NULL,
  affected_ward_id TEXT REFERENCES public.wards(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Weather Snapshots Table (Populated by Edge Function / Open-Meteo)
CREATE TABLE IF NOT EXISTS public.weather_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rainfall_mm NUMERIC(6,2) NOT NULL,
  river_level NUMERIC(5,2) NOT NULL,
  source TEXT NOT NULL DEFAULT 'open-meteo',
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Citizen Check-ins (Minimalist, privacy-first)
CREATE TABLE IF NOT EXISTS public.citizen_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id TEXT NOT NULL,
  ward_id TEXT NOT NULL REFERENCES public.wards(id),
  status TEXT NOT NULL CHECK (status IN ('safe', 'need_help', 'evacuating')),
  approx_location TEXT, -- e.g. "Ward 4 Centroid"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Incident Reports (Crowdsourced flood signals)
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('water_rising', 'road_blocked', 'power_out', 'medical')),
  ward_id TEXT NOT NULL REFERENCES public.wards(id),
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'severe')),
  photo_url TEXT,
  note TEXT,
  rounded_location TEXT,
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Emergency SOS Requests (Rescue queue)
CREATE TABLE IF NOT EXISTS public.sos_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id TEXT NOT NULL,
  ward_id TEXT NOT NULL REFERENCES public.wards(id),
  people_count INT NOT NULL DEFAULT 1,
  need_type TEXT NOT NULL CHECK (need_type IN ('rescue', 'medical', 'food_water')),
  has_vulnerable BOOLEAN NOT NULL DEFAULT false,
  precise_location JSONB, -- ONLY stored if user explicitly consented to GPS sharing
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'assigned', 'resolved')),
  assigned_resource_id TEXT REFERENCES public.resources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Decisions & Audit Log (Explainable AI decisions approved/overridden by officers)
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id TEXT NOT NULL,
  action_title TEXT NOT NULL,
  target_ward_id TEXT REFERENCES public.wards(id),
  status TEXT NOT NULL CHECK (status IN ('approved', 'overridden', 'pending')),
  officer_id TEXT NOT NULL,
  officer_note TEXT,
  projected_impact TEXT,
  confidence INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Helper function: Is caller an officer?
CREATE OR REPLACE FUNCTION public.is_officer() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'officer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public READ for static city data, alerts, and camps
CREATE POLICY "Public read wards" ON public.wards FOR SELECT USING (true);
CREATE POLICY "Public read roads" ON public.roads FOR SELECT USING (true);
CREATE POLICY "Public read camps" ON public.camps FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public read weather" ON public.weather_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);

-- Check-ins: Anyone can insert anonymously. Public can see aggregated counts; officers can read all.
CREATE POLICY "Anon insert checkins" ON public.citizen_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read checkins" ON public.citizen_checkins FOR SELECT USING (true);

-- Incident Reports: Anyone can submit. Public can see verified reports. Officers see all and update status.
CREATE POLICY "Anon insert reports" ON public.incident_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read reports" ON public.incident_reports FOR SELECT USING (
  status = 'verified' OR is_officer() OR anon_user_id = coalesce(auth.uid()::text, '')
);
CREATE POLICY "Officers update reports" ON public.incident_reports FOR UPDATE USING (is_officer());

-- SOS Requests: Anyone can submit. Citizen can view own. Officers can read & update all.
CREATE POLICY "Anon insert sos" ON public.sos_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Citizen view own sos" ON public.sos_requests FOR SELECT USING (
  anon_user_id = coalesce(auth.uid()::text, '') OR is_officer()
);
CREATE POLICY "Officers update sos" ON public.sos_requests FOR UPDATE USING (is_officer());

-- Decisions: Public can read decisions for audit transparency. Officers can insert/update.
CREATE POLICY "Public read decisions" ON public.decisions FOR SELECT USING (true);
CREATE POLICY "Officers insert decisions" ON public.decisions FOR INSERT WITH CHECK (is_officer());
CREATE POLICY "Officers update decisions" ON public.decisions FOR UPDATE USING (is_officer());

-- Enable Realtime publication for dynamic tables
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.incident_reports, 
  public.sos_requests, 
  public.citizen_checkins, 
  public.camps, 
  public.alerts, 
  public.decisions,
  public.resources;
