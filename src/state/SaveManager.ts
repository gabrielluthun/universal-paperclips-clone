import { GameState } from "./GameState";

const SAVE_KEY = "jeu-trombone-save";

export class SaveManager {
  loadGame(): GameState {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw === null) return GameState.createInitial();
      return GameState.fromSavedData(JSON.parse(raw));
    } catch {
      return GameState.createInitial();
    }
  }

  saveGame(state: GameState): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state.toSavedData()));
    } catch {
      // Stockage plein ou indisponible : on ignore, le jeu continue.
    }
  }

  clearSavedGame(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
