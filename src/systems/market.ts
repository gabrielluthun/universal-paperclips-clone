import type { GameState } from "../state";

export const PRICE_STEP = 0.01;
export const PRICE_MIN = 0.01;

/** Prix de floor du fil, vers lequel le cours redescend lentement. */
const WIRE_FLOOR_PRICE = 20;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Demande du public. Formule de l'original :
 * (0,8 / prix) × 1,1^(niveau de marketing − 1).
 */
export function computeDemand(state: GameState): number {
  const marketing = Math.pow(1.1, state.marketingLvl - 1);
  return (0.8 / state.price) * marketing;
}

export function marketingCost(state: GameState): number {
  return 100 * Math.pow(2, state.marketingLvl - 1);
}

export function raisePrice(state: GameState): void {
  state.price = round2(state.price + PRICE_STEP);
}

export function lowerPrice(state: GameState): void {
  state.price = Math.max(PRICE_MIN, round2(state.price - PRICE_STEP));
}

export function buyMarketing(state: GameState): boolean {
  const cost = marketingCost(state);
  if (state.funds < cost) return false;
  state.funds -= cost;
  state.marketingLvl += 1;
  return true;
}

/**
 * Ventes automatiques. À chaque tick de 100 ms, une transaction a lieu
 * avec une probabilité demande/100 ; elle écoule ⌊0,7 × demande^1,15⌋
 * trombones (au moins 1), dans la limite du stock.
 * Retourne le revenu encaissé pendant ce tick.
 */
export function sellTick(state: GameState, dtMs: number): number {
  if (state.unsold <= 0) return 0;
  const demand = computeDemand(state);
  const attempts = Math.max(1, Math.round(dtMs / 100));
  let revenue = 0;
  for (let i = 0; i < attempts; i++) {
    if (state.unsold <= 0) break;
    if (Math.random() >= demand / 100) continue;
    const wanted = Math.max(1, Math.floor(0.7 * Math.pow(demand, 1.15)));
    const sold = Math.min(wanted, state.unsold);
    state.unsold -= sold;
    revenue += sold * state.price;
  }
  state.funds += revenue;
  return revenue;
}

/**
 * Cours du fil : le prix de référence grimpe à chaque achat (voir buyWire)
 * puis redescend lentement vers 20 $ ; le prix affiché oscille en sinusoïde
 * autour de cette référence, par sauts espacés de quelques secondes.
 */
export function wireMarketTick(state: GameState): void {
  if (state.wireBasePrice > WIRE_FLOOR_PRICE) {
    state.wireBasePrice = Math.max(WIRE_FLOOR_PRICE, state.wireBasePrice - 0.001);
  }
  if (Math.random() < 0.015) {
    state.wirePriceCounter += 1;
    const flux = 6 * Math.sin(state.wirePriceCounter);
    state.wireCost = Math.max(1, Math.ceil(state.wireBasePrice + flux));
  }
}
