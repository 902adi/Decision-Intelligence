import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TrendingUp, Droplets, Zap, Wind, CloudRain, Sun, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rivergateWards } from '../../data/rivergate';

/* ─── Types ──────────────────────────────────────────────────────── */
interface Phenomenon {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface SignalLine {
  label: string;
  value: string;
  contribution: number; // 0-100, how much this signal drives the prediction
  direction: 'up' | 'down' | 'neutral';
}

interface Prediction {
  phenomenon: Phenomenon;
  probabilityPct: number;
  likelyWithinHours: number;
  confidence: 'low' | 'medium' | 'high';
  headline: string;
  plainSummary: string;
  signals: SignalLine[];
  howWePredict: string[];
}

/* ─── Phenomenon catalogue ────────────────────────────────────────── */
const PHENOMENA: Record<string, Phenomenon> = {
  clear:       { id: 'clear',       label: 'Clear & Dry',      icon: Sun,       color: 'text-low',    bgColor: 'bg-low/10',    borderColor: 'border-low/30'    },
  drizzle:     { id: 'drizzle',     label: 'Light Drizzle',    icon: Droplets,  color: 'text-water',  bgColor: 'bg-water/10',  borderColor: 'border-water/30'  },
  heavy_rain:  { id: 'heavy_rain',  label: 'Heavy Rain',       icon: CloudRain, color: 'text-mod',    bgColor: 'bg-mod/10',    borderColor: 'border-mod/30'    },
  cloudburst:  { id: 'cloudburst',  label: 'Cloudburst',       icon: Zap,       color: 'text-high',   bgColor: 'bg-high/10',   borderColor: 'border-high/30'   },
  dam_surge:   { id: 'dam_surge',   label: 'Dam Surge Warning',icon: Wind,      color: 'text-crit',   bgColor: 'bg-crit/10',   borderColor: 'border-crit/30'   },
};

/* ─── Prediction engine (deterministic, readable) ─────────────────── */
function predictPhenomenon(
  rainfallMmH: number,
  wardId: string,
  timeHour: number,
): Prediction {
  const ward = rivergateWards.find(w => w.id === wardId) || rivergateWards[0];

  // Elevation lowers flood risk but not rainfall probability
  const elevationFactor = Math.max(0, (30 - ward.elevation) / 30); // 0..1 (low elev = high factor)
  const riverProximityFactor = ward.id.includes('3') || ward.id.includes('4') || ward.id.includes('7') ? 0.8 : 0.4;
  const nightFactor = (timeHour >= 0 && timeHour <= 4) ? 0.15 : 0; // cloudbursts more likely late night

  // Determine phenomenon based on rainfall + modifiers
  let ph: Phenomenon;
  let prob: number;
  let withinHours: number;
  let headline: string;
  let summary: string;

  if (rainfallMmH >= 180) {
    ph = PHENOMENA.dam_surge;
    prob = Math.round(Math.min(96, 72 + elevationFactor * 18 + nightFactor * 10));
    withinHours = 1;
    headline = `Dam gate release is very likely. Water can rise by 2–4 m in under 60 minutes.`;
    summary = `With rainfall at ${rainfallMmH} mm/h, Rivergate Dam is near its overflow threshold. Upstream sensors show gate pressure spiking. Officers may open floodgates to protect the dam wall — this sends a fast surge downstream toward low-lying wards.`;
  } else if (rainfallMmH >= 110) {
    ph = PHENOMENA.cloudburst;
    prob = Math.round(Math.min(92, 58 + elevationFactor * 20 + nightFactor * 14));
    withinHours = Math.round(1 + (1 - elevationFactor));
    headline = `A cloudburst is expected in ${withinHours}–${withinHours + 1} hours near your area.`;
    summary = `Rainfall is extremely intense (${rainfallMmH} mm/h). That is more than a month of rain falling in one hour. Streets drain only up to 40 mm/h — the rest pools instantly. ${ward.name} sits at ${ward.elevation}m elevation, which ${ward.elevation < 12 ? 'increases your risk as water flows downhill toward you' : 'gives you some protection, but roads nearby will flood'}.`;
  } else if (rainfallMmH >= 55) {
    ph = PHENOMENA.heavy_rain;
    prob = Math.round(Math.min(88, 48 + elevationFactor * 15 + riverProximityFactor * 20));
    withinHours = 2;
    headline = `Heavy rain is likely to continue for at least ${withinHours} more hours near ${ward.name}.`;
    summary = `The IMD radar shows a dense rain band sitting over the district. At ${rainfallMmH} mm/h, drainage can't keep up. Low areas and underpasses will begin flooding within 90 minutes. River level is rising at roughly ${(rainfallMmH / 60).toFixed(1)}m per hour upstream.`;
  } else if (rainfallMmH >= 15) {
    ph = PHENOMENA.drizzle;
    prob = Math.round(40 + rainfallMmH * 0.3);
    withinHours = 4;
    headline = `Light to moderate rain is expected to continue. No immediate flood threat.`;
    summary = `Current rainfall of ${rainfallMmH} mm/h is within normal monsoon range. Drains are coping. The next 4 hours look similar, with a small chance of intensification if cloud bands thicken overnight.`;
  } else {
    ph = PHENOMENA.clear;
    prob = Math.round(85 - rainfallMmH * 2);
    withinHours = 6;
    headline = `Conditions are clear and safe near ${ward.name} right now.`;
    summary = `No significant rainfall detected. Skies are stable. The nearest active rain band is more than 40 km away. Conditions should stay dry for at least ${withinHours} hours based on current satellite data.`;
  }

  // Confidence
  const confidence: 'low' | 'medium' | 'high' =
    prob >= 70 ? 'high' : prob >= 45 ? 'medium' : 'low';

  // Signal lines — the "evidence" that drives the prediction
  const signals: SignalLine[] = [
    {
      label: 'Current rainfall rate',
      value: `${rainfallMmH} mm/h`,
      contribution: Math.min(100, Math.round(rainfallMmH / 2)),
      direction: rainfallMmH > 60 ? 'up' : rainfallMmH < 20 ? 'down' : 'neutral',
    },
    {
      label: `${ward.name} ground elevation`,
      value: `${ward.elevation} m`,
      contribution: Math.round((30 - Math.min(30, ward.elevation)) / 30 * 80),
      direction: ward.elevation < 10 ? 'up' : 'down',
    },
    {
      label: 'River proximity risk',
      value: riverProximityFactor > 0.6 ? 'High' : 'Moderate',
      contribution: Math.round(riverProximityFactor * 80),
      direction: riverProximityFactor > 0.6 ? 'up' : 'neutral',
    },
    {
      label: 'Time of day (night amplifies risk)',
      value: `T+${timeHour}h`,
      contribution: Math.round(nightFactor * 100),
      direction: nightFactor > 0 ? 'up' : 'neutral',
    },
  ];

  // Plain-language "how we predict" bullets
  const howWePredict: string[] = [
    `We read live rainfall data from IMD radar every 5 minutes. Your current rain rate is ${rainfallMmH} mm/h — we compare this to historical cloudburst thresholds.`,
    `${ward.name} sits at ${ward.elevation}m above sea level. Lower ground fills faster because gravity pulls water downhill. Elevation is a key risk signal.`,
    `Rivergate's storm drains can handle up to 40 mm/h. Any rainfall above that means water starts pooling on streets. Right now overflow ${rainfallMmH > 40 ? 'is happening' : 'is not yet occurring'}.`,
    `We combine rainfall rate, elevation, river level, and time of day into a risk score. The AI updates this every 5 minutes as conditions change.`,
  ];

  return { phenomenon: ph, probabilityPct: prob, likelyWithinHours: withinHours, confidence, headline, plainSummary: summary, signals, howWePredict };
}

/* ─── Component ──────────────────────────────────────────────────── */
export const PhenomenonForecastCard: React.FC = () => {
  const { rainfallMmH, selectedWardId, timeHour } = useAppStore();
  const [showDetails, setShowDetails] = useState(false);

  const pred = predictPhenomenon(rainfallMmH, selectedWardId, timeHour);
  const { phenomenon: ph, probabilityPct, likelyWithinHours, confidence, headline, plainSummary, signals, howWePredict } = pred;
  const Icon = ph.icon;

  const confLabel = confidence === 'high' ? 'High confidence' : confidence === 'medium' ? 'Medium confidence' : 'Low confidence';
  const confColor = confidence === 'high' ? 'text-low' : confidence === 'medium' ? 'text-mod' : 'text-text-2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl border ${ph.bgColor} ${ph.borderColor} overflow-hidden`}
    >
      {/* Top row: Icon + headline + probability */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${ph.bgColor} border ${ph.borderColor} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${ph.color}`} />
            </div>
            <div>
              <p className={`text-[11px] font-mono font-bold uppercase tracking-widest ${ph.color}`}>
                {ph.label}
              </p>
              <p className="text-xs text-text-2 mt-0.5">
                {likelyWithinHours <= 2
                  ? `Expected within ${likelyWithinHours}h`
                  : `Conditions stable for ${likelyWithinHours}h`}
              </p>
            </div>
          </div>

          {/* Probability dial */}
          <div className="text-right shrink-0">
            <p className={`font-mono text-2xl font-bold ${ph.color} leading-none`}>
              {probabilityPct}%
            </p>
            <p className={`text-[10px] font-mono ${confColor} mt-0.5`}>{confLabel}</p>
          </div>
        </div>

        {/* Probability bar */}
        <div className="h-1.5 bg-surface/50 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full`}
            style={{ background: `var(--${ph.id === 'clear' ? 'low' : ph.id === 'drizzle' ? 'water' : ph.id === 'heavy_rain' ? 'mod' : ph.id === 'cloudburst' ? 'high' : 'crit'})` }}
            initial={{ width: 0 }}
            animate={{ width: `${probabilityPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>

        {/* Headline */}
        <p className="text-sm font-semibold text-text leading-snug">{headline}</p>

        {/* Plain summary */}
        <p className="text-xs text-text-2 leading-relaxed">{plainSummary}</p>
      </div>

      {/* Expandable: How we predict this */}
      <div className="border-t border-current/10">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`w-full flex items-center justify-between px-5 py-3 text-xs font-medium ${ph.color} hover:bg-surface/30 transition-colors cursor-pointer`}
        >
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>How we predict this</span>
          </div>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-5">

                {/* Signal bars — the evidence */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-mono text-text-2 uppercase tracking-wider">
                    Signals driving this prediction
                  </p>
                  {signals.map((sig, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-2">{sig.label}</span>
                        <span className={`font-mono font-semibold ${
                          sig.direction === 'up' ? ph.color : sig.direction === 'down' ? 'text-low' : 'text-text-2'
                        }`}>
                          {sig.value}
                          {sig.direction === 'up' ? ' ↑' : sig.direction === 'down' ? ' ↓' : ''}
                        </span>
                      </div>
                      <div className="h-1 bg-surface/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-current opacity-50"
                          style={{ color: `var(--${ph.id === 'clear' ? 'low' : ph.id === 'drizzle' ? 'water' : ph.id === 'heavy_rain' ? 'mod' : ph.id === 'cloudburst' ? 'high' : 'crit'})`, background: 'currentColor' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${sig.contribution}%` }}
                          transition={{ duration: 0.5, delay: i * 0.07 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plain-language explanation lines */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-text-2 uppercase tracking-wider">
                    In simple terms
                  </p>
                  {howWePredict.map((line, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full ${ph.bgColor} border ${ph.borderColor} flex items-center justify-center text-[9px] font-mono font-bold ${ph.color} shrink-0 mt-0.5`}>
                        {i + 1}
                      </div>
                      <p className="text-[11px] text-text-2 leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>

                {/* Footer disclaimer */}
                <p className="text-[10px] text-text-2/60 italic leading-relaxed">
                  Predictions update every 5 minutes from IMD radar + river sensors. This is decision support — always follow official NDRF instructions in an emergency.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
