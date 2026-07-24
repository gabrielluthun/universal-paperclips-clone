import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

/**
 * Écrans de transition de fin de phase. La phase 2 ne remplace pas
 * l'affichage phase 1 en bloc : Affaires, Fabrication et le bouton Faire
 * se masquent individuellement ; le fil réapparaît dans le panneau Drones.
 * La fin de phase 2 (Exploration spatiale) affiche un second overlay en
 * teaser de la phase 3, non encore construite.
 */
export class PhasePanel {
  private readonly overlay = requireElement<HTMLElement>("phase1-end-overlay");
  private readonly endClips = requireElement<HTMLSpanElement>("phase1-end-clips");
  private readonly phase2Overlay = requireElement<HTMLElement>(
    "phase2-end-overlay",
  );
  private readonly phase2EndClips = requireElement<HTMLSpanElement>(
    "phase2-end-clips",
  );

  render(model: RenderModel): void {
    const { state } = model;
    const showOverlay = state.phase1Complete && !state.phase1EndAcknowledged;
    this.overlay.hidden = !showOverlay;
    // Toujours formater pour garder un ordre de slots de lissage stable.
    this.endClips.textContent = NumberFormatter.formatInteger(state.clips);

    const showPhase2Overlay =
      state.phase2Complete && !state.phase2EndAcknowledged;
    this.phase2Overlay.hidden = !showPhase2Overlay;
    this.phase2EndClips.textContent = NumberFormatter.formatInteger(
      state.clips,
    );
  }
}
