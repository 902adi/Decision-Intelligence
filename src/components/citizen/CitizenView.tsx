import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { rivergateWards, rivergateCamps } from '../../data/rivergate';
import { 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  LifeBuoy, 
  AlertTriangle, 
  CheckCircle2, 
  Droplet, 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Camera 
} from 'lucide-react';
import { SosRequestModal } from './SosRequestModal';
import { ReportProblemModal } from './ReportProblemModal';
import { SafeRouteModal } from './SafeRouteModal';
import { GpsTrackerWidget } from '../common/GpsTrackerWidget';
import { AnimatedBackground } from '../common/AnimatedBackground';
import { PhenomenonForecastCard } from './PhenomenonForecastCard';
import { playClickSound } from '../../utils/soundEffects';

export const CitizenView: React.FC = () => {
  const { 
    selectedWardId, 
    setSelectedWardId, 
    graph, 
    submitCheckin, 
    setIsHelplinesOpen,
    activeCitizenSos,
    colorblindSafe,
    showToast,
    rainfallMmH
  } = useAppStore();
  const { t, language } = useI18n();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);

  const ward = rivergateWards.find(w => w.id === selectedWardId) || rivergateWards[0];
  const wardRisk = graph.wardRisks[selectedWardId] || { riskScore: 40, riskCategory: 'mod', waterLevelMeters: 0.3 };
  const route = graph.evacuationRoutes[selectedWardId];
  const nearestCamp = rivergateCamps[0]; // Camp B Greenfield Stadium
  const campSupply = graph.campsStatus[nearestCamp.id];

  const wardName = language === 'hi' ? ward.nameHi : language === 'mr' ? ward.nameMr : ward.name;

  // Plain-language decisive verdict based on risk category
  let statusBadge = "Safe & Dry";
  let statusColor = 'text-low border-low/40 bg-low/10';
  let patternClass = colorblindSafe ? 'pattern-low' : '';
  let statusExplanation = `Stay indoors — water is safe. All roads around ${wardName} remain clear and dry.`;

  if (wardRisk.riskCategory === 'crit') {
    statusBadge = "Critical Danger";
    statusColor = 'text-crit border-crit/40 bg-crit/15';
    patternClass = colorblindSafe ? 'pattern-crit' : '';
    statusExplanation = `Move to second floor or evacuate to ${route?.campName || 'Relief Camp'} now. Street water is deep (${wardRisk.waterLevelMeters}m).`;
  } else if (wardRisk.riskCategory === 'high') {
    statusBadge = "Rising Water";
    statusColor = 'text-high border-high/40 bg-high/15';
    patternClass = colorblindSafe ? 'pattern-high' : '';
    statusExplanation = `Prepare emergency kit and stay alert. Water is rising on ground floors near ${wardName}.`;
  } else if (wardRisk.riskCategory === 'mod') {
    statusBadge = "Heavy Rain Alert";
    statusColor = 'text-mod border-mod/40 bg-mod/15';
    patternClass = colorblindSafe ? 'pattern-mod' : '';
    statusExplanation = `Stay indoors and avoid basement areas. Heavy rain is active across ${wardName}.`;
  }

  // Checklist items in plain simple English
  const checklists = wardRisk.riskCategory === 'crit' || wardRisk.riskCategory === 'high' ? [
    'Turn off main electricity switch and cooking gas cylinder.',
    'Pack identity cards, phone charger, medicines, and drinking water in a plastic bag.',
    'Move to the second floor, or follow the dry walking path to the shelter.',
    'Never walk or drive into moving water above your ankles.'
  ] : [
    'Charge your mobile phone and battery powerbanks to 100%.',
    'Fill clean water bottles and keep emergency snacks ready.',
    'Keep emergency number 112 on speed dial.',
    'Stay away from broken electric wires and open street drains.'
  ];

  return (
    <div className="relative">
      {/* Ambient background: rain + orbs */}
      <AnimatedBackground rainfallMmH={rainfallMmH} section="citizen" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-28">
      {/* 1. GPS Location Tracker Widget */}
      <GpsTrackerWidget onWardLocated={(id) => setSelectedWardId(id)} />

      {/* 2. Pick Area Bar (Dropdown) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface border border-line rounded-panel shadow-sm card-3d">
        <div className="flex items-center gap-2.5 px-2 flex-1">
          <MapPin className="w-4 h-4 text-accent shrink-0" />
          <div className="flex-1">
            <span className="text-[11px] font-mono text-text-2 block uppercase">Current Location</span>
            <select
              value={selectedWardId}
              onChange={(e) => { playClickSound(); setSelectedWardId(e.target.value); }}
              className="w-full bg-transparent text-sm font-semibold text-text focus:outline-none cursor-pointer"
              aria-label="Select area"
            >
              {rivergateWards.map((w) => (
                <option key={w.id} value={w.id} className="bg-surface text-text">
                  Ward {w.number}: {language === 'hi' ? w.nameHi : language === 'mr' ? w.nameMr : w.name} ({w.elevation}m high ground)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. ONE LARGE STATUS CARD IN PLAIN WORDS */}
      <div className={`p-6 sm:p-8 rounded-panel border shadow-calm relative overflow-hidden transition-all duration-300 card-3d ${statusColor} ${patternClass}`}>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-pill bg-surface/85 border border-current font-bold">
              {statusBadge}
            </span>
            <div className="font-mono text-xs opacity-90">
              Risk score: <strong className="text-base">{wardRisk.riskScore}</strong> / 100
            </div>
          </div>

          <h1 className="font-heading text-xl sm:text-2xl font-bold leading-snug tracking-tight text-text">
            {statusExplanation}
          </h1>

          {/* Active SOS Tracker banner if citizen already sent SOS */}
          {activeCitizenSos && (
            <div 
              onClick={() => { playClickSound(); setIsSosOpen(true); }}
              className="cursor-pointer p-3 rounded-control bg-surface/90 border border-sos text-text flex items-center justify-between gap-3 text-xs shadow-sm hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-sos animate-spin" />
                <span>Rescue Request: <strong>{activeCitizenSos.status.toUpperCase()}</strong></span>
              </div>
              <span className="text-accent underline text-[11px]">Track Rescue &rarr;</span>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Phenomenon Forecast ── */}
      <PhenomenonForecastCard />

      {/* 4. THREE ACTIONS ONLY: Show safe route, Call for help (SOS), Helplines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Action 1: Show Safe Route */}
        <button
          onClick={() => { playClickSound(); setIsRouteOpen(true); }}
          className="p-4 rounded-panel bg-surface hover:bg-surface-2 border border-line hover:border-accent text-left transition-all group flex flex-col justify-between shadow-sm card-3d"
        >
          <div className="w-10 h-10 rounded-control bg-accent/15 text-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-semibold text-sm text-text block mb-0.5">
              Dry Walking Path
            </span>
            <span className="text-xs text-text-2 block">
              Avoids flooded roads
            </span>
          </div>
        </button>

        {/* Action 2: Call for help (SOS) */}
        <button
          onClick={() => { playClickSound(); setIsSosOpen(true); }}
          className="p-4 rounded-panel bg-surface hover:bg-sos/10 border border-line hover:border-sos text-left transition-all group flex flex-col justify-between shadow-sm card-3d"
        >
          <div className="w-10 h-10 rounded-control bg-sos/20 text-sos flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-semibold text-sm text-text block mb-0.5">
              Send Rescue Team
            </span>
            <span className="text-xs text-text-2 block">
              Boats & ambulances
            </span>
          </div>
        </button>

        {/* Action 3: Helplines */}
        <button
          onClick={() => { playClickSound(); setIsHelplinesOpen(true); }}
          className="p-4 rounded-panel bg-surface hover:bg-surface-2 border border-line hover:border-text-2 text-left transition-all group flex flex-col justify-between shadow-sm card-3d"
        >
          <div className="w-10 h-10 rounded-control bg-surface-2 text-text flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-semibold text-sm text-text block mb-0.5">
              Emergency Numbers
            </span>
            <span className="text-xs text-text-2 block">
              Dial 112, 108 or Police
            </span>
          </div>
        </button>
      </div>

      {/* 5. One-tap Community Check-in ("I'm safe", "I need help", "Evacuating") */}
      <div className="p-4 sm:p-5 rounded-panel bg-surface border border-line space-y-3 shadow-sm card-3d">
        <span className="text-xs font-semibold text-text-2 block uppercase tracking-wider">
          Are you and your family safe right now?
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { playClickSound(); submitCheckin('safe'); }}
            className="py-3 px-2 rounded-control bg-surface-2 hover:bg-low/15 border border-line hover:border-low/40 text-text hover:text-low text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-low" />
            <span>I am safe</span>
          </button>
          <button
            onClick={() => { playClickSound(); submitCheckin('need_help'); }}
            className="py-3 px-2 rounded-control bg-surface-2 hover:bg-mod/15 border border-line hover:border-mod/40 text-text hover:text-mod text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-mod" />
            <span>I need help</span>
          </button>
          <button
            onClick={() => { playClickSound(); submitCheckin('evacuating'); }}
            className="py-3 px-2 rounded-control bg-surface-2 hover:bg-accent/15 border border-line hover:border-accent/40 text-text hover:text-accent text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-accent" />
            <span>Leaving now</span>
          </button>
        </div>
      </div>

      {/* 6. Report a Problem Trigger */}
      <div 
        onClick={() => { playClickSound(); setIsReportOpen(true); }}
        className="cursor-pointer p-4 rounded-panel bg-surface hover:bg-surface-2 border border-line hover:border-accent/50 transition-colors flex items-center justify-between shadow-sm card-3d"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-control bg-accent/10 text-accent flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-semibold text-sm text-text block">
              Report rising water or blocked road
            </span>
            <span className="text-xs text-text-2">
              Takes 20 seconds. Alerts emergency responders in under 1 second.
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-text-2" />
      </div>

      {/* 7. Nearest Relief Camp with Real Photo */}
      <div className="p-5 rounded-panel bg-surface border border-line space-y-4 shadow-sm card-3d">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            <div>
              <span className="text-[11px] font-mono text-text-2 block uppercase">
                Nearest Safe Community Shelter
              </span>
              <span className="font-heading font-semibold text-base text-text block">
                {nearestCamp.name}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-accent">
            12 min walk
          </span>
        </div>

        {/* Shelter Image Preview */}
        <div className="rounded-control overflow-hidden border border-line aspect-[21/9] relative shadow-md">
          <img 
            src="/images/citizen_shelter_center.jpg" 
            alt="Rivergate community relief shelter and medical aid center" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[11px] text-text">
            <span className="font-medium">Indoor dry high-ground arena &bull; Medical desk on site</span>
            <span className="text-low font-semibold font-mono">Open & Fully Stocked</span>
          </div>
        </div>

        {/* Live capacity and supplies */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-control bg-surface-2 border border-line">
            <span className="text-[11px] text-text-2 block mb-0.5">Food packets</span>
            <span className="font-mono font-bold text-sm text-text">{nearestCamp.foodPackets}</span>
            <span className="text-[10px] text-text-2 block">free hot meals</span>
          </div>
          <div className="p-3 rounded-control bg-surface-2 border border-line">
            <span className="text-[11px] text-text-2 block mb-0.5">Clean water</span>
            <span className="font-mono font-bold text-sm text-text">{nearestCamp.drinkingWaterLiters} L</span>
            <span className="text-[10px] text-text-2 block">sealed bottles</span>
          </div>
          <div className="p-3 rounded-control bg-surface-2 border border-line">
            <span className="text-[11px] text-text-2 block mb-0.5">Medicines</span>
            <span className="font-mono font-bold text-sm text-text">{nearestCamp.medicalKits}</span>
            <span className="text-[10px] text-text-2 block">first-aid ready</span>
          </div>
        </div>
      </div>

      {/* 8. "What to do now" Checklist */}
      <div className="p-5 rounded-panel bg-surface border border-line space-y-3 shadow-sm card-3d">
        <span className="font-heading font-semibold text-sm text-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          What you should do right now
        </span>
        <div className="space-y-2">
          {checklists.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-text-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <SosRequestModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <ReportProblemModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <SafeRouteModal isOpen={isRouteOpen} onClose={() => setIsRouteOpen(false)} />
      </div>
    </div>
  );
};
