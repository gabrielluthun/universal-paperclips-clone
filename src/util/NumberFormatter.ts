export class NumberFormatter {
  private static readonly intFmt = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  });

  private static readonly moneyFmt = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private static readonly compactFmt = new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  /** Entiers : notation compacte au-delà d'un million. */
  static formatInteger(n: number): string {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) {
      return NumberFormatter.compactFmt.format(Math.floor(n));
    }
    return NumberFormatter.intFmt.format(Math.floor(n));
  }

  static formatMoney(n: number): string {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) {
      return `${NumberFormatter.compactFmt.format(n)} $`;
    }
    return `${NumberFormatter.moneyFmt.format(n)} $`;
  }

  static formatDecimal(n: number, digits = 1): string {
    return n.toLocaleString("fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }
}
