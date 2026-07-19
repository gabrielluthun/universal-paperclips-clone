/** Version de la sauvegarde. S'incrémente lorsque des modifications sont apportées à la structure de l'état pour éviter les erreurs de désérialisation. */
export const SAVE_VERSION = 3;

/** État mutable de la partie — source de vérité pour tous les systèmes. */
export class GameState {
  version = SAVE_VERSION;
  /** Phase du jeu (1 : business, 2 : Terre, 3 : espace). */
  phase = 1;

  clips = 1;
  unsold = 0;
  funds = 0;
  price = 0.25;

  wire = 1000;
  wirePerSpool = 1000;
  wireCost = 20;
  wireBasePrice = 20;
  wirePriceCounter = 0;

  marketingLvl = 1;
  marketingEffectiveness = 1;

  autoClippers = 0;
  autoClippersUnlocked = false;
  clipperBonus = 1;
  autoClipFraction = 0;

  megaClippers = 0;
  megaClippersUnlocked = false;
  megaClipperBonus = 1;
  autoWire = false;

  trust = 2;
  nextTrust = 3000;
  trustFibA = 2;
  trustFibB = 3;
  processors = 1;
  memory = 1;
  ops = 0;
  creativity = 0;
  creativityUnlocked = false;

  private completedProjectIds: string[] = [];

  static createInitial(): GameState {
    return new GameState();
  }

  /** Reconstruit un état depuis une sauvegarde JSON (fusion défensive). */
  static fromSavedData(raw: unknown): GameState {
    const state = GameState.createInitial();
    if (typeof raw !== "object" || raw === null) return state;

    const data = raw as Partial<GameState> & {
      version?: number;
      completedProjects?: string[];
      completedProjectIds?: string[];
    };
    if (data.version !== SAVE_VERSION) return state;

    const {
      completedProjects: _legacy,
      completedProjectIds: _ids,
      ...rest
    } = data;
    Object.assign(state, rest);

    const savedIds = data.completedProjectIds ?? data.completedProjects;
    state.completedProjectIds = Array.isArray(savedIds) ? [...savedIds] : [];
    state.version = SAVE_VERSION;
    return state;
  }

  toSavedData(): object {
    return {
      ...this,
      completedProjects: [...this.completedProjectIds],
      completedProjectIds: [...this.completedProjectIds],
    };
  }

  hasCompletedProject(id: string): boolean {
    return this.completedProjectIds.includes(id);
  }

  markProjectCompleted(id: string): void {
    if (!this.hasCompletedProject(id)) {
      this.completedProjectIds.push(id);
    }
  }
}
