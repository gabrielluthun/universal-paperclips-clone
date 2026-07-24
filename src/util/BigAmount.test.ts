import { describe, expect, it } from "vitest";
import {
  ba,
  baApplyRate,
  baApproxNumber,
  baFromJSON,
  baFromPow,
  baMin,
  baMulFloat,
  baToJSON,
  decodeBigAmountFields,
  encodeBigAmountFields,
} from "./BigAmount";

describe("BigAmount", () => {
  it("ba convertit number, string et bigint", () => {
    expect(ba(12.9)).toBe(12n);
    expect(ba("1000000000000000000000000000000")).toBe(10n ** 30n);
    expect(ba(10n ** 21n)).toBe(10n ** 21n);
  });

  it("baFromPow arrondit Math.pow × factor", () => {
    expect(baFromPow(1, 2.25, 1_000_000)).toBe(1_000_000n);
    expect(baFromPow(2, 2.25, 1_000_000)).toBe(
      BigInt(Math.round(Math.pow(2, 2.25) * 1_000_000)),
    );
  });

  it("baMulFloat multiplie un coût par un facteur float", () => {
    expect(baMulFloat(100_000_000n, 10)).toBe(1_000_000_000n);
    expect(baMulFloat(100n, 1.5)).toBe(150n);
  });

  it("baApplyRate débite un stock avec accumulateur fractionnaire", () => {
    const first = baApplyRate(100n, 2.5, 1, 0);
    expect(first.moved).toBe(2n);
    expect(first.stock).toBe(98n);
    expect(first.frac).toBeCloseTo(0.5);

    const second = baApplyRate(first.stock, 2.5, 1, first.frac);
    expect(second.moved).toBe(3n);
    expect(second.stock).toBe(95n);
  });

  it("baApplyRate ne dépasse pas le stock", () => {
    const result = baApplyRate(5n, 100, 1, 0);
    expect(result.moved).toBe(5n);
    expect(result.stock).toBe(0n);
    expect(result.frac).toBe(0);
  });

  it("préserve la précision à 10^30 ± 10^13", () => {
    const stock = 10n ** 30n;
    const cost = 10n ** 13n;
    expect(stock - cost).toBe(10n ** 30n - 10n ** 13n);
    expect(stock - cost !== stock).toBe(true);
  });

  it("JSON round-trip string / number legacy", () => {
    expect(baFromJSON(baToJSON(10n ** 27n))).toBe(10n ** 27n);
    expect(baFromJSON(1_000_000)).toBe(1_000_000n);
    expect(baFromJSON("5000")).toBe(5000n);
  });

  it("encode / decode les champs de save", () => {
    const encoded = encodeBigAmountFields({
      clips: 10n ** 30n,
      unsold: 5n,
      other: true,
    });
    expect(encoded.clips).toBe("1000000000000000000000000000000");
    expect(encoded.unsold).toBe("5");
    expect(encoded.other).toBe(true);

    const decoded = decodeBigAmountFields(encoded);
    expect(decoded.clips).toBe(10n ** 30n);
    expect(decoded.unsold).toBe(5n);
  });

  it("baMin et baApproxNumber", () => {
    expect(baMin(3n, 5n)).toBe(3n);
    expect(baApproxNumber(1000n)).toBe(1000);
  });
});
