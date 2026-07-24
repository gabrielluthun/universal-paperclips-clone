import type { LandSystem } from "../../systems/land/LandSystem";
import { bindClick } from "./bindClick";

/** Câble les actions de la phase 2 (Terre) : énergie pour l'instant. */
export class LandController {
  constructor(private readonly land: LandSystem) {}

  bind(): void {
    bindClick("btn-buy-solar-farm", () => this.land.purchaseSolarFarm());
  }
}
