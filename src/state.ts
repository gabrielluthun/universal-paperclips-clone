export const SAVE_KEY = "jeu-trombone-save";
export const SAVE_VERSION = 3;

export interface GameState {
  version: number;
  /** Phase du jeu (1 : business, 2 : Terre, 3 : espace). */
  phase: number;
  /** Trombones fabriqués depuis le début. */
  clips: number;
  /** Trombones en stock, pas encore vendus. */
  unsold: number;
  /** Fonds disponibles, en dollars. */
  funds: number;
  /** Prix de vente unitaire, en dollars. */
  price: number;
  /** Fil restant, en centimètres. */
  wire: number;
  /** Taille d'une bobine, en centimètres. */
  wirePerSpool: number;
  /** Prix actuel d'une bobine, en dollars. */
  wireCost: number;
  /** Prix de référence du fil, autour duquel le cours oscille. */
  wireBasePrice: number;
  /** Compteur de fluctuation du cours du fil (phase de la sinusoïde). */
  wirePriceCounter: number;
  /** Niveau de marketing (1 = de base). */
  marketingLvl: number;
  /** Multiplicateur d'efficacité marketing (projets). */
  marketingEffectiveness: number;
  /** Nombre d'AutoTrombineuses. */
  autoClippers: number;
  /** Les AutoTrombineuses ont-elles été débloquées (fonds ≥ 5 $ atteints) ? */
  autoClippersUnlocked: boolean;
  /** Multiplicateur de production des AutoTrombineuses. */
  clipperBonus: number;
  /** Accumulateur fractionnaire de production automatique. */
  autoClipFraction: number;
  /** Nombre de MégaTrombineuses. */
  megaClippers: number;
  /** Les MégaTrombineuses sont-elles débloquées (projet) ? */
  megaClippersUnlocked: boolean;
  /** Multiplicateur de production des MégaTrombineuses. */
  megaClipperBonus: number;
  /** Achat automatique de fil quand le stock est bas. */
  autoWire: boolean;

  // --- Confiance / calcul ---
  /** Confiance totale gagnée (paliers de production). */
  trust: number;
  /** Prochain seuil de trombones pour +1 confiance. */
  nextTrust: number;
  /** Suite de Fibonacci (terme a) pour les paliers. */
  trustFibA: number;
  /** Suite de Fibonacci (terme b) pour les paliers. */
  trustFibB: number;
  processors: number;
  memory: number;
  /** Opérations de calcul actuelles. */
  ops: number;
  /** Créativité (générée quand les ops sont au maximum). */
  creativity: number;
  /** La créativité a-t-elle déjà été débloquée une fois ? */
  creativityUnlocked: boolean;

  /** Identifiants des projets déjà réalisés. */
  completedProjects: string[];
}

export function initialState(): GameState {
  return {
    version: SAVE_VERSION,
    phase: 1,
    clips: 0,
    unsold: 0,
    funds: 0,
    price: 0.25,
    wire: 1000,
    wirePerSpool: 1000,
    wireCost: 20,
    wireBasePrice: 20,
    wirePriceCounter: 0,
    marketingLvl: 1,
    marketingEffectiveness: 1,
    autoClippers: 0,
    autoClippersUnlocked: false,
    clipperBonus: 1,
    autoClipFraction: 0,
    megaClippers: 0,
    megaClippersUnlocked: false,
    megaClipperBonus: 1,
    autoWire: false,

    trust: 2,
    nextTrust: 3000,
    trustFibA: 2,
    trustFibB: 3,
    processors: 1,
    memory: 1,
    ops: 0,
    creativity: 0,
    creativityUnlocked: false,

    completedProjects: [],
  };
}

export function load(): GameState {
  const fresh = initialState();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) return fresh;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed.version !== SAVE_VERSION) return fresh;
    // Fusion sur l'état initial : les champs ajoutés dans une version
    // ultérieure du code gardent leur valeur par défaut.
    return {
      ...fresh,
      ...parsed,
      completedProjects: parsed.completedProjects ?? [],
    };
  } catch {
    return fresh;
  }
}

export function save(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Stockage plein ou indisponible : on ignore, le jeu continue.
  }
}

export function resetSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
