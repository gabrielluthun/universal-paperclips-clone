import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameState, SAVE_VERSION } from "./GameState";
import { SaveManager } from "./SaveManager";

function stubLocalStorage(): void {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
}

describe("GameState", () => {
  it("crée un état initial cohérent", () => {
    const state = GameState.createInitial();
    expect(state.version).toBe(SAVE_VERSION);
    expect(state.clips).toBe(0);
    expect(state.trust).toBe(2);
    expect(state.processors).toBe(1);
    expect(state.memory).toBe(1);
    expect(state.nextTrust).toBe(3000);
  });

  it("sérialise et restaure les projets terminés", () => {
    const state = GameState.createInitial();
    state.clips = 42;
    state.markProjectCompleted("improvedWireExtrusion");

    const restored = GameState.fromSavedData(state.toSavedData());
    expect(restored.clips).toBe(42);
    expect(restored.hasCompletedProject("improvedWireExtrusion")).toBe(true);
  });

  it("conserve la progression d'une sauvegarde de version antérieure (fusion au mieux, pas de reset)", () => {
    const restored = GameState.fromSavedData({
      version: SAVE_VERSION - 1,
      clips: 9999,
      trust: 7,
    });
    expect(restored.clips).toBe(9999);
    expect(restored.trust).toBe(7);
    expect(restored.version).toBe(SAVE_VERSION);
  });

  it("garde un joueur en phase 2 (ou 3) après un rafraîchissement, même si SAVE_VERSION a changé depuis", () => {
    const restored = GameState.fromSavedData({
      version: SAVE_VERSION - 1, // simule : save écrite juste avant un futur bump de version
      phase: 2,
      clips: 123_456_789,
      funds: 42,
    });
    expect(restored.phase).toBe(2);
    expect(restored.clips).toBe(123_456_789);
  });

  it("rejette une sauvegarde sans version exploitable (donnée illisible)", () => {
    const restored = GameState.fromSavedData({ clips: 9999 });
    expect(restored.clips).toBe(0);
  });

  it("accepte l'ancienne clé completedProjects", () => {
    const restored = GameState.fromSavedData({
      version: SAVE_VERSION,
      completedProjects: ["newSlogan"],
    });
    expect(restored.hasCompletedProject("newSlogan")).toBe(true);
  });
});

describe("SaveManager", () => {
  beforeEach(() => {
    stubLocalStorage();
  });

  it("persiste et recharge via localStorage", () => {
    const manager = new SaveManager();
    manager.clearSavedGame();

    const state = GameState.createInitial();
    state.funds = 123.45;
    manager.saveGame(state);

    const loaded = manager.loadGame();
    expect(loaded.funds).toBeCloseTo(123.45, 5);

    manager.clearSavedGame();
    expect(manager.loadGame().funds).toBe(0);
  });
});
