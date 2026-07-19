import type { GameState } from "../state";

export function maxOps(state: GameState): number {
  return state.memory * 1000;
}

/** Confiance encore disponible à allouer en processeurs / mémoire. */
export function unusedTrust(state: GameState): number {
  return state.trust - state.processors - state.memory;
}

/**
 * Vérifie les paliers Fibonacci × 1000 (3 000, 5 000, 8 000…).
 * Chaque palier franchi donne +1 confiance.
 */
export function checkTrust(state: GameState): void {
  while (state.clips >= state.nextTrust) {
    state.trust += 1;
    const next = state.trustFibA + state.trustFibB;
    state.trustFibA = state.trustFibB;
    state.trustFibB = next;
    state.nextTrust = state.trustFibB * 1000;
  }
}

export function addProcessor(state: GameState): boolean {
  if (unusedTrust(state) < 1) return false;
  state.processors += 1;
  return true;
}

export function addMemory(state: GameState): boolean {
  if (unusedTrust(state) < 1) return false;
  state.memory += 1;
  return true;
}

/** Ops / s ≈ processeurs^1,1 (formule de l'original). */
export function opsPerSecond(state: GameState): number {
  return Math.pow(state.processors, 1.1);
}

/**
 * Créativité / s quand les ops sont au max.
 * Se débloque dès la première fois que le plafond est atteint.
 */
export function creativityPerSecond(state: GameState): number {
  if (!state.creativityUnlocked) return 0;
  return Math.pow(state.processors, 1.1);
}

export function computeTick(state: GameState, dtMs: number): void {
  const cap = maxOps(state);
  const dt = dtMs / 1000;
  state.ops = Math.min(cap, state.ops + opsPerSecond(state) * dt);

  if (state.ops >= cap && cap > 0) {
    state.creativityUnlocked = true;
    state.creativity += creativityPerSecond(state) * dt;
  }
}
