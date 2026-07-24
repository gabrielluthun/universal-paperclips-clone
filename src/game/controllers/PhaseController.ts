import { bindClick } from "./bindClick";

/** Câble les actions liées aux transitions de phase (accusés de fin de phase). */
export class PhaseController {
  constructor(
    private readonly onAcknowledgePhase1End: () => void,
    private readonly onAcknowledgePhase2End: () => void,
  ) {}

  bind(): void {
    bindClick("btn-dismiss-phase1-end", () => this.onAcknowledgePhase1End());
    bindClick("btn-dismiss-phase2-end", () => this.onAcknowledgePhase2End());
  }
}
