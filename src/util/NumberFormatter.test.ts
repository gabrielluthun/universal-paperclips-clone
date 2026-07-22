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
});
