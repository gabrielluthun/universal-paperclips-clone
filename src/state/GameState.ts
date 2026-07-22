/** Version de la sauvegarde. S'incrémente lorsque des modifications sont apportées à la structure de l'état pour éviter les erreurs de désérialisation. */
export const SAVE_VERSION = 6;

/** État mutable de la partie — source de vérité pour tous les systèmes. */
export class GameState {
  version = SAVE_VERSION;
  /** Phase du jeu (1 : business, 2 : Terre, 3 : espace). */
  phase = 1;
  /** Phase 1 close via HypnoDrones. */
  phase1Complete = false;
  /** L'écran de transition de fin de phase 1 a été fermé. */
  phase1EndAcknowledged = false;

  clips = 0;
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

  /**
   * Coût du prochain « Autre jeton de goodwill » ($).
   * Double à chaque achat, plafonné à 512 M$.
   */
  goodwillTokenCost = 1_000_000;

  trust = 2;
  nextTrust = 3000;
  trustFibA = 2;
  trustFibB = 3;
  processors = 1;
  memory = 1;
  ops = 0;
  creativity = 0;
  creativityUnlocked = false;

  // --- Modélisation stratégique / Yomi ---
  strategicModelingUnlocked = false;
  /** Stratégies débloquées (RANDOM au départ du projet). */
  unlockedStrategyIds: string[] = ["RANDOM"];
  selectedStrategyId = "RANDOM";
  /** Coût ops d'un tournoi (1000 × nombre de stratégies). */
  tourneyCost = 1000;
  /** Multiplicateur de Yomi (×2 après Théorie de l'esprit, plus tard). */
  yomiBoost = 1;
  tourneyPayoff: { aa: number; ab: number; ba: number; bb: number } | null =
    null;
  tourneyChoiceA = "";
  tourneyChoiceB = "";
  tourneyResults: { id: string; name: string; score: number }[] = [];
  lastTourneyYomiGained = 0;

  // --- Investissements ---
  investmentsUnlocked = false;
  /** Fonds placés sur les marchés. */
  investmentFunds = 0;
  /** Niveau du moteur de trading (1+). */
  investEngineLevel = 1;
  /** Risque : 1 = faible, 2 = moyen, 3 = élevé. */
  investRisk = 1;
  /** Yomi (gagné aux tournois, dépensé pour le moteur). */
  yomi = 0;
  /** Dernière variation boursière affichée ($). */
  lastStockDelta = 0;

  // --- Quantique ---
  quantumUnlocked = false;
  /** Puces photoniques. */
  qChips = 0;
  /** Calcul quantique en cours (ops oscillantes). */
  qComputeActive = false;
  /** Phase de l'oscillation quantique. */
  qPhase = 0;

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

    if (!Array.isArray(state.unlockedStrategyIds) || state.unlockedStrategyIds.length === 0) {
      state.unlockedStrategyIds = ["RANDOM"];
    }
    if (!Array.isArray(state.tourneyResults)) {
      state.tourneyResults = [];
    }

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

  /**
   * Remplace l'état vivant par une sauvegarde (même référence d'objet,
   * pour que les systèmes déjà construits restent valides).
   */
  adoptSavedData(raw: unknown): void {
    const loaded = GameState.fromSavedData(raw);
    const data = loaded.toSavedData() as Record<string, unknown>;
    const {
      completedProjects: _legacy,
      completedProjectIds: savedIds,
      ...rest
    } = data;
    Object.assign(this, rest);
    this.completedProjectIds = Array.isArray(savedIds)
      ? [...(savedIds as string[])]
      : [];
    this.version = SAVE_VERSION;
  }
}
