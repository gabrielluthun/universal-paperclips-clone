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

  it("récolte de la matière à pleine puissance quand l'électricité suffit", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.harvesterDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.harvesterDrones = 10; // demande 10 MW < 50 MW dispo
    const initialMatter = state.availableMatter;
    const land = new LandSystem(state);

    land.update(1000); // 1 seconde

    expect(land.getPowerRatio()).toBe(1);
    const expectedHarvested = 10 * 5_235_700_000;
    expect(state.acquiredMatter).toBeCloseTo(expectedHarvested, 0);
    expect(state.availableMatter).toBeCloseTo(initialMatter - expectedHarvested, 0);
    // Surplus de puissance (50 - 10 MW) banké.
    expect(state.powerBanked).toBeCloseTo(40, 5);
  });

  it("ralentit la récolte quand la puissance ne suffit pas pour tous les drones", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.harvesterDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.harvesterDrones = 100; // demande 100 MW > 50 MW dispo → ratio 0.5
    const land = new LandSystem(state);

    expect(land.getPowerRatio()).toBeCloseTo(0.5, 5);

    land.update(1000);

    const expectedHarvested = 100 * 5_235_700_000 * 0.5;
    expect(state.acquiredMatter).toBeCloseTo(expectedHarvested, 0);
    // Puissance entièrement consommée par les drones : rien à stocker.
    expect(state.powerBanked).toBe(0);
  });

  it("ne récolte rien tant que les Drones récolteurs ne sont pas débloqués", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.solarFarms = 1;
    state.harvesterDrones = 5;
    const land = new LandSystem(state);

    land.update(1000);

    expect(state.acquiredMatter).toBe(0);
  });

  it("calcule le coût des drones selon la formule UP (1M, 4.76M, 11.84M…)", () => {
    const state = GameState.createInitial();
    state.harvesterDronesUnlocked = true;
    state.wireDronesUnlocked = true;
    const land = new LandSystem(state);

    expect(land.getNextHarvesterDroneCost()).toBe(1_000_000);
    expect(land.getNextWireDroneCost()).toBe(1_000_000);

    state.harvesterDrones = 1;
    expect(land.getNextHarvesterDroneCost()).toBeCloseTo(4_756_828, 0);

    state.wireDrones = 2;
    expect(land.getNextWireDroneCost()).toBeCloseTo(11_844_666, 0);
  });

  it("achète un Drone récolteur ou fileur en dépensant des trombones", () => {
    const state = GameState.createInitial();
    state.harvesterDronesUnlocked = true;
    state.clips = 1_000_000;
    const land = new LandSystem(state);

    expect(land.purchaseHarvesterDrone()).toBe(true);
    expect(state.harvesterDrones).toBe(1);
    expect(state.clips).toBe(0);

    expect(land.purchaseWireDrone()).toBe(false); // pas débloqué
    state.wireDronesUnlocked = true;
    state.clips = 999_999;
    expect(land.purchaseWireDrone()).toBe(false); // pas assez de trombones
    state.clips = 1_000_000;
    expect(land.purchaseWireDrone()).toBe(true);
    expect(state.wireDrones).toBe(1);
  });

  it("convertit la matière acquise en fil via les Drones fileurs", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.wireDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.wireDrones = 5; // demande 5 MW < 50 MW dispo
    state.acquiredMatter = 100_000_000_000; // large stock, non limitant
    const initialWire = state.wire;
    const land = new LandSystem(state);

    land.update(1000);

    const expectedConverted = 5 * 3_235_700_000;
    expect(state.wire).toBeCloseTo(initialWire + expectedConverted, 0);
    expect(state.acquiredMatter).toBeCloseTo(100_000_000_000 - expectedConverted, 0);
  });

  it("limite la conversion en fil à la matière acquise disponible", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.wireDronesUnlocked = true;
    state.solarFarms = 1;
    state.wireDrones = 5;
    state.acquiredMatter = 10; // très peu de stock
    const initialWire = state.wire;
    const land = new LandSystem(state);

    land.update(1000);

    expect(state.acquiredMatter).toBe(0);
    expect(state.wire).toBeCloseTo(initialWire + 10, 5);
  });
});
