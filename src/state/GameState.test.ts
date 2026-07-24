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
    expect(state.clips).toBe(0n);
    expect(state.trust).toBe(2);
    expect(state.processors).toBe(1);
    expect(state.memory).toBe(1);
    expect(state.nextTrust).toBe(3000);
  });

  it("sérialise et restaure les projets terminés", () => {
    const state = GameState.createInitial();
    state.clips = 42n;
    state.markProjectCompleted("improvedWireExtrusion");

    const restored = GameState.fromSavedData(state.toSavedData());
    expect(restored.clips).toBe(42n);
    expect(restored.hasCompletedProject("improvedWireExtrusion")).toBe(true);
  });

  it("conserve la progression d'une sauvegarde de version antérieure (fusion au mieux, pas de reset)", () => {
    const restored = GameState.fromSavedData({
      version: SAVE_VERSION - 1,
      clips: 9999,
      trust: 7,
    });
    expect(restored.clips).toBe(9999n);
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
    expect(restored.clips).toBe(123_456_789n);
  });

  it("migre une save v6 (fin de phase 1) jusqu'à la version courante avec les champs de phase 2", () => {
    const v6Save = {
      version: 6,
      phase: 2,
      phase1Complete: true,
      clips: 500_000,
      trust: 42,
      funds: 12_345,
    };

    const restored = GameState.fromSavedData(v6Save);

    expect(restored.version).toBe(SAVE_VERSION);
    // Progression existante intacte.
    expect(restored.phase).toBe(2);
    expect(restored.phase1Complete).toBe(true);
    expect(restored.clips).toBe(500_000n);
    expect(restored.trust).toBe(42);
    expect(restored.funds).toBe(12_345);
    // Nouveaux champs phase 2 : valeurs par défaut neutres, rien de perdu.
    expect(restored.solarFarms).toBe(0);
    expect(restored.harvesterDrones).toBe(0);
    expect(restored.wireDrones).toBe(0);
    expect(restored.clipFactories).toBe(0);
    expect(restored.phase2Complete).toBe(false);
    expect(restored.availableMatter).toBe(6n * 10n ** 27n);
    expect(restored.acquiredMatter).toBe(0n);
  });

  it("migre une save v7 en scindant matter → availableMatter / acquiredMatter", () => {
    const v7Save = {
      version: 7,
      phase: 2,
      solarFarms: 2,
      matter: 1234,
      powerGridUnlocked: true,
    };

    const restored = GameState.fromSavedData(v7Save);

    expect(restored.version).toBe(SAVE_VERSION);
    expect(restored.solarFarms).toBe(2);
    expect(restored.powerGridUnlocked).toBe(true);
    expect(restored.availableMatter).toBe(6n * 10n ** 27n);
    expect(restored.acquiredMatter).toBe(1234n);
    expect(
      (restored as unknown as { matter?: number }).matter,
    ).toBeUndefined();
  });

  it("migre une save v8 en renommant powerBanked → storedPower et en initialisant les batteries", () => {
    const v8Save = {
      version: 8,
      phase: 2,
      solarFarms: 3,
      powerBanked: 4242,
      powerGridUnlocked: true,
    };

    const restored = GameState.fromSavedData(v8Save);

    expect(restored.version).toBe(SAVE_VERSION);
    expect(restored.solarFarms).toBe(3);
    expect(restored.storedPower).toBe(4242);
    expect(restored.batteries).toBe(0);
    expect(restored.powMod).toBe(0);
    expect(restored.sliderPos).toBe(0);
    expect(
      (restored as unknown as { powerBanked?: number }).powerBanked,
    ).toBeUndefined();
  });

  it("migre une save v9 en initialisant le coût persisté de l'Usine", () => {
    const v9Save = {
      version: 9,
      phase: 2,
      clipFactories: 3,
    };

    const restored = GameState.fromSavedData(v9Save);

    expect(restored.version).toBe(SAVE_VERSION);
    expect(restored.clipFactories).toBe(3);
    expect(restored.clipFactoryCost).toBe(100_000_000n);
  });

  it("migre une save v10 en renommant swarmCompute → swarmGifts et en initialisant l'ennui/désorganisation", () => {
    const v10Save = {
      version: 10,
      phase: 2,
      swarmCompute: 42,
    };

    const restored = GameState.fromSavedData(v10Save);

    expect(restored.version).toBe(SAVE_VERSION);
    expect(restored.swarmGifts).toBe(42);
    expect(restored.giftBits).toBe(0);
    expect(restored.boredomActive).toBe(false);
    expect(restored.disorgActive).toBe(false);
    expect(restored.entertainSwarmCost).toBe(10_000);
    expect(
      (restored as unknown as { swarmCompute?: number }).swarmCompute,
    ).toBeUndefined();
  });

  it("migre une save v11 en initialisant droneBoost et factoryBoost à 1 (inactifs)", () => {
    const v11Save = {
      version: 11,
      phase: 2,
      harvesterDrones: 600,
      clipFactories: 15,
    };

    const restored = GameState.fromSavedData(v11Save);

    expect(restored.version).toBe(SAVE_VERSION);
    expect(restored.harvesterDrones).toBe(600);
    expect(restored.clipFactories).toBe(15);
    expect(restored.droneBoost).toBe(1);
    expect(restored.factoryBoost).toBe(1);
  });

  it("migre une save v12 en convertissant clips/unsold/wire/matter/clipFactoryCost en bigint", () => {
    const v12Save = {
      version: 12,
      phase: 2,
      clips: 1e30,
      unsold: 5e27,
      wire: 1000,
      availableMatter: 6e27,
      acquiredMatter: 42,
      clipFactoryCost: 100_000_000,
    };

    const restored = GameState.fromSavedData(v12Save);

    expect(restored.version).toBe(SAVE_VERSION);
    expect(typeof restored.clips).toBe("bigint");
    // 1e30 en number n'est pas exact ; on vérifie surtout le round-trip string.
    const resaved = restored.toSavedData() as Record<string, unknown>;
    expect(typeof resaved.clips).toBe("string");
    expect(restored.wire).toBe(1000n);
    expect(restored.acquiredMatter).toBe(42n);
    expect(restored.clipFactoryCost).toBe(100_000_000n);

    // Précision : débit exact à l'échelle 10^30.
    restored.clips = 10n ** 30n;
    restored.clips -= 10n ** 13n;
    expect(restored.clips).toBe(10n ** 30n - 10n ** 13n);
  });

  it("rejette une sauvegarde sans version exploitable (donnée illisible)", () => {
    const restored = GameState.fromSavedData({ clips: 9999 });
    expect(restored.clips).toBe(0n);
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
