/** Champs « cœur » : progression brute, non rattachés à un système précis. */
export interface CoreFields {
  /** Phase du jeu (1 : business, 2 : Terre, 3 : espace). */
  phase: number;
  /** Phase 1 close via HypnoDrones. */
  phase1Complete: boolean;
  /** L'écran de transition de fin de phase 1 a été fermé. */
  phase1EndAcknowledged: boolean;
  clips: number;
  unsold: number;
  funds: number;
}

export function createCoreFields(): CoreFields {
  return {
    phase: 1,
    phase1Complete: false,
    phase1EndAcknowledged: false,
    clips: 0,
    unsold: 0,
    funds: 0,
  };
}
