import type { GameState } from "../state/GameState";
import type { SaveManager } from "../state/SaveManager";
import { bindClick } from "./controllers/bindClick";

/** Gère le cycle de vie de la sauvegarde : autosave, sauvegarde à la fermeture, réinitialisation. */
export class GameLifecycle {
  private autosaveTimer: ReturnType<typeof setInterval> | null = null;
  private isResetting = false;

  constructor(
    private readonly state: GameState,
    private readonly saveManager: SaveManager,
    private readonly autosaveMs: number,
  ) {}

  /** Démarre l'autosave et la sauvegarde à la fermeture de l'onglet (idempotent). */
  start(): void {
    if (this.autosaveTimer !== null) return;
    this.autosaveTimer = setInterval(() => {
      if (!this.isResetting) this.saveManager.saveGame(this.state);
    }, this.autosaveMs);
    window.addEventListener("beforeunload", this.handlePageUnload);
  }

  /** Câble le bouton de réinitialisation de la partie. */
  bindResetButton(): void {
    bindClick("btn-reset", () => this.reset());
  }

  private readonly handlePageUnload = (): void => {
    if (!this.isResetting) this.saveManager.saveGame(this.state);
  };

  private reset(): void {
    if (
      !confirm("Réinitialiser la partie ? Toute la progression sera perdue.")
    ) {
      return;
    }
    this.isResetting = true;
    if (this.autosaveTimer !== null) clearInterval(this.autosaveTimer);
    window.removeEventListener("beforeunload", this.handlePageUnload);
    this.saveManager.clearSavedGame();
    location.reload();
  }
}
