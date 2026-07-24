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

  it("lisse les compteurs entre deux frames après beginFrame", () => {
    NumberFormatter.beginFrame(0);
    expect(NumberFormatter.formatInteger(100)).toBe("100");

    NumberFormatter.beginFrame(100); // 0,1 s plus tard
    const smoothed = NumberFormatter.formatInteger(200);
    const parsed = Number(smoothed.replace(/\u202f/g, ""));
    expect(parsed).toBeGreaterThan(100);
    expect(parsed).toBeLessThan(200);
  });

  it("lisse aussi les baisses (fil, etc.)", () => {
    NumberFormatter.beginFrame(0);
    expect(NumberFormatter.formatInteger(1000)).toBe("1\u202f000");

    NumberFormatter.beginFrame(100);
    const smoothed = NumberFormatter.formatInteger(900);
    const parsed = Number(smoothed.replace(/\u202f/g, ""));
    expect(parsed).toBeGreaterThan(900);
    expect(parsed).toBeLessThan(1000);
  });

  it("formatIntegerExact ignore le lissage", () => {
    NumberFormatter.beginFrame(0);
    NumberFormatter.formatInteger(50);
    NumberFormatter.beginFrame(100);
    expect(NumberFormatter.formatIntegerExact(999)).toBe("999");
  });

  it("formatCompact reste en chiffres complets sous le milliard", () => {
    expect(NumberFormatter.formatCompact(1)).toBe("1");
    expect(NumberFormatter.formatCompact(999_999_999)).toBe("999\u202f999\u202f999");
  });

  it("formatCompact abrège en échelle longue française à partir du milliard", () => {
    expect(NumberFormatter.formatCompact(1_500_000_000)).toBe(
      "1,5\u00A0milliard",
    );
    expect(NumberFormatter.formatCompact(2_500_000_000)).toBe(
      "2,5\u00A0milliards",
    );
    expect(NumberFormatter.formatCompact(1_000_000_000_000)).toBe(
      "1\u00A0billion",
    );
  });

  it("formatCompact reconnaît les quatrilliards (matière disponible de phase 2)", () => {
    expect(NumberFormatter.formatCompact(6 * Math.pow(10, 27))).toBe(
      "6\u00A0quatrilliards",
    );
    expect(NumberFormatter.formatCompact(6n * 10n ** 27n)).toBe(
      "6\u00A0quatrilliards",
    );
  });

  it("lisse un bigint dans la plage safe (ex. 1 milliard)", () => {
    NumberFormatter.beginFrame(0);
    expect(NumberFormatter.formatInteger(1_000_000_000n)).toBe(
      "1\u202f000\u202f000\u202f000",
    );

    NumberFormatter.beginFrame(100);
    const smoothed = NumberFormatter.formatInteger(1_000_000_100n);
    const parsed = Number(smoothed.replace(/\u202f/g, ""));
    expect(parsed).toBeGreaterThan(1_000_000_000);
    expect(parsed).toBeLessThan(1_000_000_100);
  });

  it("formatInteger sur bigint hors plage safe reste exact", () => {
    const value = 5n * 10n ** 21n - 12345n;
    NumberFormatter.beginFrame(0);
    const formatted = NumberFormatter.formatInteger(value);
    expect(formatted).toBe(NumberFormatter.formatIntegerExact(value));
    expect(formatted.replace(/\u202f/g, "")).toBe(value.toString());
  });
});
