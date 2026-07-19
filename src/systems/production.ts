import type { GameState } from "../state";
import { checkTrust } from "./compute";

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
  checkTrust(state);
  return made;
}

/**
 * Achète une bobine de fil si les fonds le permettent.
 * Chaque achat fait grimper le prix de référence du marché.
 */
export function buyWire(state: GameState): boolean {
  if (state.funds < state.wireCost) return false;
  state.funds -= state.wireCost;
  state.wire += state.wirePerSpool;
  state.wireBasePrice += 0.05;
  return true;
}

/** Coût de la prochaine AutoTrombineuse : 1,1^n + 5 $. */
export function autoClipperCost(state: GameState): number {
  return Math.pow(1.1, state.autoClippers) + 5;
}

export function buyAutoClipper(state: GameState): boolean {
  const cost = autoClipperCost(state);
  if (state.funds < cost) return false;
  state.funds -= cost;
  state.autoClippers += 1;
  return true;
}

/** Coût de la prochaine MégaTrombineuse. */
export function megaClipperCost(state: GameState): number {
  return Math.pow(1.07, state.megaClippers) * 1000;
}

export function buyMegaClipper(state: GameState): boolean {
  if (!state.megaClippersUnlocked) return false;
  const cost = megaClipperCost(state);
  if (state.funds < cost) return false;
  state.funds -= cost;
  state.megaClippers += 1;
  return true;
}

/** Trombones / s produits par l'automatisation (hors fabrication manuelle). */
export function autoClipRate(state: GameState): number {
  const fromAuto = state.autoClippers * state.clipperBonus;
  const fromMega = state.megaClippers * 500 * state.megaClipperBonus;
  return fromAuto + fromMega;
}

/**
 * Production automatique. Les fractions sont accumulées entre les ticks.
 * Retourne les trombones réellement fabriqués (0 si le fil manque).
 */
export function autoProductionTick(state: GameState, dtMs: number): number {
  const rate = autoClipRate(state);
  if (rate <= 0) return 0;
  state.autoClipFraction += rate * (dtMs / 1000);
  const whole = Math.floor(state.autoClipFraction);
  if (whole <= 0) return 0;
  const made = makeClips(state, whole);
  // Fil épuisé : on abandonne le reliquat pour ne pas accumuler de
  // production « en dette » qui sortirait d'un coup au réapprovisionnement.
  state.autoClipFraction = made < whole ? 0 : state.autoClipFraction - whole;
  return made;
}

/** Achète une bobine si le fil est bas et que les fonds suffisent. */
export function autoWireTick(state: GameState): void {
  if (!state.autoWire) return;
  if (state.wire >= state.wirePerSpool / 2) return;
  buyWire(state);
}
