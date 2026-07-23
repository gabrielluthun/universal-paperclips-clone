import type { ComputeSystem } from "../../systems/compute/ComputeSystem";
import { bindClick } from "./bindClick";

/** Câble les actions d'allocation de confiance (processeurs, mémoire). */
export class ComputeController {
  constructor(private readonly compute: ComputeSystem) {}

  bind(): void {
    bindClick("btn-add-processor", () => this.compute.allocateProcessor());
    bindClick("btn-add-memory", () => this.compute.allocateMemory());
  }
}
