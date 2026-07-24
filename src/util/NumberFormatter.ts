/** Vitesse de rattrapage des compteurs affichés (plus haut = plus réactif). */
const COUNTER_CATCH_UP_SPEED = 14;

/**
 * Échelle longue française (contrairement à l'échelle courte anglo-saxonne
 * du jeu original) : billion = 1e12, trillion = 1e18, etc., avec les
 * « -illiard » intermédiaires (milliard, billiard, trilliard...). On ne
 * commence à abréger qu'à partir du milliard (1e9) ; en dessous, chiffres
 * complets.
 */
const SCALE_TIERS: ReadonlyArray<readonly [number, string]> = [
  [1e51, "octilliard"],
  [1e48, "octillion"],
  [1e45, "septilliard"],
  [1e42, "septillion"],
  [1e39, "sextilliard"],
  [1e36, "sextillion"],
  [1e33, "quintilliard"],
  [1e30, "quintillion"],
  [1e27, "quatrilliard"],
  [1e24, "quatrillion"],
  [1e21, "trilliard"],
  [1e18, "trillion"],
  [1e15, "billiard"],
  [1e12, "billion"],
  [1e9, "milliard"],
];

/**
 * Formatage des nombres + lissage visuel des compteurs.
 * Appeler {@link beginFrame} une fois par frame de rendu.
 */
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
        : (nowMs - previousTimestampMs) / 750;
    NumberFormatter.previousFrameTimestampMs = nowMs;
    NumberFormatter.nextCounterIndex = 0;
    NumberFormatter.smoothingEnabled = true;
  }

  /** Entiers en chiffres complets (locale FR), lissés si {@link beginFrame} a été appelé. */
  static formatInteger(n: number): string {
    return NumberFormatter.intFmt.format(
      Math.floor(NumberFormatter.smoothCounterValue(n)),
    );
  }

  /** Comme {@link formatInteger} mais sans lissage (listes dynamiques, etc.). */
  static formatIntegerExact(n: number): string {
    return NumberFormatter.intFmt.format(Math.floor(n));
  }

  static formatMoney(n: number): string {
    return `${NumberFormatter.moneyFmt.format(NumberFormatter.smoothCounterValue(n))} $`;
  }

  /**
   * Format compact pour les valeurs de « capsule » (stats de panneaux) qui
   * peuvent devenir astronomiques (matière, etc.) : à partir du milliard
   * (1e9), affiche l'unité française (ex. « 6,00 quatrilliards »). En
   * dessous, chiffres complets. Ne pas utiliser pour le compteur principal
   * de trombones, qui reste toujours en chiffres complets.
   */
  static formatCompact(n: number, digits = 2): string {
    const value = NumberFormatter.smoothCounterValue(n);
    const abs = Math.abs(value);
    for (const [threshold, unit] of SCALE_TIERS) {
      if (abs >= threshold) {
        const scaled = value / threshold;
        const formatted = scaled.toLocaleString("fr-FR", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        });
        const plural = Math.abs(scaled) >= 2 ? "s" : "";
        return `${formatted}\u00A0${unit}${plural}`;
      }
    }
    return NumberFormatter.intFmt.format(Math.floor(value));
  }

  static formatDecimal(n: number, digits = 1): string {
    return NumberFormatter.smoothCounterValue(n).toLocaleString("fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
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
      return actualValue;
    }

    // Gros saut (reset, etc.) → coller tout de suite, sinon lisser montée et descente.
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
