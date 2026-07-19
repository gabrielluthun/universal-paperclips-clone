import { describe, expect, it } from "vitest";
import { NumberFormatter } from "./NumberFormatter";

describe("NumberFormatter", () => {
  it("formate les entiers en locale FR", () => {
    expect(NumberFormatter.formatInteger(1234.9)).toBe("1\u202f234");
  });

  it("formate la monnaie avec deux décimales et le symbole $", () => {
    expect(NumberFormatter.formatMoney(12.5)).toMatch(/^12,50\s\$$/);
  });

  it("affiche les très grands nombres en chiffres complets", () => {
    expect(NumberFormatter.formatInteger(1_500_000)).toBe("1\u202f500\u202f000");
    expect(NumberFormatter.formatMoney(2_000_000)).toMatch(
      /^2\u202f000\u202f000,00\s\$$/,
    );
  });
});
