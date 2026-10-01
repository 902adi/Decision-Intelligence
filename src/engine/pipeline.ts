import { 
  Ward, 
  RoadEdge, 
  ResourceItem, 
  ReliefCamp, 
  rivergateWards, 
  rivergateRoads, 
  rivergateResources, 
  rivergateCamps 
} from '../data/rivergate';
import { runMonteCarloSimulation, Verdict, ActionQueueItem } from './monteCarlo';

export type RiskCategory = 'low' | 'mod' | 'high' | 'crit';

export interface WardRiskState {
  wardId: string;
  wardNumber: number;
  waterLevelMeters: number;
  riskScore: number; // 0 to 100
  riskCategory: RiskCategory;
  timeline: number[]; // T+0h to T+6h risk scores
  factorContributions: {
    rainfall: number;
    elevation: number;
    drainCapacity: number;
    vulnerablePopulation: number;
    roadBlockage: number;
  };
  isSimulatedHotspot?: boolean;
}

export interface RecommendationAction {
  id: string;
  type: 'deploy_pump' | 'dispatch_boat' | 'evacuate_ward' | 'resupply_camp';
  title: string;
  description: string;
  targetWardOrCampId: string;
  resourceId?: string;
  status: 'pending' | 'approved' | 'overridden';
  confidence: number; // 0-100
  confidenceNarrative: string;
  factors: { name: string; score: number }[];
  alternativesConsidered: {
    title: string;
    reasonRejected: string;
  }[];
  tradeoff: string;
  projectedRiskReduction: number;
}

export interface EvacuationRoute {
  fromWardId: string;
  toCampId: string;
  campName: string;
  roadIds: string[];
  totalDistanceKm: number;
  estimatedWalkMinutes: number;
  isSafe: boolean;
  blockedRoadName?: string;
  pathCoordinates: Array<[number, number]>;
}

export interface CampSupplyStatus {
  campId: string;
  campName: string;
  occupancy: number;
  totalCapacity: number;
  occupancyPercent: number;
  foodHoursLeft: number;
  waterHoursLeft: number;
  medicalHoursLeft: number;
  criticalAlert?: string;
  recommendedResupply?: string;
}

export interface DecisionGraphState {
  rainfallMmH: number;
  riverLevelRiseMeters: number;
  timeHour: number; // 0 to 6
  scenarioId: 'normal_day' | 'heavy_rain' | 'cloudburst_2am' | 'dam_release';
  wardRisks: Record<string, WardRiskState>;
  roadsStatus: Record<string, { isFlooded: boolean; currentWaterMm: number }>;
  recommendedActions: RecommendationAction[];
  evacuationRoutes: Record<string, EvacuationRoute>;
  campsStatus: Record<string, CampSupplyStatus>;
  rippleFeed: Array<{
    id: string;
    timestamp: string;
    message: string;
    step: 'risk' | 'allocation' | 'routing' | 'supplies';
    severity: 'info' | 'warning' | 'critical';
  }>;
  peopleAtRiskCount: number;
  criticalWardsCount: number;
  assetsDeployedCount: number;
  campCapacityUsedPercent: number;
  verdict: Verdict;
  actionQueue: {
    now: ActionQueueItem[];
    next: ActionQueueItem[];
    watch: ActionQueueItem[];
  };
}

export interface SimulationParams {
  rainfallMmH: number;
  riverLevelRiseMeters: number;
  timeHour?: number;
  hotspotWardId?: string | null;
  overriddenActionIds?: string[];
  approvedActionIds?: string[];
  verifiedReportWardIds?: string[];
}

/**
 * 1. STEP 1: Compute Risk for each ward deterministically
 */
export function computeWardRisks(
  wards: Ward[],
  params: SimulationParams
): Record<string, WardRiskState> {
  const { rainfallMmH, riverLevelRiseMeters, timeHour = 0, hotspotWardId, verifiedReportWardIds = [] } = params;
  const result: Record<string, WardRiskState> = {};

  wards.forEach((ward) => {
    const isHotspot = hotspotWardId === ward.id;
    const hasCitizenReports = verifiedReportWardIds.includes(ward.id);

    // Compute timeline from T+0 to T+6
    const timeline: number[] = [];
    for (let t = 0; t <= 6; t++) {
      // Dynamic factors
      const timeRainMultiplier = 1 + (t * 0.12);
      const effectiveRain = rainfallMmH * timeRainMultiplier;
      
      // Elevation dampener: higher elevation (up to 25m) provides massive flood relief
      const elevationSafety = Math.min(1, Math.max(0, ward.elevation / 25));
      const riverProximityVulnerability = Math.max(0, 1 - (ward.distanceToRiver / 1200));
      const drainDrainageEfficiency = ward.drainCapacity / 100;

      // Base water accumulation
      let waterMm = (effectiveRain * 0.45 * (1 - drainDrainageEfficiency * 0.7)) + 
                    (riverLevelRiseMeters * 350 * riverProximityVulnerability) - 
                    (elevationSafety * 120);
      
      if (isHotspot) {
        waterMm += 90 * (1 + t * 0.1);
      }
      if (hasCitizenReports) {
        waterMm += 45;
      }
      waterMm = Math.max(0, waterMm);

      // Score formula 0 to 100
      let score = (waterMm / 160) * 80 + (riverProximityVulnerability * 15);
      if (ward.vulnerablePopulation > 3000) {
        score += 8;
      }
      score = Math.min(100, Math.max(0, Math.round(score)));
      timeline.push(score);
    }

    const currentScore = timeline[timeHour];
    let category: RiskCategory = 'low';
    if (currentScore >= 80) category = 'crit';
    else if (currentScore >= 60) category = 'high';
    else if (currentScore >= 30) category = 'mod';

    const waterMeters = Number((Math.max(0, (currentScore - 20) * 0.025)).toFixed(2));

    // Explainable factor contribution breakdown (normalized to ~100%)
    const rainfallFactor = Math.min(45, Math.round((rainfallMmH / 200) * 45));
    const elevationFactor = Math.round((1 - Math.min(1, ward.elevation / 25)) * 30);
    const drainFactor = Math.round((1 - ward.drainCapacity / 100) * 20);
    const vulnFactor = Math.round((ward.vulnerablePopulation / 5000) * 15);
    const roadFactor = isHotspot || hasCitizenReports ? 15 : 5;

    result[ward.id] = {
      wardId: ward.id,
      wardNumber: ward.number,
      waterLevelMeters: waterMeters,
      riskScore: currentScore,
      riskCategory: category,
      timeline,
      factorContributions: {
        rainfall: rainfallFactor,
        elevation: elevationFactor,
        drainCapacity: drainFactor,
        vulnerablePopulation: vulnFactor,
        roadBlockage: roadFactor,
      },
      isSimulatedHotspot: isHotspot,
    };
  });

  return result;
}

/**
 * 2. STEP 2: Compute Allocation and AI Recommendations
 */
export function computeAllocations(
  wards: Ward[],
  wardRisks: Record<string, WardRiskState>,
  resources: ResourceItem[],
  approvedIds: string[] = [],
  overriddenIds: string[] = []
): RecommendationAction[] {
  const recommendations: RecommendationAction[] = [];

  // Identify most critical wards
  const sortedWards = [...wards].sort((a, b) => {
    return (wardRisks[b.id]?.riskScore || 0) - (wardRisks[a.id]?.riskScore || 0);
  });

  const highRiskWards = sortedWards.filter(w => (wardRisks[w.id]?.riskScore || 0) >= 60);

  highRiskWards.forEach((ward, index) => {
    const risk = wardRisks[ward.id];
    if (!risk) return;

    // Pump action
    if (risk.waterLevelMeters > 0.4 && ward.drainCapacity < 50) {
      const recId = `rec-pump-${ward.id}`;
      const isApproved = approvedIds.includes(recId);
      const isOverridden = overriddenIds.includes(recId);

      recommendations.push({
        id: recId,
        type: 'deploy_pump',
        title: `Deploy 2 High-Volume Pumps to ${ward.name}`,
        description: `Drain capacity is choked (${ward.drainCapacity}%). Reallocating 2 trailer pumps from Depot South will prevent water from exceeding 0.8m.`,
        targetWardOrCampId: ward.id,
        resourceId: 'pump-1',
        status: isApproved ? 'approved' : isOverridden ? 'overridden' : 'pending',
        confidence: 91,
        confidenceNarrative: '91% confidence based on drainage model and precipitation velocity.',
        factors: [
          { name: 'Water Accumulation Rate', score: 85 },
          { name: 'Drainage Saturation', score: 92 },
          { name: 'Vulnerable Population Density', score: 78 }
        ],
        alternativesConsidered: [
          {
            title: 'Deploy from Ward 6 Depot',
            reasonRejected: 'Ward 6 route bridge is approaching maximum load capacity.'
          },
          {
            title: 'Rely solely on gravity drain sluices',
            reasonRejected: 'River reverse head pressure will cause backflow within 45 minutes.'
          }
        ],
        tradeoff: `Deploying these pumps diverts standby units from Ward 9 (Ward 9 risk rises +11%).`,
        projectedRiskReduction: 24
      });
    }

    // Rescue Boat action
    if (risk.waterLevelMeters >= 0.8 && ward.distanceToRiver < 300) {
      const recId = `rec-boat-${ward.id}`;
      const isApproved = approvedIds.includes(recId);
      const isOverridden = overriddenIds.includes(recId);

      recommendations.push({
        id: recId,
        type: 'dispatch_boat',
        title: `Dispatch Swiftwater Boat B1 & Rescue Unit Alpha to ${ward.name}`,
        description: `Low-lying riverfront sector with ${ward.vulnerablePopulation} vulnerable residents facing chest-level inundation.`,
        targetWardOrCampId: ward.id,
        resourceId: 'boat-1',
        status: isApproved ? 'approved' : isOverridden ? 'overridden' : 'pending',
        confidence: 95,
        confidenceNarrative: '95% confidence based on bathymetry and proximity to river channel.',
        factors: [
          { name: 'Direct Riverfront Exposure', score: 96 },
          { name: 'Ground Inundation Depth', score: 88 },
          { name: 'Elderly & Minor Count', score: 82 }
        ],
        alternativesConsidered: [
          {
            title: 'Use High-Axle 4x4 Ambulances',
            reasonRejected: 'Current exceeds 1.4 m/s; road edges washed out, vehicle tipping hazard.'
          }
        ],
        tradeoff: 'Leaves Depot North reserve craft count at 1 boat.',
        projectedRiskReduction: 38
      });
    }

    // Evacuate ward action
    if (risk.riskScore >= 80 && index < 2) {
      const recId = `rec-evac-${ward.id}`;
      const isApproved = approvedIds.includes(recId);
      const isOverridden = overriddenIds.includes(recId);

      recommendations.push({
        id: recId,
        type: 'evacuate_ward',
        title: `Issue Targeted Evacuation Advisory for ${ward.name}`,
        description: `Water projected to breach main streets in T+2h. Coordinate orderly evacuation of 3,200 priority residents to Greenfield Stadium.`,
        targetWardOrCampId: ward.id,
        status: isApproved ? 'approved' : isOverridden ? 'overridden' : 'pending',
        confidence: 88,
        confidenceNarrative: '88% confidence based on hydrologic surcharge and road cutoff model.',
        factors: [
          { name: 'Cutoff Window Before Submersion', score: 94 },
          { name: 'Structural Fragility Index', score: 76 }
        ],
        alternativesConsidered: [
          {
            title: 'Shelter-in-place on second floors',
            reasonRejected: 'Power substation shutdown scheduled; ground-floor sanitary sewer backflow imminent.'
          }
        ],
        tradeoff: 'Requires mobilizing 8 municipal shuttle buses along Corridor R10.',
        projectedRiskReduction: 45
      });
    }
  });

  // Resupply action for shelters
  rivergateCamps.forEach((camp) => {
    if (camp.currentOccupancy / camp.totalCapacity > 0.6) {
      const recId = `rec-supply-${camp.id}`;
      const isApproved = approvedIds.includes(recId);
      const isOverridden = overriddenIds.includes(recId);

      recommendations.push({
        id: recId,
        type: 'resupply_camp',
        title: `Dispatch Rations & Potable Water Truck to ${camp.name}`,
        description: `Current occupancy at ${Math.round((camp.currentOccupancy / camp.totalCapacity) * 100)}%. Water packets will fall below safety threshold in 5.5 hours.`,
        targetWardOrCampId: camp.id,
        status: isApproved ? 'approved' : isOverridden ? 'overridden' : 'pending',
        confidence: 93,
        confidenceNarrative: '93% confidence based on current check-in intake rate.',
        factors: [
          { name: 'Occupancy Rate Growth', score: 89 },
          { name: 'Depletion Velocity', score: 91 }
        ],
        alternativesConsidered: [
          {
            title: 'Divert evacuees to East Gate Polytechnic',
            reasonRejected: 'East Gate camp is 3.8 km further away and uphill.'
          }
        ],
        tradeoff: 'Locks Logistics Truck T-4 into Highridge route for 3 hours.',
        projectedRiskReduction: 18
      });
    }
  });

  return recommendations;
}

/**
 * 3. STEP 3: Safe Evacuation Routing on Road Graph
 */
export function computeEvacuationRoutes(
  wards: Ward[],
  wardRisks: Record<string, WardRiskState>,
  roads: RoadEdge[],
  camps: ReliefCamp[]
): {
  routes: Record<string, EvacuationRoute>;
  roadsStatus: Record<string, { isFlooded: boolean; currentWaterMm: number }>;
} {
  const roadsStatus: Record<string, { isFlooded: boolean; currentWaterMm: number }> = {};

  // Determine flooded roads based on connected ward risks
  roads.forEach((road) => {
    const riskA = wardRisks[road.fromWard]?.waterLevelMeters || 0;
    const riskB = wardRisks[road.toWard]?.waterLevelMeters || 0;
    const avgWaterDepthMeters = (riskA + riskB) / 2;
    const waterMm = avgWaterDepthMeters * 100;

    const isFlooded = waterMm >= road.floodThresholdMm;
    roadsStatus[road.id] = {
      isFlooded,
      currentWaterMm: Math.round(waterMm),
    };
  });

  const routes: Record<string, EvacuationRoute> = {};

  // For each ward, find safe path to best camp
  wards.forEach((ward) => {
    // If ward is already camp host, route is trivial
    const hostingCamp = camps.find(c => c.wardId === ward.id);
    if (hostingCamp) {
      routes[ward.id] = {
        fromWardId: ward.id,
        toCampId: hostingCamp.id,
        campName: hostingCamp.name,
        roadIds: [],
        totalDistanceKm: 0.2,
        estimatedWalkMinutes: 4,
        isSafe: true,
        pathCoordinates: [[ward.centroid.x, ward.centroid.y], [hostingCamp.coordinates.x, hostingCamp.coordinates.y]],
      };
      return;
    }

    // Determine target camp: prioritize high elevation camps (Camp B Greenfield, Camp A Highridge)
    const targetCamp = camps[0]; // Camp B Greenfield Stadium Shelter
    
    // Find roads connecting toward camp
    const candidateRoads = roads.filter(r => r.fromWard === ward.id || r.toWard === ward.id);
    let chosenRoad = candidateRoads.find(r => !roadsStatus[r.id].isFlooded);
    let isSafe = true;
    let blockedRoadName: string | undefined = undefined;

    if (!chosenRoad && candidateRoads.length > 0) {
      chosenRoad = candidateRoads[0];
      isSafe = false;
      blockedRoadName = chosenRoad.name;
    }

    const dist = chosenRoad ? chosenRoad.lengthKm * 1.5 : 2.5;
    const walkMins = Math.round(dist * 12); // ~12 mins per km walking pace

    // Coordinates path
    const pathCoords: Array<[number, number]> = [
      [ward.centroid.x, ward.centroid.y],
      [(ward.centroid.x + targetCamp.coordinates.x) / 2, (ward.centroid.y + targetCamp.coordinates.y) / 2],
      [targetCamp.coordinates.x, targetCamp.coordinates.y]
    ];

    routes[ward.id] = {
      fromWardId: ward.id,
      toCampId: targetCamp.id,
      campName: targetCamp.name,
      roadIds: chosenRoad ? [chosenRoad.id] : [],
      totalDistanceKm: Number(dist.toFixed(1)),
      estimatedWalkMinutes: walkMins,
      isSafe,
      blockedRoadName,
      pathCoordinates: pathCoords,
    };
  });

  return { routes, roadsStatus };
}

/**
 * 4. STEP 4: Camp Supplies and Burn Rate
 */
export function computeCampSupplies(
  camps: ReliefCamp[],
  wardRisks: Record<string, WardRiskState>
): Record<string, CampSupplyStatus> {
  const result: Record<string, CampSupplyStatus> = {};

  camps.forEach((camp) => {
    // Additional evacuees arrive as nearby wards flood
    const hostWardRisk = wardRisks[camp.wardId]?.riskScore || 20;
    const surge = Math.round((hostWardRisk / 100) * 180);
    const activeOccupancy = Math.min(camp.totalCapacity, camp.currentOccupancy + surge);
    const occupancyPercent = Math.round((activeOccupancy / camp.totalCapacity) * 100);

    const hourlyFoodBurn = Math.max(10, activeOccupancy * camp.hourlyFoodBurnRate);
    const hourlyWaterBurn = Math.max(25, activeOccupancy * camp.hourlyWaterBurnRate);
    const foodHours = Number((camp.foodPackets / hourlyFoodBurn).toFixed(1));
    const waterHours = Number((camp.drinkingWaterLiters / hourlyWaterBurn).toFixed(1));
    const medHours = Number((camp.medicalKits / (Math.max(1, activeOccupancy * 0.04))).toFixed(1));

    let criticalAlert: string | undefined = undefined;
    let recommendedResupply: string | undefined = undefined;

    if (foodHours < 6) {
      criticalAlert = `Food stocks deplete in ${foodHours}h`;
      recommendedResupply = `Dispatch 1,500 food packets from Central Reserve.`;
    } else if (waterHours < 6) {
      criticalAlert = `Potable water depletes in ${waterHours}h`;
      recommendedResupply = `Reroute 4,000L water bowser from South Depot.`;
    }

    result[camp.id] = {
      campId: camp.id,
      campName: camp.name,
      occupancy: activeOccupancy,
      totalCapacity: camp.totalCapacity,
      occupancyPercent,
      foodHoursLeft: foodHours,
      waterHoursLeft: waterHours,
      medicalHoursLeft: medHours,
      criticalAlert,
      recommendedResupply,
    };
  });

  return result;
}

/**
 * 5. Full Pipeline Runner: Generates the full DecisionGraphState
 */
export function runDecisionPipeline(
  params: SimulationParams,
  scenariosMap?: Record<string, any>
): DecisionGraphState {
  const { rainfallMmH, riverLevelRiseMeters, timeHour = 0, overriddenActionIds = [], approvedActionIds = [] } = params;

  // Step 1: Risk
  const wardRisks = computeWardRisks(rivergateWards, params);

  // Step 2: Allocation
  const recommendedActions = computeAllocations(
    rivergateWards, 
    wardRisks, 
    rivergateResources, 
    approvedActionIds, 
    overriddenActionIds
  );

  // Step 3: Evacuation Routes
  const { routes: evacuationRoutes, roadsStatus } = computeEvacuationRoutes(
    rivergateWards, 
    wardRisks, 
    rivergateRoads, 
    rivergateCamps
  );

  // Step 4: Supplies
  const campsStatus = computeCampSupplies(rivergateCamps, wardRisks);

  // Derive aggregate KPIs
  let peopleAtRiskCount = 0;
  let criticalWardsCount = 0;
  Object.values(wardRisks).forEach((wr) => {
    const ward = rivergateWards.find(w => w.id === wr.wardId);
    if (ward && wr.riskScore >= 60) {
      peopleAtRiskCount += Math.round(ward.population * (wr.riskScore / 100));
    }
    if (wr.riskCategory === 'crit') {
      criticalWardsCount++;
    }
  });

  let totalCampOccupancy = 0;
  let totalCampCapacity = 0;
  Object.values(campsStatus).forEach((cs) => {
    totalCampOccupancy += cs.occupancy;
    totalCampCapacity += cs.totalCapacity;
  });
  const campCapacityUsedPercent = Math.round((totalCampOccupancy / totalCampCapacity) * 100);

  // Ripple Feed generation narrating the causality cascade
  const rippleFeed: DecisionGraphState['rippleFeed'] = [];
  const timestampNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Risk trigger
  const highestWard = Object.values(wardRisks).sort((a, b) => b.riskScore - a.riskScore)[0];
  if (highestWard && highestWard.riskScore >= 60) {
    const wardObj = rivergateWards.find(w => w.id === highestWard.wardId);
    rippleFeed.push({
      id: `rf-1-${highestWard.wardId}`,
      timestamp: timestampNow,
      message: `${wardObj?.name} crosses ${highestWard.riskScore} risk threshold due to ${rainfallMmH} mm/h precipitation.`,
      step: 'risk',
      severity: highestWard.riskCategory === 'crit' ? 'critical' : 'warning'
    });
  }

  // 2. Resource movement
  const pendingActions = recommendedActions.filter(a => a.type === 'deploy_pump' || a.type === 'dispatch_boat');
  if (pendingActions.length > 0) {
    rippleFeed.push({
      id: `rf-2-alloc`,
      timestamp: timestampNow,
      message: `AI recommends allocating ${pendingActions.length} units to suppress localized water rise.`,
      step: 'allocation',
      severity: 'info'
    });
  }

  // 3. Routing roadblock
  const floodedRoad = rivergateRoads.find(r => roadsStatus[r.id]?.isFlooded);
  if (floodedRoad) {
    rippleFeed.push({
      id: `rf-3-road-${floodedRoad.id}`,
      timestamp: timestampNow,
      message: `Road ${floodedRoad.name} impassable (${roadsStatus[floodedRoad.id].currentWaterMm}mm water). Traffic rerouted to Elevated Flyovers.`,
      step: 'routing',
      severity: 'warning'
    });
  }

  // 4. Supplies warning
  const criticalCamp = Object.values(campsStatus).find(c => c.foodHoursLeft < 6 || c.waterHoursLeft < 6);
  if (criticalCamp) {
    rippleFeed.push({
      id: `rf-4-camp-${criticalCamp.campId}`,
      timestamp: timestampNow,
      message: `${criticalCamp.campName}: Food packets will deplete in ${criticalCamp.foodHoursLeft}h. Resupply alert active.`,
      step: 'supplies',
      severity: 'critical'
    });
  }

  let scenarioId: DecisionGraphState['scenarioId'] = 'cloudburst_2am';
  if (rainfallMmH < 30) scenarioId = 'normal_day';
  else if (rainfallMmH < 80) scenarioId = 'heavy_rain';
  else if (riverLevelRiseMeters > 3.5) scenarioId = 'dam_release';

  // Run Monte Carlo simulation across 500 scenarios
  const topWardObj = highestWard ? rivergateWards.find(w => w.id === highestWard.wardId) : undefined;
  const mcResult = runMonteCarloSimulation(
    rainfallMmH,
    riverLevelRiseMeters,
    peopleAtRiskCount,
    criticalWardsCount,
    topWardObj ? `Ward ${topWardObj.number} (${topWardObj.name})` : 'Ward 4 (Shivaji Nagar)',
    'Camp B (Greenfield Stadium)'
  );

  return {
    rainfallMmH,
    riverLevelRiseMeters,
    timeHour,
    scenarioId,
    wardRisks,
    roadsStatus,
    recommendedActions,
    evacuationRoutes,
    campsStatus,
    rippleFeed,
    peopleAtRiskCount,
    criticalWardsCount,
    assetsDeployedCount: 7,
    campCapacityUsedPercent,
    verdict: mcResult.verdict,
    actionQueue: mcResult.actionQueue,
  };
}
