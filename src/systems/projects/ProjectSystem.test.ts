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

  it("libère les HypnoDrones à 100 de confiance et passe en phase 2", () => {
    const state = GameState.createInitial();
    state.trust = 100;
    const projects = new ProjectSystem(state);

    expect(projects.getAvailableProjects().map((p) => p.id)).toContain(
      "releaseHypnoDrones",
    );
    expect(projects.activateProject("releaseHypnoDrones")).toBe(true);
    expect(state.phase1Complete).toBe(true);
    expect(state.phase).toBe(2);
    expect(state.phase1EndAcknowledged).toBe(false);
    expect(projects.activateProject("releaseHypnoDrones")).toBe(false);
  });
});
