import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { PROJECTS_UNLOCK_CLIPS, ProjectSystem } from "../projects/ProjectSystem";
import { LandSystem } from "./LandSystem";

/**
 * Test d'intégration bout en bout : parcourt toute la chaîne de la phase 2
 * (déblocages successifs via ProjectSystem, production via LandSystem)
 * jusqu'à la transition vers la phase 3 déclenchée par « Exploration
 * spatiale ».
 */
describe("Phase 2 : parcours complet jusqu'à la transition phase 3", () => {
  it("débloque intégralement la chaîne Terre puis bascule en phase 3 une fois la matière épuisée", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    const projects = new ProjectSystem(state);
    const land = new LandSystem(state);

    // --- Fondations ---
    state.clips = 20_000_000n;
    state.ops = 45_000;
    expect(projects.activateProject("tothTubuleEnfolding")).toBe(true);
    expect(state.landFoundationUnlocked).toBe(true);

    state.ops = 40_000;
    expect(projects.activateProject("powerGrid")).toBe(true);
    expect(state.powerGridUnlocked).toBe(true);

    // --- Énergie ---
    expect(land.purchaseSolarFarm()).toBe(true);
    expect(state.solarFarms).toBe(1);

    // --- Drones & fil ---
    state.ops = 35_000;
    expect(projects.activateProject("nanoscaleWireProduction")).toBe(true);
    state.ops = 25_000;
    expect(projects.activateProject("harvesterDrones")).toBe(true);
    state.ops = 25_000;
    expect(projects.activateProject("wireDrones")).toBe(true);
    expect(state.harvesterDronesUnlocked).toBe(true);
    expect(state.wireDronesUnlocked).toBe(true);

    // --- Usines ---
    state.ops = 35_000;
    state.clips = 100_000_000n;
    expect(projects.activateProject("clipFactories")).toBe(true);
    expect(state.clipFactoriesUnlocked).toBe(true);

    // La simulation Terre produit effectivement de la matière au fil du temps.
    state.harvesterDrones = 5;
    land.update(1000);
    expect(state.acquiredMatter).toBeGreaterThan(0n);

    // --- Fin de phase 2 : Exploration spatiale ---
    state.availableMatter = 0n;
    state.clips = PROJECTS_UNLOCK_CLIPS; // plateau de projets toujours déverrouillé
    state.ops = 120_000;
    state.storedPower = 10_000_000;
    state.unsold = 5n * 10n ** 27n;
    expect(state.phase).toBe(2);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "spaceExploration",
    );
    expect(projects.activateProject("spaceExploration")).toBe(true);

    expect(state.phase).toBe(3);
    expect(state.phase2Complete).toBe(true);
    expect(state.phase2EndAcknowledged).toBe(false);
  });
});
