import { describe, expect, it, vi } from "vitest";
import { GameState } from "../../state/GameState";
import { InvestmentSystem } from "./InvestmentSystem";

describe("InvestmentSystem", () => {
  it("refuse dépôt/retrait tant que les investissements sont verrouillés", () => {
    const state = GameState.createInitial();
    state.funds = 100;
    const invest = new InvestmentSystem(state);
    expect(invest.depositAll()).toBe(false);
    expect(state.funds).toBe(100);
  });

  it("dépose et retire les fonds", () => {
    const state = GameState.createInitial();
    state.investmentsUnlocked = true;
    state.funds = 200;
    const invest = new InvestmentSystem(state);

    expect(invest.deposit(50)).toBe(true);
    expect(state.funds).toBe(150);
    expect(state.investmentFunds).toBe(50);

    expect(invest.withdrawAll()).toBe(true);
    expect(state.funds).toBe(200);
    expect(state.investmentFunds).toBe(0);
  });

  it("augmente le rendement attendu avec moteur, yomi et risque", () => {
    const state = GameState.createInitial();
    state.investmentsUnlocked = true;
    const invest = new InvestmentSystem(state);
    const base = invest.getExpectedReturnRate();

    state.investEngineLevel = 2;
    expect(invest.getExpectedReturnRate()).toBeGreaterThan(base);

    state.yomi = 2;
    const withYomi = invest.getExpectedReturnRate();
    state.investRisk = 3;
    expect(invest.getExpectedReturnRate()).toBeGreaterThan(withYomi);
  });

  it("applique un tick boursier qui fait varier le portefeuille", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const state = GameState.createInitial();
    state.investmentsUnlocked = true;
    state.investmentFunds = 1000;
    state.investEngineLevel = 1;
    state.investRisk = 2;
    const invest = new InvestmentSystem(state);

    const delta = invest.applyStockTick();
    expect(delta).not.toBe(0);
    expect(state.investmentFunds).toBeCloseTo(1000 + delta, 5);
    expect(state.lastStockDelta).toBeCloseTo(delta, 5);
    vi.restoreAllMocks();
  });

  it("accumule les ticks sur update", () => {
    const state = GameState.createInitial();
    state.investmentsUnlocked = true;
    state.investmentFunds = 1000;
    const invest = new InvestmentSystem(state);
    const before = state.investmentFunds;
    invest.update(1000);
    expect(state.investmentFunds).not.toBe(before);
  });
});
