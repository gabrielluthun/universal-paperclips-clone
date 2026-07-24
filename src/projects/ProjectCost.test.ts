import { describe, expect, it } from "vitest";
import { GameState } from "../state/GameState";
import { ProjectCost } from "./ProjectCost";

describe("ProjectCost", () => {
  it("accepte l'achat quand toutes les ressources suffisent", () => {
    const state = GameState.createInitial();
    state.ops = 1000;
    state.creativity = 50;
    state.funds = 10;
    const cost = ProjectCost.of({ ops: 750, creativity: 50, funds: 5 });
    expect(cost.canAfford(state)).toBe(true);
  });

  it("refuse l'achat si une ressource manque", () => {
    const state = GameState.createInitial();
    state.ops = 749;
    state.creativity = 100;
    const cost = ProjectCost.of({ ops: 750, creativity: 50 });
    expect(cost.canAfford(state)).toBe(false);
  });

  it("débite exactement les ressources demandées", () => {
    const state = GameState.createInitial();
    state.ops = 1000;
    state.creativity = 80;
    state.funds = 20;
    state.yomi = 50;
    ProjectCost.of({
      ops: 750,
      creativity: 50,
      funds: 5,
      yomi: 10,
    }).deductFrom(state);
    expect(state.ops).toBe(250);
    expect(state.creativity).toBe(30);
    expect(state.funds).toBe(15);
    expect(state.yomi).toBe(40);
    expect(state.trust).toBe(2);
  });

  it("peut exiger de la confiance sans la débiter", () => {
    const state = GameState.createInitial();
    state.trust = 100;
    const cost = ProjectCost.of({ trust: 100, spendTrust: false });
    expect(cost.canAfford(state)).toBe(true);
    cost.deductFrom(state);
    expect(state.trust).toBe(100);
  });

  it("gère un coût en trombones invendus (unsold)", () => {
    const state = GameState.createInitial();
    state.unsold = 1_000_000_000_000_000_000_000; // 1 sextillion
    const cost = ProjectCost.of({ unsold: 1_000_000_000_000_000_000_000 });
    expect(cost.canAfford(state)).toBe(true);
    cost.deductFrom(state);
    expect(state.unsold).toBe(0);
  });

  it("gère un coût en trombones fabriqués (clips)", () => {
    const state = GameState.createInitial();
    state.clips = 100_000_000;
    const cost = ProjectCost.of({ clips: 100_000_000 });
    expect(cost.canAfford(state)).toBe(true);
    cost.deductFrom(state);
    expect(state.clips).toBe(0);
  });

  it("gère un coût en énergie stockée (storedPower)", () => {
    const state = GameState.createInitial();
    state.storedPower = 10_000_000;
    const cost = ProjectCost.of({ storedPower: 10_000_000 });
    expect(cost.canAfford(state)).toBe(true);
    cost.deductFrom(state);
    expect(state.storedPower).toBe(0);
  });

  it("formate le coût pour l'affichage", () => {
    const cost = ProjectCost.of({ ops: 750, creativity: 50, yomi: 3000 });
    expect(cost.toDisplayString()).toBe("750 ops · 50 créat. · 3 000 yomi");
  });
});
