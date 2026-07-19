import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { QuantumSystem } from "./QuantumSystem";

describe("QuantumSystem", () => {
  it("refuse l'achat de puce si le quantique est verrouillé", () => {
    const state = GameState.createInitial();
    state.ops = 100_000;
    const quantum = new QuantumSystem(state);
    expect(quantum.purchasePhotonicChip()).toBe(false);
  });

  it("achète une puce photonique contre des ops", () => {
    const state = GameState.createInitial();
    state.quantumUnlocked = true;
    state.ops = 10_000;
    const quantum = new QuantumSystem(state);
    expect(quantum.getNextPhotonicChipCost()).toBe(10_000);
    expect(quantum.purchasePhotonicChip()).toBe(true);
    expect(state.qChips).toBe(1);
    expect(state.ops).toBe(0);
  });

  it("fait osciller les ops pendant le calcul quantique", () => {
    const state = GameState.createInitial();
    state.quantumUnlocked = true;
    state.qChips = 2;
    state.memory = 1;
    state.ops = 500;
    const quantum = new QuantumSystem(state);

    quantum.toggleQuantumCompute();
    expect(state.qComputeActive).toBe(true);

    quantum.update(100);
    const first = state.ops;
    quantum.update(200);
    expect(state.ops).not.toBe(first);
    expect(state.ops).toBeGreaterThanOrEqual(0);
    expect(state.ops).toBeLessThanOrEqual(1000);

    quantum.toggleQuantumCompute();
    expect(state.qComputeActive).toBe(false);
    const frozen = state.ops;
    quantum.update(500);
    expect(state.ops).toBe(frozen);
  });

  it("n'active pas le calcul sans puce", () => {
    const state = GameState.createInitial();
    state.quantumUnlocked = true;
    state.qChips = 0;
    const quantum = new QuantumSystem(state);
    quantum.toggleQuantumCompute();
    expect(state.qComputeActive).toBe(false);
  });
});
