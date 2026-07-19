import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { ComputeSystem } from "../compute/ComputeSystem";
import { ProductionSystem } from "./ProductionSystem";

function makeProduction(state = GameState.createInitial()) {
  const compute = new ComputeSystem(state);
  return { state, compute, production: new ProductionSystem(state, compute) };
}

describe("ProductionSystem", () => {
  it("fabrique des trombones et consomme le fil", () => {
    const { state, production } = makeProduction();
    expect(production.produceClips(10)).toBe(10);
    expect(state.clips).toBe(10);
    expect(state.unsold).toBe(10);
    expect(state.wire).toBe(990);
  });

  it("ne fabrique pas plus de trombones que de fil disponible", () => {
    const { state, production } = makeProduction();
    state.wire = 3;
    expect(production.produceClips(10)).toBe(3);
    expect(state.clips).toBe(3);
    expect(state.wire).toBe(0);
  });

  it("achète une bobine et augmente le prix de référence du fil", () => {
    const { state, production } = makeProduction();
    state.funds = 20;
    state.wire = 0;
    expect(production.purchaseWireSpool()).toBe(true);
    expect(state.funds).toBe(0);
    expect(state.wire).toBe(1000);
    expect(state.wireBasePrice).toBeCloseTo(20.05, 5);
  });

  it("calcule le coût de la première AutoTrombineuse à 6 $", () => {
    const { production } = makeProduction();
    expect(production.getNextAutoClipperCost()).toBeCloseTo(6, 5);
  });

  it("calcule le débit auto : clippers×bonus + mégas×500×bonus", () => {
    const { state, production } = makeProduction();
    state.autoClippers = 10;
    state.clipperBonus = 1.25;
    state.megaClippers = 2;
    state.megaClipperBonus = 1.5;
    expect(production.getAutomaticProductionRate()).toBeCloseTo(1512.5, 5);
  });

  it("produit automatiquement sur update et expose le total du tick", () => {
    const { state, production } = makeProduction();
    state.autoClippers = 10;
    production.update(1000);
    expect(production.takeClipsProducedDuringLastUpdate()).toBe(10);
    expect(state.clips).toBe(10);
    expect(production.takeClipsProducedDuringLastUpdate()).toBe(0);
  });

  it("achète du fil automatiquement si le stock est bas", () => {
    const { state, production } = makeProduction();
    state.autoWire = true;
    state.wire = 100;
    state.funds = 50;
    state.wireCost = 20;
    production.update(100);
    expect(state.wire).toBe(1100);
    expect(state.funds).toBe(30);
  });

  it("offre une bobine d'urgence en cas de soft-lock", () => {
    const { state, production } = makeProduction();
    state.wire = 0;
    state.unsold = 0;
    state.funds = 5;
    state.investmentFunds = 0;
    state.wireCost = 20;
    state.wirePerSpool = 1000;
    expect(production.grantEmergencyWireIfSoftLocked()).toBe(true);
    expect(state.wire).toBe(1000);
  });

  it("n'offre pas de fil d'urgence s'il reste des liquidités investies", () => {
    const { state, production } = makeProduction();
    state.wire = 0;
    state.unsold = 0;
    state.funds = 0;
    state.investmentFunds = 50;
    state.wireCost = 20;
    expect(production.grantEmergencyWireIfSoftLocked()).toBe(false);
    expect(state.wire).toBe(0);
  });
});
