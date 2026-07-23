import type { ProductionSystem } from "../../systems/production/ProductionSystem";
import type { GameStats } from "../GameStats";
import { bindClick } from "./bindClick";

/** Câble les actions manuelles de production (fabrication, fil, machines). */
export class ProductionController {
  constructor(
    private readonly production: ProductionSystem,
    private readonly stats: GameStats,
  ) {}

  bind(): void {
    bindClick("btn-make", () => {
      this.stats.addClips(this.production.produceClips(1));
    });
    bindClick("btn-buy-wire", () => this.production.purchaseWireSpool());
    bindClick("btn-buy-autoclipper", () =>
      this.production.purchaseAutoClipper(),
    );
    bindClick("btn-buy-megaclipper", () =>
      this.production.purchaseMegaClipper(),
    );
  }
}
