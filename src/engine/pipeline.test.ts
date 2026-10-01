import { describe, it, expect } from 'vitest';
import { runDecisionPipeline, computeWardRisks } from './pipeline';
import { rivergateWards } from '../data/rivergate';

describe('Rakshak AI Decision Pipeline Determinism & Logic', () => {
  it('produces identical deterministic output given the exact same simulation seed parameters', () => {
    const params = {
      rainfallMmH: 140,
      riverLevelRiseMeters: 2.8,
      timeHour: 2,
      hotspotWardId: 'ward-3',
      overriddenActionIds: [],
      approvedActionIds: [],
    };

    const runA = runDecisionPipeline(params);
    const runB = runDecisionPipeline(params);

    expect(runA.wardRisks).toEqual(runB.wardRisks);
    expect(runA.peopleAtRiskCount).toEqual(runB.peopleAtRiskCount);
    expect(runA.criticalWardsCount).toEqual(runB.criticalWardsCount);
    expect(runA.recommendedActions).toEqual(runB.recommendedActions);
  });

  it('proves high elevation wards are significantly safer than low riverfront wards under heavy rain', () => {
    const risks = computeWardRisks(rivergateWards, {
      rainfallMmH: 120,
      riverLevelRiseMeters: 2.0,
      timeHour: 1,
    });

    const lowLyingWard3 = risks['ward-3']; // 3.1m elevation, 20m from river
    const elevatedWard8 = risks['ward-8']; // 24.0m elevation, 1400m from river

    expect(lowLyingWard3.riskScore).toBeGreaterThan(elevatedWard8.riskScore);
    expect(lowLyingWard3.waterLevelMeters).toBeGreaterThan(elevatedWard8.waterLevelMeters);
  });

  it('triggers pump and boat allocations for critical wards', () => {
    const result = runDecisionPipeline({
      rainfallMmH: 150,
      riverLevelRiseMeters: 3.0,
      timeHour: 2,
    });

    expect(result.recommendedActions.length).toBeGreaterThan(0);
    const pumpActions = result.recommendedActions.filter(a => a.type === 'deploy_pump');
    expect(pumpActions.length).toBeGreaterThan(0);
    expect(pumpActions[0].confidence).toBeGreaterThan(80);
    expect(pumpActions[0].alternativesConsidered.length).toBeGreaterThan(0);
    expect(pumpActions[0].tradeoff).toBeDefined();
  });

  it('identifies flooded roads and plans alternate safe routes to relief camps', () => {
    const result = runDecisionPipeline({
      rainfallMmH: 180,
      riverLevelRiseMeters: 3.5,
      timeHour: 3,
    });

    const routeWard1 = result.evacuationRoutes['ward-1'];
    expect(routeWard1).toBeDefined();
    expect(routeWard1.toCampId).toBeDefined();
    expect(routeWard1.estimatedWalkMinutes).toBeGreaterThan(0);
  });
});
