import { requireElement } from "../../ui/dom";
import type { LandSystem } from "../../systems/land/LandSystem";
import { bindClick } from "./bindClick";

/** Câble les actions de la phase 2 (Terre) : énergie, drones, usines, informatique en essaim. */
export class LandController {
  constructor(private readonly land: LandSystem) {}

  bind(): void {
    bindClick("btn-buy-solar-farm", () => this.land.purchaseSolarFarm());
    bindClick("btn-buy-battery", () => this.land.purchaseBattery());
    bindClick("btn-buy-harvester-drone", () =>
      this.land.purchaseHarvesterDrone(),
    );
    bindClick("btn-buy-wire-drone", () => this.land.purchaseWireDrone());
    bindClick("btn-buy-clip-factory", () => this.land.purchaseClipFactory());
    bindClick("btn-entertain-swarm", () => this.land.entertainSwarm());
    bindClick("btn-synch-swarm", () => this.land.synchronizeSwarm());

    requireElement<HTMLInputElement>("swarm-slider").addEventListener(
      "input",
      (event) => {
        const value = Number((event.target as HTMLInputElement).value);
        this.land.setSliderPos(value);
      },
    );
  }
}
