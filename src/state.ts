export const SAVE_KEY = "jeu-trombone-save";
export const SAVE_VERSION = 1;

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
  /** Prix d'une bobine, en dollars. */
  wireCost: number;
}

export function initialState(): GameState {
  return {
    version: SAVE_VERSION,
    phase: 1,
    clips: 0,
    unsold: 0,
    funds: 40,
    price: 0.25,
    wire: 1000,
    wirePerSpool: 1000,
    wireCost: 20,
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
    return { ...fresh, ...parsed };
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
