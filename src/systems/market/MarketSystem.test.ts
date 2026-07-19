import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { MarketSystem } from "./MarketSystem";

describe("MarketSystem", () => {
  it("calcule la demande de base à 0,25 $ et marketing niv. 1", () => {
    const state = GameState.createInitial();
    const market = new MarketSystem(state);
    // (0,8 / 0,25) × 1,1^0 × 1 = 3,2
    expect(market.getPublicDemand()).toBeCloseTo(3.2, 5);
  });

  it("augmente la demande quand le prix baisse ou le marketing monte", () => {
    const state = GameState.createInitial();
    const market = new MarketSystem(state);
    const base = market.getPublicDemand();

    market.decreaseUnitPrice();
    expect(market.getPublicDemand()).toBeGreaterThan(base);

    state.price = 0.25;
    state.marketingLvl = 2;
    expect(market.getPublicDemand()).toBeCloseTo(3.2 * 1.1, 5);
  });

  it("applique l'efficacité marketing des projets", () => {
    const state = GameState.createInitial();
    state.marketingEffectiveness = 2;
    const market = new MarketSystem(state);
    expect(market.getPublicDemand()).toBeCloseTo(6.4, 5);
  });

  it("calcule le coût marketing en doublement (100, 200, 400…)", () => {
    const state = GameState.createInitial();
    const market = new MarketSystem(state);
    expect(market.getNextMarketingLevelCost()).toBe(100);
    state.marketingLvl = 3;
    expect(market.getNextMarketingLevelCost()).toBe(400);
  });

  it("ne baisse pas le prix sous le plancher", () => {
    const state = GameState.createInitial();
    state.price = MarketSystem.PRICE_MIN;
    const market = new MarketSystem(state);
    market.decreaseUnitPrice();
    expect(state.price).toBe(MarketSystem.PRICE_MIN);
  });

  it("achète un niveau de marketing si les fonds suffisent", () => {
    const state = GameState.createInitial();
    state.funds = 100;
    const market = new MarketSystem(state);
    expect(market.purchaseMarketingUpgrade()).toBe(true);
    expect(state.funds).toBe(0);
    expect(state.marketingLvl).toBe(2);
  });

  it("refuse l'achat marketing si les fonds manquent", () => {
    const state = GameState.createInitial();
    state.funds = 99;
    const market = new MarketSystem(state);
    expect(market.purchaseMarketingUpgrade()).toBe(false);
    expect(state.marketingLvl).toBe(1);
  });
});
