import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { PROJECTS_UNLOCK_CLIPS, ProjectSystem } from "./ProjectSystem";

describe("ProjectSystem", () => {
  it("garde le plateau verrouillé en début de partie", () => {
    const state = GameState.createInitial();
    state.clips = 100;
    const projects = new ProjectSystem(state);
    expect(projects.isProjectsBoardUnlocked()).toBe(false);
    expect(projects.getAvailableProjects()).toHaveLength(0);
  });

  it("débloque le plateau à 2000 trombones et propose l'extrusion de fil", () => {
    const state = GameState.createInitial();
    state.clips = PROJECTS_UNLOCK_CLIPS;
    const projects = new ProjectSystem(state);
    expect(projects.isProjectsBoardUnlocked()).toBe(true);
    const ids = projects.getAvailableProjects().map((p) => p.id);
    expect(ids).toContain("improvedWireExtrusion");
  });

  it("débloque aussi le plateau dès le premier gain de confiance", () => {
    const state = GameState.createInitial();
    state.clips = 100;
    state.trust = 3;
    const projects = new ProjectSystem(state);
    expect(projects.isProjectsBoardUnlocked()).toBe(true);
  });

  it("active un projet : paie, applique l'effet, marque comme terminé", () => {
    const state = GameState.createInitial();
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 750;
    const projects = new ProjectSystem(state);

    expect(projects.activateProject("improvedWireExtrusion")).toBe(true);
    expect(state.ops).toBe(0);
    expect(state.wirePerSpool).toBe(1500);
    expect(state.hasCompletedProject("improvedWireExtrusion")).toBe(true);
    expect(projects.activateProject("improvedWireExtrusion")).toBe(false);
  });

  it("refuse d'activer un projet trop tôt ou trop cher", () => {
    const state = GameState.createInitial();
    const projects = new ProjectSystem(state);
    expect(projects.activateProject("improvedWireExtrusion")).toBe(false);

    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 100;
    expect(projects.activateProject("improvedWireExtrusion")).toBe(false);
    expect(state.hasCompletedProject("improvedWireExtrusion")).toBe(false);
  });

  it("exige HypnoDrones puis 100 de confiance pour clore la phase 1", () => {
    const state = GameState.createInitial();
    state.trust = 100;
    state.processors = 40;
    state.memory = 60;
    state.ops = 70_000;
    state.markProjectCompleted("hypnoHarmonics");
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "hypnoDrones",
    );
    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "releaseHypnoDrones",
    );

    expect(projects.activateProject("hypnoDrones")).toBe(true);
    expect(state.ops).toBe(0);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "releaseHypnoDrones",
    );
    expect(projects.activateProject("releaseHypnoDrones")).toBe(true);
    expect(state.phase1Complete).toBe(true);
    expect(state.phase).toBe(2);
    expect(state.phase1EndAcknowledged).toBe(false);
    expect(state.trust).toBe(100); // processors + memory
    expect(projects.activateProject("releaseHypnoDrones")).toBe(false);
  });

  it("OPA hostile puis monopole : marketing et confiance", () => {
    const state = GameState.createInitial();
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.investmentsUnlocked = true;
    state.funds = 11_000_000;
    state.yomi = 3000;
    state.marketingEffectiveness = 1;
    const projects = new ProjectSystem(state);

    expect(projects.activateProject("hostileTakeover")).toBe(true);
    expect(state.funds).toBe(10_000_000);
    expect(state.marketingEffectiveness).toBe(5);
    expect(state.trust).toBe(3);

    expect(projects.activateProject("fullMonopoly")).toBe(true);
    expect(state.funds).toBe(0);
    expect(state.yomi).toBe(0);
    expect(state.marketingEffectiveness).toBe(50);
    expect(state.trust).toBe(4);
  });

  it("jetons de goodwill répétables jusqu'à 100 de confiance", () => {
    const state = GameState.createInitial();
    state.trust = 85;
    state.clips = 101_000_000;
    state.funds = 2_000_000;
    const projects = new ProjectSystem(state);

    expect(projects.activateProject("tokenOfGoodwill")).toBe(true);
    expect(state.trust).toBe(86);
    expect(state.funds).toBe(1_500_000);

    expect(projects.activateProject("anotherTokenOfGoodwill")).toBe(true);
    expect(state.trust).toBe(87);
    expect(state.funds).toBe(500_000);
    expect(state.goodwillTokenCost).toBe(2_000_000);
    expect(state.hasCompletedProject("anotherTokenOfGoodwill")).toBe(false);

    // Pas assez pour le prochain jeton à 2 M$
    expect(projects.activateProject("anotherTokenOfGoodwill")).toBe(false);

    state.funds = 2_000_000;
    expect(projects.activateProject("anotherTokenOfGoodwill")).toBe(true);
    expect(state.trust).toBe(88);
    expect(state.goodwillTokenCost).toBe(4_000_000);
  });

  it("phase 2 : Tóth Tubule Enfolding puis Réseau électrique", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 100_000;
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "tothTubuleEnfolding",
    );
    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "powerGrid",
    );

    expect(projects.activateProject("tothTubuleEnfolding")).toBe(true);
    expect(state.ops).toBe(55_000);
    expect(state.landFoundationUnlocked).toBe(true);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "powerGrid",
    );
    expect(projects.activateProject("powerGrid")).toBe(true);
    expect(state.ops).toBe(15_000);
    expect(state.powerGridUnlocked).toBe(true);
  });

  it("phase 2 : Production de fil nanométrique après le Réseau électrique", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 35_000;
    state.markProjectCompleted("tothTubuleEnfolding");
    state.markProjectCompleted("powerGrid");
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "nanoscaleWireProduction",
    );
    expect(projects.activateProject("nanoscaleWireProduction")).toBe(true);
    expect(state.ops).toBe(0);
    expect(state.nanoscaleWireUnlocked).toBe(true);
  });

  it("phase 2 : Drones récolteurs débloqués après le Réseau électrique", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 25_000;
    state.markProjectCompleted("tothTubuleEnfolding");
    state.markProjectCompleted("powerGrid");
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "harvesterDrones",
    );
    expect(projects.activateProject("harvesterDrones")).toBe(true);
    expect(state.ops).toBe(0);
    expect(state.harvesterDronesUnlocked).toBe(true);
  });

  it("phase 2 : Drones fileurs débloqués après fil nanométrique + drones récolteurs", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 25_000;
    state.markProjectCompleted("tothTubuleEnfolding");
    state.markProjectCompleted("powerGrid");
    state.markProjectCompleted("harvesterDrones");
    const projects = new ProjectSystem(state);

    // Manque encore nanoscaleWireProduction.
    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "wireDrones",
    );

    state.markProjectCompleted("nanoscaleWireProduction");
    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "wireDrones",
    );
    expect(projects.activateProject("wireDrones")).toBe(true);
    expect(state.ops).toBe(0);
    expect(state.wireDronesUnlocked).toBe(true);
  });

  it("phase 2 : Usines à trombones débloquées après drones récolteurs + fileurs", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 35_000;
    state.markProjectCompleted("tothTubuleEnfolding");
    state.markProjectCompleted("powerGrid");
    state.markProjectCompleted("harvesterDrones");
    const projects = new ProjectSystem(state);

    // Manque encore wireDrones.
    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "clipFactories",
    );

    state.markProjectCompleted("wireDrones");
    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "clipFactories",
    );
    expect(projects.activateProject("clipFactories")).toBe(true);
    expect(state.ops).toBe(0);
    expect(state.clipFactoriesUnlocked).toBe(true);
  });

  it("phase 2 : Informatique en essaim débloquée à partir de 200 drones", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.yomi = 12_000;
    state.harvesterDrones = 100;
    state.wireDrones = 99;
    const projects = new ProjectSystem(state);

    // 199 drones : pas encore assez.
    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "swarmComputing",
    );

    state.wireDrones = 100;
    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "swarmComputing",
    );
    expect(projects.activateProject("swarmComputing")).toBe(true);
    expect(state.yomi).toBe(0);
    expect(state.swarmComputingUnlocked).toBe(true);
  });

  it("phase 2 : Vol en essaim anti-collision/alignement/cohésion adverse débloqués par seuil de drones", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 100_000;
    state.yomi = 12_000;
    state.harvesterDrones = 250;
    state.wireDrones = 249; // 499 : pas encore assez pour anti-collision
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "droneFlockingCollisionAvoidance",
    );

    state.wireDrones = 250; // 500
    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "droneFlockingCollisionAvoidance",
    );
    expect(projects.activateProject("droneFlockingCollisionAvoidance")).toBe(
      true,
    );
    expect(state.droneEfficiencyBonus).toBe(100);

    // Alignement nécessite 5 000 drones.
    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "droneFlockingAlignment",
    );
    state.harvesterDrones = 2_500;
    state.wireDrones = 2_500;
    state.ops = 100_000;
    expect(projects.activateProject("droneFlockingAlignment")).toBe(true);
    expect(state.droneEfficiencyBonus).toBe(100_000); // cumulatif ×100 puis ×1000

    // Cohésion adverse nécessite 50 000 drones.
    state.harvesterDrones = 25_000;
    state.wireDrones = 25_000;
    expect(projects.activateProject("droneFlockingAdversarialCohesion")).toBe(
      true,
    );
    expect(state.droneBoost).toBe(2);
  });

  it("phase 2 : Usines améliorées/hypervéloces/auto-correctrice débloquées par seuil d'usines", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 100_000;
    state.unsold = 1_000_000_000_000_000_000_000;
    state.clipFactories = 9;
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "upgradedFactories",
    );
    state.clipFactories = 10;
    expect(projects.activateProject("upgradedFactories")).toBe(true);
    expect(state.factoryEfficiencyBonus).toBe(100);

    state.clipFactories = 20;
    state.ops = 100_000;
    expect(projects.activateProject("hyperspeedFactories")).toBe(true);
    expect(state.factoryEfficiencyBonus).toBe(100_000);

    state.clipFactories = 50;
    expect(projects.activateProject("selfCorrectingSupplyChain")).toBe(true);
    expect(state.factoryBoost).toBe(1_000);
    expect(state.unsold).toBe(0);
  });

  it("phase 2 : Élan débloqué à partir de 50 Fermes solaires", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.creativity = 30_000;
    state.solarFarms = 49;
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "momentum",
    );

    state.solarFarms = 50;
    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "momentum",
    );
    expect(projects.activateProject("momentum")).toBe(true);
    expect(state.creativity).toBe(0);
    expect(state.momentumUnlocked).toBe(true);
  });

  it("phase 2 : Exploration spatiale débloquée une fois la matière épuisée, termine la phase 2", () => {
    const state = GameState.createInitial();
    state.phase = 2;
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 120_000;
    state.storedPower = 10_000_000;
    state.unsold = Math.pow(10, 27) * 5;
    state.availableMatter = 1; // pas encore épuisée
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "spaceExploration",
    );

    state.availableMatter = 0;
    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "spaceExploration",
    );
    expect(projects.activateProject("spaceExploration")).toBe(true);
    expect(state.ops).toBe(0);
    expect(state.storedPower).toBe(0);
    expect(state.unsold).toBe(0);
    expect(state.phase).toBe(3);
    expect(state.phase2Complete).toBe(true);
    expect(state.phase2EndAcknowledged).toBe(false);
  });

  it("les projets phase 2 restent invisibles en phase 1", () => {
    const state = GameState.createInitial();
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.ops = 100_000;
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).not.toContain(
      "tothTubuleEnfolding",
    );
    expect(projects.activateProject("tothTubuleEnfolding")).toBe(false);
  });

  it("projets CEV : gros gains de confiance hors Fibonacci", () => {
    const state = GameState.createInitial();
    state.clips = PROJECTS_UNLOCK_CLIPS;
    state.markProjectCompleted("donkeySpace");
    state.strategicModelingUnlocked = true;
    state.creativity = 500;
    state.ops = 20_000;
    state.yomi = 3000;
    const projects = new ProjectSystem(state);

    expect(projects.activateProject("coherentExtrapolatedVolition")).toBe(true);
    expect(state.trust).toBe(3);

    state.ops = 20_000;
    expect(projects.activateProject("malePatternBaldness")).toBe(true);
    expect(state.trust).toBe(23);
  });
});
