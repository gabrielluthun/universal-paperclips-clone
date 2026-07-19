export class NumberFormatter {
  private static readonly intFmt = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  });

  private static readonly moneyFmt = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  static formatInteger(n: number): string {
    return NumberFormatter.intFmt.format(Math.floor(n));
  }

  static formatMoney(n: number): string {
    return `${NumberFormatter.moneyFmt.format(n)} $`;
  }

  static formatDecimal(n: number, digits = 1): string {
    return n.toLocaleString("fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }
}
