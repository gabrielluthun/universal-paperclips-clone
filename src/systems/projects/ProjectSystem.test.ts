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
