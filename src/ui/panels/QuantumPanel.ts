import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

export class QuantumPanel {
  private readonly panel = requireElement<HTMLElement>("panel-quantum");
  private readonly qChips = requireElement<HTMLSpanElement>("qchips");
  private readonly qChipCost = requireElement<HTMLSpanElement>("qchip-cost");
  private readonly btnBuyQChip =
    requireElement<HTMLButtonElement>("btn-buy-qchip");
  private readonly btnQCompute =
    requireElement<HTMLButtonElement>("btn-qcompute");

  render(model: RenderModel): void {
    const { state, quantum } = model;
    this.panel.hidden = !state.quantumUnlocked;

    // Toujours formater les compteurs (slots de lissage stables).
    this.qChips.textContent = NumberFormatter.formatInteger(state.qChips);
    this.qChipCost.textContent = NumberFormatter.formatInteger(
      quantum.getNextPhotonicChipCost(),
    );

    this.btnBuyQChip.disabled =
      !state.quantumUnlocked ||
      state.ops < quantum.getNextPhotonicChipCost();
    this.btnQCompute.disabled = !state.quantumUnlocked || state.qChips < 1;
    this.btnQCompute.textContent = state.qComputeActive
      ? "Arrêter le calcul (figer les ops)"
      : "Calcul quantique";
  }
}
