import type { LandSystem } from "../../systems/land/LandSystem";
import { bindClick } from "./bindClick";

/** Câble les actions de la phase 2 (Terre) : énergie et drones. */
export class LandController {
  constructor(private readonly land: LandSystem) {}

  bind(): void {
    bindClick("btn-buy-solar-farm", () => this.land.purchaseSolarFarm());
    bindClick("btn-buy-battery", () => this.land.purchaseBattery());
    bindClick("btn-buy-harvester-drone", () =>
      this.land.purchaseHarvesterDrone(),
    );
    bindClick("btn-buy-wire-drone", () => this.land.purchaseWireDrone());
  }
}
