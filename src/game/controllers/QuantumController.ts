import type { QuantumSystem } from "../../systems/quantum/QuantumSystem";
import { bindClick } from "./bindClick";

/** Câble les actions de calcul quantique (puces photoniques, bascule du calcul). */
export class QuantumController {
  constructor(private readonly quantum: QuantumSystem) {}

  bind(): void {
    bindClick("btn-buy-qchip", () => this.quantum.purchasePhotonicChip());
    bindClick("btn-qcompute", () => this.quantum.toggleQuantumCompute());
  }
}
