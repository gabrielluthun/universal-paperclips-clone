import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

/**
 * Écran de transition de fin de phase 1. La phase 2 ne remplace pas
 * l'affichage phase 1 en bloc : chaque panneau devenu obsolète (Affaires,
 * Investissements) se masque individuellement via son propre état
 * (`state.phase`), les autres (Manufacturing, Compute, Quantique,
 * Stratégique) restent actifs, conformément au jeu original.
 */
export class PhasePanel {
  private readonly overlay = requireElement<HTMLElement>("phase1-end-overlay");
  private readonly endClips = requireElement<HTMLSpanElement>("phase1-end-clips");

  render(model: RenderModel): void {
    const { state } = model;
    const showOverlay = state.phase1Complete && !state.phase1EndAcknowledged;
    this.overlay.hidden = !showOverlay;
    // Toujours formater pour garder un ordre de slots de lissage stable.
    this.endClips.textContent = NumberFormatter.formatInteger(state.clips);
  }
}
