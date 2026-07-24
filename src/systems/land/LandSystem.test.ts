import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { LandSystem } from "./LandSystem";

describe("LandSystem", () => {
  it("calcule le coût des fermes solaires selon la formule UP (10M, 686.85M, 2.12B…)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    const land = new LandSystem(state);

    expect(land.getNextSolarFarmCost()).toBe(10_000_000);

    state.solarFarms = 1;
    expect(land.getNextSolarFarmCost()).toBeCloseTo(686_852_349.15, 0);

    state.solarFarms = 2;
    expect(land.getNextSolarFarmCost()).toBeCloseTo(2_120_298_900.41, 0);

    state.solarFarms = 3;
    expect(land.getNextSolarFarmCost()).toBeCloseTo(4_717_661_495.33, 0);
  });

  it("produit 50 MW par ferme solaire", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.solarFarms = 3;
    const land = new LandSystem(state);

    expect(land.getPowerOutput()).toBe(150);
  });

  it("achète une ferme en dépensant des trombones au coût courant", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.clips = 10_000_000;
    const land = new LandSystem(state);

    expect(land.purchaseSolarFarm()).toBe(true);
    expect(state.solarFarms).toBe(1);
    expect(state.clips).toBe(0);
    expect(land.getNextSolarFarmCost()).toBeCloseTo(686_852_349.15, 0);
  });

  it("refuse l'achat sans Power Grid ou sans trombones suffisants", () => {
    const state = GameState.createInitial();
    const land = new LandSystem(state);
    state.clips = 10_000_000;
    expect(land.purchaseSolarFarm()).toBe(false);

    state.powerGridUnlocked = true;
    state.clips = 9_999_999;
    expect(land.purchaseSolarFarm()).toBe(false);
  });
});
