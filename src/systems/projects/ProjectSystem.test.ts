import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { ProjectSystem } from "./ProjectSystem";

describe("ProjectSystem", () => {
  it("propose l'extrusion de fil améliorée dès le premier trombone", () => {
    const state = GameState.createInitial();
    state.clips = 1;
    const projects = new ProjectSystem(state);
    const ids = projects.getAvailableProjects().map((p) => p.id);
    expect(ids).toContain("improvedWireExtrusion");
  });

  it("active un projet : paie, applique l'effet, marque comme terminé", () => {
    const state = GameState.createInitial();
    state.clips = 1;
    state.ops = 750;
    const projects = new ProjectSystem(state);

    expect(projects.activateProject("improvedWireExtrusion")).toBe(true);
    expect(state.ops).toBe(0);
    expect(state.wirePerSpool).toBe(1500);
    expect(state.hasCompletedProject("improvedWireExtrusion")).toBe(true);
    expect(projects.activateProject("improvedWireExtrusion")).toBe(false);
  });

  it("refuse d'activer un projet invisible ou trop cher", () => {
    const state = GameState.createInitial();
    const projects = new ProjectSystem(state);
    // Pas encore de trombone → extrusion invisible
    expect(projects.activateProject("improvedWireExtrusion")).toBe(false);

    state.clips = 1;
    state.ops = 100;
    expect(projects.activateProject("improvedWireExtrusion")).toBe(false);
    expect(state.hasCompletedProject("improvedWireExtrusion")).toBe(false);
  });
});
