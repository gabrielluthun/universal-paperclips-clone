import { bindClick } from "./bindClick";

/** Câble les actions liées aux transitions de phase (accusé de fin de phase 1). */
export class PhaseController {
  constructor(private readonly onAcknowledgePhase1End: () => void) {}

  bind(): void {
    bindClick("btn-dismiss-phase1-end", () => this.onAcknowledgePhase1End());
  }
}
