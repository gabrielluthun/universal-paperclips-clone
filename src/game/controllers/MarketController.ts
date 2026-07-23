import type { MarketSystem } from "../../systems/market/MarketSystem";
import { bindClick } from "./bindClick";

/** Câble les actions de marché (prix, marketing). */
export class MarketController {
  constructor(private readonly market: MarketSystem) {}

  bind(): void {
    bindClick("btn-price-up", () => this.market.increaseUnitPrice());
    bindClick("btn-price-down", () => this.market.decreaseUnitPrice());
    bindClick("btn-marketing", () => this.market.purchaseMarketingUpgrade());
  }
}
