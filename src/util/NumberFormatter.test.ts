import { describe, expect, it } from "vitest";
import { NumberFormatter } from "./NumberFormatter";

describe("NumberFormatter", () => {
  it("formate les entiers en locale FR", () => {
    expect(NumberFormatter.formatInteger(1234.9)).toBe("1\u202f234");
  });

  it("formate la monnaie avec deux décimales et le symbole $", () => {
    expect(NumberFormatter.formatMoney(12.5)).toMatch(/^12,50\s\$$/);
  });

  it("utilise une notation compacte pour les très grands nombres", () => {
    const formatted = NumberFormatter.formatInteger(1_500_000);
    expect(formatted.toLowerCase()).toMatch(/1[,.]5\s*m/);
    const money = NumberFormatter.formatMoney(2_000_000);
    expect(money).toContain("$");
    expect(money.toLowerCase()).toMatch(/2\s*m/);
  });
});
