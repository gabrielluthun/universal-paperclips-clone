import { requireElement } from "../../ui/dom";
import type { LandSystem } from "../../systems/land/LandSystem";
import { bindClick } from "./bindClick";

/** Câble les actions de la phase 2 (Terre) : énergie, drones, usines, informatique en essaim. */
export class LandController {
  constructor(private readonly land: LandSystem) {}

  bind(): void {
    bindClick("btn-buy-solar-farm", () => this.land.purchaseSolarFarm());
    bindClick("btn-buy-solar-farm-10", () => this.land.purchaseSolarFarm(10));
    bindClick("btn-buy-solar-farm-100", () => this.land.purchaseSolarFarm(100));
    bindClick("btn-disassemble-solar-farm", () =>
      this.land.disassembleSolarFarm(),
    );
    bindClick("btn-disassemble-all-solar-farms", () =>
      this.land.disassembleAllSolarFarms(),
    );

    bindClick("btn-buy-battery", () => this.land.purchaseBattery());
    bindClick("btn-buy-battery-10", () => this.land.purchaseBattery(10));
    bindClick("btn-buy-battery-100", () => this.land.purchaseBattery(100));
    bindClick("btn-disassemble-battery", () => this.land.disassembleBattery());
    bindClick("btn-disassemble-all-batteries", () =>
      this.land.disassembleAllBatteries(),
    );

    bindClick("btn-buy-harvester-drone", () =>
      this.land.purchaseHarvesterDrone(),
    );
    bindClick("btn-buy-harvester-drone-10", () =>
      this.land.purchaseHarvesterDrone(10),
    );
    bindClick("btn-buy-harvester-drone-100", () =>
      this.land.purchaseHarvesterDrone(100),
    );
    bindClick("btn-disassemble-harvester-drone", () =>
      this.land.disassembleHarvesterDrone(),
    );
    bindClick("btn-disassemble-all-harvester-drones", () =>
      this.land.disassembleAllHarvesterDrones(),
    );

    bindClick("btn-buy-wire-drone", () => this.land.purchaseWireDrone());
    bindClick("btn-buy-wire-drone-10", () => this.land.purchaseWireDrone(10));
    bindClick("btn-buy-wire-drone-100", () => this.land.purchaseWireDrone(100));
    bindClick("btn-disassemble-wire-drone", () =>
      this.land.disassembleWireDrone(),
    );
    bindClick("btn-disassemble-all-wire-drones", () =>
      this.land.disassembleAllWireDrones(),
    );

    bindClick("btn-buy-clip-factory", () => this.land.purchaseClipFactory());
    bindClick("btn-buy-clip-factory-10", () =>
      this.land.purchaseClipFactory(10),
    );
    bindClick("btn-buy-clip-factory-100", () =>
      this.land.purchaseClipFactory(100),
    );
    bindClick("btn-disassemble-clip-factory", () =>
      this.land.disassembleClipFactory(),
    );
    bindClick("btn-disassemble-all-clip-factories", () =>
      this.land.disassembleAllClipFactories(),
    );

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
