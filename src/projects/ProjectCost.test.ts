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
    ProjectCost.of({ ops: 750, creativity: 50, funds: 5 }).deductFrom(state);
    expect(state.ops).toBe(250);
    expect(state.creativity).toBe(30);
    expect(state.funds).toBe(15);
    expect(state.trust).toBe(2);
  });

  it("formate le coût pour l'affichage", () => {
    const cost = ProjectCost.of({ ops: 750, creativity: 50 });
    expect(cost.toDisplayString()).toBe("750 ops · 50 créat.");
  });
});
