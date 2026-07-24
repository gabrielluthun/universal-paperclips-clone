import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { ComputeSystem } from "./ComputeSystem";

describe("ComputeSystem", () => {
  it("fixe la capacité d'ops à mémoire × 1000", () => {
    const state = GameState.createInitial();
    state.memory = 3;
    const compute = new ComputeSystem(state);
    expect(compute.getOperationsCapacity()).toBe(3000);
  });

  it("calcule la confiance disponible (trust − processors − memory)", () => {
    const state = GameState.createInitial();
    // trust 2, processors 1, memory 1 → 0
    const compute = new ComputeSystem(state);
    expect(compute.getAvailableTrustPoints()).toBe(0);

    state.trust = 4;
    expect(compute.getAvailableTrustPoints()).toBe(2);
  });

  it("accorde la confiance aux paliers Fibonacci × 1000", () => {
    const state = GameState.createInitial();
    const compute = new ComputeSystem(state);

    state.clips = 2999n;
    compute.grantTrustForProductionMilestones();
    expect(state.trust).toBe(2);
    expect(state.nextTrust).toBe(3000);

    state.clips = 3000n;
    compute.grantTrustForProductionMilestones();
    expect(state.trust).toBe(3);
    expect(state.nextTrust).toBe(5000);

    state.clips = 8000n;
    compute.grantTrustForProductionMilestones();
    expect(state.trust).toBe(5); // +1 à 5000, +1 à 8000
    expect(state.nextTrust).toBe(13_000);
  });

  it("alloue processeur et mémoire uniquement si confiance disponible", () => {
    const state = GameState.createInitial();
    const compute = new ComputeSystem(state);

    expect(compute.allocateProcessor()).toBe(false);
    state.trust = 3;
    expect(compute.allocateProcessor()).toBe(true);
    expect(state.processors).toBe(2);
    expect(compute.allocateMemory()).toBe(false);

    state.trust = 4;
    expect(compute.allocateMemory()).toBe(true);
    expect(state.memory).toBe(2);
  });

  it("calcule les ops/s à 10 × processeurs", () => {
    const state = GameState.createInitial();
    const compute = new ComputeSystem(state);

    state.processors = 1;
    expect(compute.getOperationsPerSecond()).toBe(10);
    state.processors = 5;
    expect(compute.getOperationsPerSecond()).toBe(50);
    state.processors = 10;
    expect(compute.getOperationsPerSecond()).toBe(100);
  });

  it("calcule la créativité selon la formule Paperclips", () => {
    const state = GameState.createInitial();
    state.creativityUnlocked = true;
    const compute = new ComputeSystem(state);

    state.processors = 1;
    expect(compute.getCreativityPerSecond()).toBe(0);

    state.processors = 2;
    expect(compute.getCreativityPerSecond()).toBeCloseTo(
      Math.log10(2) * Math.pow(2, 1.1) + 1,
      10,
    );
  });

  it("génère des ops puis débloque la créativité au plafond", () => {
    const state = GameState.createInitial();
    state.processors = 2;
    state.memory = 1;
    const compute = new ComputeSystem(state);

    // 1 seconde à 20 ops/s → 20 ops, pas encore au max
    compute.update(1000);
    expect(state.ops).toBeCloseTo(20, 5);
    expect(state.ops).toBeLessThan(1000);
    expect(state.creativityUnlocked).toBe(false);

    state.ops = 999;
    compute.update(1000);
    expect(state.ops).toBe(1000);
    expect(state.creativityUnlocked).toBe(true);
    expect(state.creativity).toBeGreaterThan(0);
  });
});
