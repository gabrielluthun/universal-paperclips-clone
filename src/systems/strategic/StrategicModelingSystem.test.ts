import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { StrategicModelingSystem } from "./StrategicModelingSystem";
import { findBiggestPayoff, whatBeatsLast } from "./strategies";

describe("strategies helpers", () => {
  it("trouve le plus gros payoff", () => {
    expect(findBiggestPayoff({ aa: 9, ab: 1, ba: 2, bb: 3 })).toBe(1);
    expect(findBiggestPayoff({ aa: 1, ab: 9, ba: 2, bb: 3 })).toBe(2);
    expect(findBiggestPayoff({ aa: 1, ab: 2, ba: 9, bb: 3 })).toBe(3);
    expect(findBiggestPayoff({ aa: 1, ab: 2, ba: 3, bb: 9 })).toBe(4);
  });

  it("calcule le coup qui bat le précédent", () => {
    const grid = { aa: 5, ab: 1, ba: 2, bb: 4 };
    expect(
      whatBeatsLast({
        grid,
        myPos: 1,
        hMovePrev: 1,
        vMovePrev: 1,
      }),
    ).toBe(1);
  });
});

describe("StrategicModelingSystem", () => {
  it("refuse un tournoi sans déblocage ni ops", () => {
    const state = GameState.createInitial();
    const strategic = new StrategicModelingSystem(state);
    expect(strategic.canRunTournament()).toBe(false);
    expect(strategic.runTournament()).toBe(0);
  });

  it("dépense des ops et gagne du Yomi", () => {
    const state = GameState.createInitial();
    state.strategicModelingUnlocked = true;
    state.ops = 5000;
    state.selectedStrategyId = "RANDOM";
    const strategic = new StrategicModelingSystem(state);

    let call = 0;
    const random = () => {
      call += 1;
      // Payoffs stables puis coups RANDOM déterministes
      if (call <= 4) return 0.5; // ceil(0.5*10)=5 pour chaque case
      return call % 2 === 0 ? 0.1 : 0.9;
    };

    const gained = strategic.runTournament(random);
    expect(state.ops).toBe(4000);
    expect(gained).toBeGreaterThan(0);
    expect(state.yomi).toBe(gained);
    expect(state.tourneyResults.length).toBe(1);
    expect(state.tourneyPayoff).not.toBeNull();
  });

  it("multiplie le Yomi par le nombre de stratégies battues", () => {
    const state = GameState.createInitial();
    state.strategicModelingUnlocked = true;
    state.ops = 20_000;
    state.unlockedStrategyIds = ["A100", "B100"];
    state.selectedStrategyId = "A100";
    state.tourneyCost = 2000;
    const strategic = new StrategicModelingSystem(state);

    // Grille où A (coup 1) domine clairement
    let n = 0;
    const random = () => {
      n += 1;
      if (n === 1) return 0.99; // aa = 10
      if (n === 2) return 0.01; // ab ≈ 1
      if (n === 3) return 0.01; // ba ≈ 1
      if (n === 4) return 0.2; // bb = 2
      return 0.5; // labels
    };

    const gained = strategic.runTournament(random);
    const a100 = state.tourneyResults.find((r) => r.id === "A100");
    expect(a100).toBeDefined();
    expect(gained).toBe(a100!.score); // 1 stratégie battue → ×1 minimum, ici battue B100 → ×1
    // Avec 2 strats, si A bat B : multiplier = 1 (max(1,1))
    expect(state.yomi).toBe(gained);
  });

  it("ajoute une stratégie et augmente le coût", () => {
    const state = GameState.createInitial();
    state.strategicModelingUnlocked = true;
    const strategic = new StrategicModelingSystem(state);
    expect(state.tourneyCost).toBe(1000);
    strategic.unlockStrategy("GREEDY");
    expect(state.unlockedStrategyIds).toContain("GREEDY");
    expect(state.tourneyCost).toBe(2000);
  });
});
