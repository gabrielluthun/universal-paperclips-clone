/**
 * Formatage des nombres + lissage visuel des compteurs.
 * Appeler {@link beginFrame} une fois par frame de rendu.
 *
 * Au-delà de {@link SAFE_SMOOTH_ABS}, les bigint s'affichent en exact
 * (la mantisse Number inventerait des zéros). En dessous, le lissage
 * repasse par Number — fluide et exact pour la phase 2 « 1 milliard ».
 */

/** Vitesse de rattrapage (plus haut = plus réactif). */
const COUNTER_CATCH_UP_SPEED = 24;

/** Seuil au-delà duquel on n'approxime plus en Number pour lisser. */
const SAFE_SMOOTH_ABS = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Échelle longue française : on n'abrège qu'à partir du milliard (1e9).
 */
const SCALE_TIERS: ReadonlyArray<readonly [bigint, string]> = [
  [10n ** 51n, "octilliard"],
  [10n ** 48n, "octillion"],
  [10n ** 45n, "septilliard"],
  [10n ** 42n, "septillion"],
  [10n ** 39n, "sextilliard"],
  [10n ** 36n, "sextillion"],
  [10n ** 33n, "quintilliard"],
  [10n ** 30n, "quintillion"],
  [10n ** 27n, "quatrilliard"],
  [10n ** 24n, "quatrillion"],
  [10n ** 21n, "trilliard"],
  [10n ** 18n, "trillion"],
  [10n ** 15n, "billiard"],
  [10n ** 12n, "billion"],
  [10n ** 9n, "milliard"],
];

export class NumberFormatter {
  private static readonly intFmt = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  });

  private static readonly moneyFmt = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private static readonly displayedValues: number[] = [];
  private static nextCounterIndex = 0;
  private static previousFrameTimestampMs: number | null = null;
  private static elapsedSeconds = 0;
  private static smoothingEnabled = false;

  /** Démarre une frame de rendu : active le lissage pour les format* suivants. */
  static beginFrame(nowMs = performance.now()): void {
    const previousTimestampMs = NumberFormatter.previousFrameTimestampMs;
    NumberFormatter.elapsedSeconds =
      previousTimestampMs === null
        ? 0
        : (nowMs - previousTimestampMs) / 1000;
    NumberFormatter.previousFrameTimestampMs = nowMs;
    NumberFormatter.nextCounterIndex = 0;
    NumberFormatter.smoothingEnabled = true;
  }

  /**
   * Entiers en chiffres complets (locale FR), lissés si {@link beginFrame}
   * a été appelé. Les bigint hors plage safe s'affichent sans lissage.
   */
  static formatInteger(n: number | bigint): string {
    const smoothable = NumberFormatter.asSmoothableNumber(n);
    if (smoothable === null) {
      return NumberFormatter.intFmt.format(n as bigint);
    }
    return NumberFormatter.intFmt.format(
      Math.floor(NumberFormatter.smoothCounterValue(smoothable)),
    );
  }

  /** Comme {@link formatInteger} mais sans lissage. */
  static formatIntegerExact(n: number | bigint): string {
    if (typeof n === "bigint") {
      return NumberFormatter.intFmt.format(n);
    }
    return NumberFormatter.intFmt.format(Math.floor(n));
  }

  static formatMoney(n: number): string {
    return `${NumberFormatter.moneyFmt.format(NumberFormatter.smoothCounterValue(n))} $`;
  }

  /**
   * Format compact : à partir du milliard, unité française.
   * Lisse la valeur affichée (échelle réduite) pour rester fluide.
   */
  static formatCompact(n: number | bigint, digits = 2): string {
    const asBig = typeof n === "bigint" ? n : BigInt(Math.floor(n));
    const abs = asBig < 0n ? -asBig : asBig;
    for (const [threshold, unit] of SCALE_TIERS) {
      if (abs >= threshold) {
        const scale = 10n ** BigInt(digits);
        const scaledInt = (asBig * scale) / threshold;
        const scaled = Number(scaledInt) / Number(scale);
        const smoothed = NumberFormatter.smoothCounterValue(scaled);
        const formatted = smoothed.toLocaleString("fr-FR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: digits,
        });
        const plural = Math.abs(smoothed) >= 2 ? "s" : "";
        return `${formatted}\u00A0${unit}${plural}`;
      }
    }
    const smoothable = NumberFormatter.asSmoothableNumber(asBig);
    if (smoothable === null) {
      return NumberFormatter.intFmt.format(asBig);
    }
    return NumberFormatter.intFmt.format(
      Math.floor(NumberFormatter.smoothCounterValue(smoothable)),
    );
  }

  static formatDecimal(n: number, digits = 1): string {
    return NumberFormatter.smoothCounterValue(n).toLocaleString("fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  /** null si trop grand pour un lissage Number fidèle. */
  private static asSmoothableNumber(n: number | bigint): number | null {
    if (typeof n === "number") {
      return Number.isFinite(n) ? n : null;
    }
    if (n > SAFE_SMOOTH_ABS || n < -SAFE_SMOOTH_ABS) return null;
    return Number(n);
  }

  private static smoothCounterValue(actualValue: number): number {
    if (!NumberFormatter.smoothingEnabled) {
      return actualValue;
    }

    const counterIndex = NumberFormatter.nextCounterIndex;
    NumberFormatter.nextCounterIndex += 1;

    const displayedValue = NumberFormatter.displayedValues[counterIndex];
    if (displayedValue === undefined) {
      NumberFormatter.displayedValues[counterIndex] = actualValue;
      return actualValue;
    }

    const gap = Math.abs(actualValue - displayedValue);
    if (gap < 1e-9) {
      NumberFormatter.displayedValues[counterIndex] = actualValue;
      return actualValue;
    }

    // Gros saut (reset, achat, etc.) → coller tout de suite.
    const scale = Math.max(Math.abs(actualValue), Math.abs(displayedValue), 1);
    if (gap / scale > 0.5 && gap > 10) {
      NumberFormatter.displayedValues[counterIndex] = actualValue;
      return actualValue;
    }

    const blendFactor =
      1 -
      Math.exp(
        -COUNTER_CATCH_UP_SPEED * NumberFormatter.elapsedSeconds,
      );
    const nextDisplayedValue =
      displayedValue + (actualValue - displayedValue) * blendFactor;
    NumberFormatter.displayedValues[counterIndex] = nextDisplayedValue;
    return nextDisplayedValue;
  }
}
