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

  it("rejette une sauvegarde de mauvaise version", () => {
    const restored = GameState.fromSavedData({
      version: SAVE_VERSION - 1,
      clips: 9999,
    });
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
