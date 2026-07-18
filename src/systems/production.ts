import type { GameState } from "../state";

/**
 * Fabrique jusqu'à `count` trombones (limité par le fil disponible).
 * Retourne le nombre réellement fabriqué.
 */
export function makeClips(state: GameState, count: number): number {
  const made = Math.min(count, Math.floor(state.wire));
  if (made <= 0) return 0;
  state.clips += made;
  state.unsold += made;
  state.wire -= made;
  return made;
}

/** Achète une bobine de fil si les fonds le permettent. */
export function buyWire(state: GameState): boolean {
  if (state.funds < state.wireCost) return false;
  state.funds -= state.wireCost;
  state.wire += state.wirePerSpool;
  return true;
}
