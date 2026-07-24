/** Quantité entière exacte (stocks / coûts astronomiques phase 2). */
export type BigAmount = bigint;

export const BA0 = 0n;

/** Convertit number | string | bigint en bigint (number : floor si fini). */
export function ba(v: number | string | bigint): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "" || trimmed === "-") return 0n;
    try {
      return BigInt(trimmed.split(".")[0] ?? "0");
    } catch {
      return 0n;
    }
  }
  if (!Number.isFinite(v)) return 0n;
  return BigInt(Math.floor(v));
}

export function baMin(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function baMax(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

/**
 * `Math.pow(base, exp) * factor` calculé en float puis arrondi en bigint.
 * Pour les formules UP à exposant non entier (fermes, batteries, drones).
 */
export function baFromPow(base: number, exp: number, factor: number): bigint {
  const value = Math.pow(base, exp) * factor;
  if (!Number.isFinite(value) || value <= 0) return 0n;
  return BigInt(Math.round(value));
}

/**
 * Multiplie un coût bigint par un facteur float (ex. clipFactoryCost × 1.15).
 * Utilise la mantisse Number tant qu'elle reste représentative (~15 chiffres).
 */
export function baMulFloat(cost: bigint, multiplier: number): bigint {
  if (!Number.isFinite(multiplier) || multiplier <= 0) return 0n;
  if (cost === 0n) return 0n;
  const asNumber = Number(cost);
  if (Number.isFinite(asNumber) && asNumber <= Number.MAX_SAFE_INTEGER) {
    return BigInt(Math.round(asNumber * multiplier));
  }
  // Au-delà du safe int : décompose multiplier en fraction entière approximative.
  const scale = 1_000_000;
  const num = BigInt(Math.round(multiplier * scale));
  return (cost * num) / BigInt(scale);
}

/**
 * Applique un débit float (unités/s × dt) sur un stock bigint, avec
 * accumulateur fractionnaire [0, 1) pour ne pas perdre les fractions de tick.
 *
 * La partie entière du taux est traitée en bigint (ms) pour éviter que
 * `rate * dt` en float n'écrase les chiffres de bas ordre du stock.
 */
export function baApplyRate(
  stock: bigint,
  ratePerSec: number,
  dt: number,
  frac: number,
): { stock: bigint; moved: bigint; frac: number } {
  if (stock <= 0n || !Number.isFinite(ratePerSec) || ratePerSec <= 0 || dt <= 0) {
    return { stock, moved: 0n, frac };
  }

  const dtMs = Math.round(dt * 1000);
  if (dtMs <= 0) {
    return { stock, moved: 0n, frac };
  }

  // Sépare taux entier (bigint-safe via string si > MAX_SAFE) et fraction < 1.
  const rateWholeFloat = Math.floor(ratePerSec);
  const rateFrac = ratePerSec - rateWholeFloat;
  let moved = 0n;
  let nextFrac = frac;

  if (rateWholeFloat > 0) {
    // BigInt(Math.floor(x)) est OK jusqu'à MAX_SAFE_INTEGER ; au-delà, Number
    // a déjà perdu des unités — on prend quand même le floor représentable.
    const rateWhole = BigInt(rateWholeFloat);
    moved += (rateWhole * BigInt(dtMs)) / 1000n;
    nextFrac += Number((rateWhole * BigInt(dtMs)) % 1000n) / 1000;
  }

  if (rateFrac > 0) {
    nextFrac += rateFrac * (dtMs / 1000);
  }

  if (!Number.isFinite(nextFrac) || nextFrac < 0) {
    nextFrac = 0;
  }

  if (nextFrac >= 1) {
    const extra = Math.floor(nextFrac);
    // extra reste petit (fraction de tick) — safe en number.
    if (Number.isSafeInteger(extra)) {
      moved += BigInt(extra);
      nextFrac -= extra;
    } else {
      moved += ba(nextFrac);
      nextFrac = 0;
    }
  }

  const wanted = moved;
  moved = baMin(stock, moved);
  // Si le stock a limité le débit, on jette la fraction.
  if (moved < wanted) {
    return { stock: stock - moved, moved, frac: 0 };
  }
  return { stock: stock - moved, moved, frac: nextFrac };
}

export function baToJSON(v: bigint): string {
  return v.toString(10);
}

/** Accepte string (save v13+), number (legacy) ou bigint. */
export function baFromJSON(raw: unknown): bigint {
  if (typeof raw === "bigint") return raw;
  if (typeof raw === "number") return ba(raw);
  if (typeof raw === "string") return ba(raw);
  return 0n;
}

/**
 * Approximation float pour l'UI / le lissage uniquement.
 * Perd de la précision au-delà de ~1e15 — ne pas utiliser pour la simu.
 */
export function baApproxNumber(v: bigint): number {
  const asNumber = Number(v);
  return Number.isFinite(asNumber) ? asNumber : (v < 0n ? -Number.MAX_VALUE : Number.MAX_VALUE);
}

/** Clés d'état sérialisées en string décimale (bigint runtime). */
export const BIG_AMOUNT_SAVE_KEYS = [
  "clips",
  "unsold",
  "wire",
  "availableMatter",
  "acquiredMatter",
  "clipFactoryCost",
] as const;

export type BigAmountSaveKey = (typeof BIG_AMOUNT_SAVE_KEYS)[number];

export function encodeBigAmountFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...data };
  for (const key of BIG_AMOUNT_SAVE_KEYS) {
    const value = out[key];
    if (typeof value === "bigint") {
      out[key] = baToJSON(value);
    }
  }
  return out;
}

export function decodeBigAmountFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...data };
  for (const key of BIG_AMOUNT_SAVE_KEYS) {
    if (key in out) {
      out[key] = baFromJSON(out[key]);
    }
  }
  return out;
}
