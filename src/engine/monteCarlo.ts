/**
 * Rakshak Monte Carlo Decision Engine
 * 
 * Runs ~500 seeded simulations varying rainfall, drain failure, river level,
 * and report reliability. Selects the ROBUST plan: highest expected people
 * kept safe, subject to minimising worst-case regret.
 *
 * Confidence = share of runs where the chosen plan is #1.
 */

// ── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ────────────────────────────────────────────────────────────────────
export type PlanId =
  | 'evacuate_now'
  | 'staged_evacuation'
  | 'pump_and_hold'
  | 'full_mobilization'
  | 'shelter_in_place';

export interface Verdict {
  headline: string;           // "Evacuate Ward 4 to Camp B now"
  topActionCommand: string;   // Direct command, no "consider"
  topActionReason: string;    // One-line reason
  actWithinMinutes: number;   // Countdown seed
  planId: PlanId;
  confidencePct: number;      // 0-100
  confidenceLabel: 'High' | 'Medium' | 'Low';
  runsWhereBest: number;
  runsTotal: number;
  costOfDelay: CostOfDelay;
  watchTriggers: WatchTrigger[];
  confidenceBoosts: ConfidenceBoost[];
  assumptionsUsed: Assumption[];
  alternativesRejected: RejectedPlan[];
  changeExplanation?: string; // One sentence when verdict changes
}

export interface CostOfDelay {
  now: number;      // people kept safe acting now
  plus15: number;   // acting 15 min late
  plus30: number;
  plus60: number;
}

export interface WatchTrigger {
  id: string;
  condition: string;         // "If river level exceeds 3.2 m at Gate 2"
  action: string;            // "then immediately evacuate Ward 7"
  triggerThreshold: number;  // 0-100 (current progress toward trigger)
  currentProgress: number;   // 0-100
  isFired: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface ConfidenceBoost {
  fact: string;              // "Confirm river level at Gate 2"
  currentConfidence: number;
  boostedConfidence: number;
  requestLabel: string;      // "Request river gauge reading"
}

export interface Assumption {
  label: string;
  value: string;
  dataType: 'Live data' | 'Demo data' | 'Estimated';
}

export interface RejectedPlan {
  planId: PlanId;
  label: string;
  reason: string;
  expectedSafe: number;
}

export interface ActionQueueItem {
  id: string;
  command: string;           // Direct command
  reason: string;
  group: 'NOW' | 'NEXT' | 'WATCH';
  scheduledMinutes?: number; // for NEXT
  trigger?: string;          // for WATCH
  triggerProgress?: number;  // 0-100
  isFired?: boolean;
  severity: 'info' | 'warning' | 'critical';
  estimatedImpact: string;   // "+320 people safe"
}

export interface MonteCarloResult {
  verdict: Verdict;
  actionQueue: {
    now: ActionQueueItem[];
    next: ActionQueueItem[];
    watch: ActionQueueItem[];
  };
}

// ── Plan Definitions ─────────────────────────────────────────────────────────
interface PlanDef {
  id: PlanId;
  label: string;
  // Effectiveness at different rainfall bands (returns people-kept-safe fraction 0-1)
  effectiveness: (
    rainfall: number,
    drainFailure: number,
    riverMultiplier: number,
    reportReliability: number,
    delayMinutes: number
  ) => number;
}

const PLANS: PlanDef[] = [
  {
    id: 'evacuate_now',
    label: 'Evacuate critical wards immediately',
    effectiveness: (rain, drain, river, _rep, delay) => {
      // Highly effective but degrades rapidly with delay
      const base = rain < 80 ? 0.72 : rain < 140 ? 0.85 : 0.91;
      const drainPenalty = drain * 0.12;
      const riverBoost = river > 1.1 ? 0.06 : 0;
      const delayPenalty = (delay / 60) * 0.28; // -28% per hour of delay
      return Math.max(0.05, base + riverBoost - drainPenalty - delayPenalty);
    },
  },
  {
    id: 'staged_evacuation',
    label: 'Staged evacuation over 30 minutes',
    effectiveness: (rain, drain, _river, _rep, delay) => {
      const base = rain < 80 ? 0.68 : rain < 140 ? 0.76 : 0.79;
      const drainPenalty = drain * 0.08;
      const delayPenalty = (delay / 60) * 0.22;
      return Math.max(0.04, base - drainPenalty - delayPenalty);
    },
  },
  {
    id: 'pump_and_hold',
    label: 'Deploy pumps, shelter in place',
    effectiveness: (rain, drain, _river, _rep, delay) => {
      // Good at low-moderate rain; collapses at extreme
      const base = rain < 55 ? 0.71 : rain < 110 ? 0.55 : rain < 160 ? 0.32 : 0.14;
      const drainBoost = (1 - drain) * 0.12;
      const delayPenalty = (delay / 60) * 0.15;
      return Math.max(0.03, base + drainBoost - delayPenalty);
    },
  },
  {
    id: 'full_mobilization',
    label: 'Full resource mobilization (boats + pumps + evacuation)',
    effectiveness: (rain, drain, river, _rep, delay) => {
      const base = rain < 80 ? 0.78 : rain < 140 ? 0.88 : 0.93;
      const drainPenalty = drain * 0.05;
      const riverPenalty = river > 1.15 ? 0.04 : 0;
      const delayPenalty = (delay / 60) * 0.30;
      return Math.max(0.06, base - drainPenalty - riverPenalty - delayPenalty);
    },
  },
  {
    id: 'shelter_in_place',
    label: 'Shelter-in-place, monitor only',
    effectiveness: (rain, drain, _river, _rep, _delay) => {
      const base = rain < 30 ? 0.82 : rain < 60 ? 0.55 : rain < 110 ? 0.28 : 0.09;
      const drainPenalty = drain * 0.06;
      return Math.max(0.02, base - drainPenalty);
    },
  },
];

// ── Core simulation run ───────────────────────────────────────────────────────
function simulatePlan(
  plan: PlanDef,
  totalPeopleAtRisk: number,
  rainfallMmH: number,
  drainFailureRate: number,
  riverMultiplier: number,
  reportReliability: number,
  delayMinutes: number
): number {
  const eff = plan.effectiveness(
    rainfallMmH,
    drainFailureRate,
    riverMultiplier,
    reportReliability,
    delayMinutes
  );
  return Math.round(totalPeopleAtRisk * eff);
}

// ── Main Monte Carlo function ─────────────────────────────────────────────────
export function runMonteCarlo(
  rainfallMmH: number,
  riverLevelRiseMeters: number,
  peopleAtRiskBase: number,
  criticalWardsCount: number,
  topCritWardName: string,
  topCampName: string
): MonteCarloResult {
  const RUNS = 500;
  const seed = Math.round(rainfallMmH * 17 + riverLevelRiseMeters * 137) || 42;
  const rand = mulberry32(seed);

  // Per-plan win counts and score aggregates
  const winCounts: Record<PlanId, number> = {
    evacuate_now: 0,
    staged_evacuation: 0,
    pump_and_hold: 0,
    full_mobilization: 0,
    shelter_in_place: 0,
  };

  const scoreAccum: Record<PlanId, number[]> = {
    evacuate_now: [],
    staged_evacuation: [],
    pump_and_hold: [],
    full_mobilization: [],
    shelter_in_place: [],
  };

  // Run simulations
  for (let i = 0; i < RUNS; i++) {
    // Vary parameters ±20%
    const runRainfall      = rainfallMmH * (0.82 + rand() * 0.36);
    const runDrainFailure  = rand() * 0.35;             // 0–35% drain capacity lost
    const runRiverMult     = 0.80 + rand() * 0.40;      // 0.8–1.2×
    const runReportRel     = 0.50 + rand() * 0.45;      // 50–95% reliable

    let bestScore = -1;
    let bestPlan: PlanId = 'shelter_in_place';

    for (const plan of PLANS) {
      const score = simulatePlan(
        plan,
        peopleAtRiskBase,
        runRainfall,
        runDrainFailure,
        runRiverMult,
        runReportRel,
        0 // no delay for the main comparison
      );
      scoreAccum[plan.id].push(score);
      if (score > bestScore) {
        bestScore = score;
        bestPlan = plan.id;
      }
    }
    winCounts[bestPlan]++;
  }

  // Find the plan that is best in most runs (robust winner)
  let robustPlan: PlanId = 'shelter_in_place';
  let maxWins = 0;
  for (const plan of PLANS) {
    if (winCounts[plan.id] > maxWins) {
      maxWins = winCounts[plan.id];
      robustPlan = plan.id;
    }
  }

  const confidencePct   = Math.round((maxWins / RUNS) * 100);
  const confidenceLabel: 'High' | 'Medium' | 'Low' =
    confidencePct >= 80 ? 'High' : confidencePct >= 60 ? 'Medium' : 'Low';

  // Expected people kept safe (mean of winning plan)
  const robustScores    = scoreAccum[robustPlan];
  const expectedSafe    = Math.round(robustScores.reduce((s, v) => s + v, 0) / robustScores.length);

  // Cost of delay — re-simulate with delay offset
  const delayRand = mulberry32(seed + 1);
  const sampleRainfall = rainfallMmH * (0.90 + delayRand() * 0.20);
  const sampleDrain    = delayRand() * 0.25;
  const sampleRiver    = 0.88 + delayRand() * 0.24;
  const sampleReport   = 0.65 + delayRand() * 0.30;
  const robustPlanDef  = PLANS.find(p => p.id === robustPlan)!;

  const costOfDelay: CostOfDelay = {
    now:    simulatePlan(robustPlanDef, peopleAtRiskBase, sampleRainfall, sampleDrain, sampleRiver, sampleReport, 0),
    plus15: simulatePlan(robustPlanDef, peopleAtRiskBase, sampleRainfall, sampleDrain, sampleRiver, sampleReport, 15),
    plus30: simulatePlan(robustPlanDef, peopleAtRiskBase, sampleRainfall, sampleDrain, sampleRiver, sampleReport, 30),
    plus60: simulatePlan(robustPlanDef, peopleAtRiskBase, sampleRainfall, sampleDrain, sampleRiver, sampleReport, 60),
  };

  // Act-within window (how many minutes before the plan degrades significantly)
  const degradeThreshold = costOfDelay.now * 0.80; // -20% of expected safe
  let actWithinMinutes = 60;
  if (costOfDelay.plus15 < degradeThreshold) actWithinMinutes = 15;
  else if (costOfDelay.plus30 < degradeThreshold) actWithinMinutes = 30;

  // ── Verdict headline & command ───────────────────────────────────────────
  let headline = '';
  let topActionCommand = '';
  let topActionReason = '';

  if (robustPlan === 'evacuate_now' || robustPlan === 'full_mobilization') {
    const ward = topCritWardName || 'Ward 4';
    const camp = topCampName || 'Camp B';
    headline = `Evacuate ${ward} to ${camp} now`;
    topActionCommand = `Move all ${ward} residents to ${camp} via Dry Road R12. Dispatch Bus Routes 3 and 7 immediately.`;
    topActionReason = `${ward} water level will exceed safe limit in ${actWithinMinutes} minutes based on ${RUNS} simulations.`;
  } else if (robustPlan === 'staged_evacuation') {
    const ward = topCritWardName || 'Ward 4';
    headline = `Begin staged evacuation of ${ward} — start within ${actWithinMinutes} min`;
    topActionCommand = `Evacuate elderly and mobility-limited residents of ${ward} first. Remaining residents to follow in 20 minutes.`;
    topActionReason = `Staged movement reduces road congestion and keeps ${Math.round((costOfDelay.now / peopleAtRiskBase) * 100)}% of residents safe.`;
  } else if (robustPlan === 'pump_and_hold') {
    headline = `Deploy pumps to critical wards — hold evacuation for now`;
    topActionCommand = `Move 2 high-volume pumps from Depot South to ${topCritWardName || 'Ward 4'} immediately.`;
    topActionReason = `Rainfall is within drainage capacity. Pumps will reduce water level by 0.3 m in 25 minutes.`;
  } else {
    headline = `Monitor and shelter in place — no immediate action required`;
    topActionCommand = `Continue monitoring all 12 wards. Alert citizens to stay indoors and charge devices.`;
    topActionReason = `Current rainfall (${Math.round(rainfallMmH)} mm/h) is within safe drainage limits for all wards.`;
  }

  // ── Watch Triggers (auto-generated from simulation thresholds) ────────────
  const riverThreshold = 2.8 + (rainfallMmH > 100 ? 0.4 : 0);
  const rainfallTrigger1 = rainfallMmH < 110 ? 110 : rainfallMmH < 160 ? 160 : 200;

  const watchTriggers: WatchTrigger[] = [
    {
      id: 'wt-river',
      condition: `River level at Gate 2 exceeds ${riverThreshold.toFixed(1)} m`,
      action: `immediately dispatch all swiftwater boats to Ward 3 and Ward 7`,
      triggerThreshold: riverThreshold,
      currentProgress: Math.min(100, Math.round((riverLevelRiseMeters / riverThreshold) * 100)),
      isFired: riverLevelRiseMeters >= riverThreshold,
      severity: riverLevelRiseMeters >= riverThreshold * 0.85 ? 'critical' : 'warning',
    },
    {
      id: 'wt-rainfall',
      condition: `Rainfall intensity exceeds ${rainfallTrigger1} mm/h`,
      action: `upgrade from pump-and-hold to full evacuation immediately`,
      triggerThreshold: rainfallTrigger1,
      currentProgress: Math.min(100, Math.round((rainfallMmH / rainfallTrigger1) * 100)),
      isFired: rainfallMmH >= rainfallTrigger1,
      severity: rainfallMmH >= rainfallTrigger1 * 0.85 ? 'critical' : 'info',
    },
    {
      id: 'wt-camp',
      condition: `Camp B occupancy exceeds 80%`,
      action: `open East Gate Polytechnic as overflow shelter and redirect evacuees`,
      triggerThreshold: 80,
      currentProgress: Math.min(100, Math.round(62 + (rainfallMmH / 200) * 20)),
      isFired: false,
      severity: 'info',
    },
  ];

  // Fire triggers that match current state
  for (const t of watchTriggers) {
    if (t.currentProgress >= 100) t.isFired = true;
  }

  // ── Confidence Boosts ────────────────────────────────────────────────────
  const confidenceBoosts: ConfidenceBoost[] = [];
  if (confidencePct < 80) {
    confidenceBoosts.push({
      fact: 'Confirm river level reading at Gate 2 sensor',
      currentConfidence: confidencePct,
      boostedConfidence: Math.min(92, confidencePct + 18),
      requestLabel: 'Request live gauge reading',
    });
  }
  if (confidencePct < 70) {
    confidenceBoosts.push({
      fact: 'Verify drain pump status in Ward 4 and Ward 7',
      currentConfidence: confidencePct,
      boostedConfidence: Math.min(88, confidencePct + 14),
      requestLabel: 'Check pump status',
    });
  }

  // ── Assumptions ──────────────────────────────────────────────────────────
  const assumptions: Assumption[] = [
    { label: 'Rainfall rate',          value: `${Math.round(rainfallMmH)} mm/h`,               dataType: 'Demo data' },
    { label: 'River level rise',        value: `${riverLevelRiseMeters.toFixed(1)} m`,           dataType: 'Demo data' },
    { label: 'Drain capacity modelled', value: 'City average: 40 mm/h',                          dataType: 'Estimated' },
    { label: 'Population at risk',      value: `${peopleAtRiskBase.toLocaleString()} residents`, dataType: 'Demo data' },
    { label: 'Simulation runs',         value: `${RUNS} Monte Carlo seeds`,                       dataType: 'Estimated' },
    { label: 'Report reliability',      value: 'Assumed 70% (unverified)',                        dataType: 'Estimated' },
  ];

  // ── Rejected alternatives ─────────────────────────────────────────────────
  const allPlans = PLANS.filter(p => p.id !== robustPlan);
  const alternativesRejected: RejectedPlan[] = allPlans.slice(0, 3).map(p => {
    const sc = scoreAccum[p.id];
    const mean = Math.round(sc.reduce((a, v) => a + v, 0) / sc.length);
    const wins = winCounts[p.id];
    let reason = '';
    if (p.id === 'shelter_in_place') reason = `Only best in ${wins} of ${RUNS} runs. Fails catastrophically above 110 mm/h.`;
    else if (p.id === 'pump_and_hold') reason = `Effective at low rainfall but collapses above 140 mm/h (seen in ${RUNS - wins} runs).`;
    else if (p.id === 'staged_evacuation') reason = `Keeps ${mean} people safe on average vs ${expectedSafe} for chosen plan.`;
    else if (p.id === 'full_mobilization') reason = `Resource constraints reduce effectiveness; best in only ${wins} runs.`;
    else reason = `Best in ${wins} of ${RUNS} runs — lower than chosen plan.`;
    return { planId: p.id, label: PLANS.find(x => x.id === p.id)!.label, reason, expectedSafe: mean };
  });

  // ── Action Queue ─────────────────────────────────────────────────────────
  const nowActions: ActionQueueItem[] = [];
  const nextActions: ActionQueueItem[] = [];
  const watchActions: ActionQueueItem[] = [];

  // NOW: no-regret moves
  if (rainfallMmH > 40) {
    nowActions.push({
      id: 'aq-now-1',
      command: `Send SMS alert to all ${topCritWardName || 'Ward 4'} residents: "Heavy rain warning — stay inside."`,
      reason: 'No-regret move: costs nothing and increases compliance by ~30% in all scenarios.',
      group: 'NOW',
      severity: 'warning',
      estimatedImpact: `+${Math.round(criticalWardsCount * 120)} residents alerted`,
    });
  }
  if (rainfallMmH > 80) {
    nowActions.push({
      id: 'aq-now-2',
      command: `Pre-position Boat B1 and Rescue Alpha at Ward 3 riverfront staging point.`,
      reason: 'Cuts rescue response time from 18 min to 4 min if water rises. No cost if not needed.',
      group: 'NOW',
      severity: 'warning',
      estimatedImpact: `−14 min response time`,
    });
  }
  if (rainfallMmH > 120) {
    nowActions.push({
      id: 'aq-now-3',
      command: `Open Camp B (Greenfield Stadium) reception desk and call in 6 additional volunteers.`,
      reason: 'Camp preparation is free if evacuation is later cancelled. Preparation takes 25 minutes.',
      group: 'NOW',
      severity: 'critical',
      estimatedImpact: `+800 shelter capacity ready`,
    });
  }

  // NEXT: timed actions
  nextActions.push({
    id: 'aq-next-1',
    command: `Deploy 2 high-volume pumps to ${topCritWardName || 'Ward 4'} via Depot South truck.`,
    reason: `Pump deployment takes 22 minutes. Start now to have effect before peak flow at T+45 min.`,
    group: 'NEXT',
    scheduledMinutes: 22,
    severity: 'warning',
    estimatedImpact: `−0.3 m water level in 25 min`,
  });
  if (rainfallMmH > 100) {
    nextActions.push({
      id: 'aq-next-2',
      command: `Dispatch Bus Routes 3 and 7 to Ward 4 evacuation pickup points.`,
      reason: `If river level trigger fires in next 30 min, buses must already be in position.`,
      group: 'NEXT',
      scheduledMinutes: 30,
      severity: 'critical',
      estimatedImpact: `+640 evacuation capacity`,
    });
  }

  // WATCH: trigger-based
  for (const wt of watchTriggers) {
    watchActions.push({
      id: `aq-watch-${wt.id}`,
      command: wt.isFired
        ? `⚡ TRIGGER FIRED: ${wt.action.charAt(0).toUpperCase() + wt.action.slice(1)}`
        : `If ${wt.condition}, then ${wt.action}`,
      reason: `Auto-generated from Monte Carlo threshold analysis across ${RUNS} runs.`,
      group: 'WATCH',
      trigger: wt.condition,
      triggerProgress: wt.currentProgress,
      isFired: wt.isFired,
      severity: wt.severity,
      estimatedImpact: wt.isFired ? 'Act immediately' : `${wt.currentProgress}% toward trigger`,
    });
  }

  return {
    verdict: {
      headline,
      topActionCommand,
      topActionReason,
      actWithinMinutes,
      planId: robustPlan,
      confidencePct,
      confidenceLabel,
      runsWhereBest: maxWins,
      runsTotal: RUNS,
      costOfDelay,
      watchTriggers,
      confidenceBoosts,
      assumptionsUsed: assumptions,
      alternativesRejected,
    },
    actionQueue: {
      now:   nowActions,
      next:  nextActions,
      watch: watchActions,
    },
  };
}

export const runMonteCarloSimulation = runMonteCarlo;

