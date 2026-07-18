const intFmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const moneyFmt = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatInt(n: number): string {
  return intFmt.format(Math.floor(n));
}

export function formatMoney(n: number): string {
  return `${moneyFmt.format(n)} $`;
}

export function formatDecimal(n: number, digits = 1): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
