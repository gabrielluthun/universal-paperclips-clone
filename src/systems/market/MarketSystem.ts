import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

export class MarketSystem extends GameSystem {
  static readonly PRICE_STEP = 0.01;
  static readonly PRICE_MIN = 0.01;
  private static readonly WIRE_FLOOR_PRICE = 20;

  private revenueEarnedDuringLastUpdate = 0;

  constructor(state: GameState) {
    super(state);
  }

  private roundToCents(n: number): number {
    return Math.round(n * 100) / 100;
  }

  /**
   * Demande du public. Formule de l'original :
   * (0,8 / prix) × 1,1^(niveau de marketing − 1) × efficacité.
   */
  getPublicDemand(): number {
    const s = this.state;
    const marketing = Math.pow(1.1, s.marketingLvl - 1);
    return (0.8 / s.price) * marketing * s.marketingEffectiveness;
  }

  getNextMarketingLevelCost(): number {
    return 100 * Math.pow(2, this.state.marketingLvl - 1);
  }

  increaseUnitPrice(): void {
    this.state.price = this.roundToCents(
      this.state.price + MarketSystem.PRICE_STEP,
    );
  }

  decreaseUnitPrice(): void {
    this.state.price = Math.max(
      MarketSystem.PRICE_MIN,
      this.roundToCents(this.state.price - MarketSystem.PRICE_STEP),
    );
  }

  purchaseMarketingUpgrade(): boolean {
    const cost = this.getNextMarketingLevelCost();
    if (this.state.funds < cost) return false;
    this.state.funds -= cost;
    this.state.marketingLvl += 1;
    return true;
  }

  /**
   * Ventes automatiques. À chaque tick de 100 ms, une transaction a lieu
   * avec une probabilité demande/100 ; elle écoule ⌊0,7 × demande^1,15⌋
   * trombones (au moins 1), dans la limite du stock.
   */
  private sellFromInventory(deltaMs: number): number {
    const s = this.state;
    if (s.unsold <= 0) return 0;
    const demand = this.getPublicDemand();
    const attempts = Math.max(1, Math.round(deltaMs / 100));
    let revenue = 0;
    for (let i = 0; i < attempts; i++) {
      if (s.unsold <= 0) break;
      if (Math.random() >= demand / 100) continue;
      const wanted = Math.max(1, Math.floor(0.7 * Math.pow(demand, 1.15)));
      const sold = Math.min(wanted, s.unsold);
      s.unsold -= sold;
      revenue += sold * s.price;
    }
    s.funds += revenue;
    return revenue;
  }

  /**
   * Cours du fil : le prix de référence redescend lentement vers 20 $ ;
   * le prix affiché oscille en sinusoïde autour de cette référence.
   */
  private updateWireMarketPrice(): void {
    const s = this.state;
    if (s.wireBasePrice > MarketSystem.WIRE_FLOOR_PRICE) {
      s.wireBasePrice = Math.max(
        MarketSystem.WIRE_FLOOR_PRICE,
        s.wireBasePrice - 0.001,
      );
    }
    if (Math.random() < 0.015) {
      s.wirePriceCounter += 1;
      const flux = 6 * Math.sin(s.wirePriceCounter);
      s.wireCost = Math.max(1, Math.ceil(s.wireBasePrice + flux));
    }
  }

  override update(deltaMs: number): void {
    this.revenueEarnedDuringLastUpdate = this.sellFromInventory(deltaMs);
    this.updateWireMarketPrice();
  }

  takeRevenueEarnedDuringLastUpdate(): number {
    const revenue = this.revenueEarnedDuringLastUpdate;
    this.revenueEarnedDuringLastUpdate = 0;
    return revenue;
  }
}
