import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

export class PhasePanel {
  private readonly overlay = requireElement<HTMLElement>("phase1-end-overlay");
  private readonly endClips = requireElement<HTMLSpanElement>("phase1-end-clips");
  private readonly banner = requireElement<HTMLElement>("phase2-banner");

  render(model: RenderModel): void {
    const { state } = model;
    const showOverlay = state.phase1Complete && !state.phase1EndAcknowledged;
    this.overlay.hidden = !showOverlay;
    if (showOverlay) {
      this.endClips.textContent = NumberFormatter.formatInteger(state.clips);
    }
    this.banner.hidden = !(
      state.phase1Complete && state.phase1EndAcknowledged
    );
  }
}
