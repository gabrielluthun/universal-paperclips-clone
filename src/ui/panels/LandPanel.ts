import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

/** Panneau phase 2 (Terre) : énergie pour l'instant, drones/usines à venir. */
export class LandPanel {
  private readonly panel = requireElement<HTMLElement>("panel-land-energy");
  private readonly solarFarms = requireElement<HTMLSpanElement>("solar-farms");
  private readonly powerOutput =
    requireElement<HTMLSpanElement>("power-output");
  private readonly solarFarmCost =
    requireElement<HTMLSpanElement>("solar-farm-cost");
  private readonly btnBuySolarFarm =
    requireElement<HTMLButtonElement>("btn-buy-solar-farm");

  render(model: RenderModel): void {
    const { state, land } = model;
    this.panel.hidden = !state.powerGridUnlocked;
    if (!state.powerGridUnlocked) return;

    this.solarFarms.textContent = NumberFormatter.formatInteger(
      state.solarFarms,
    );
    this.powerOutput.textContent = `${NumberFormatter.formatInteger(state.power)}\u00A0MW`;

    const cost = land.getNextSolarFarmCost();
    this.solarFarmCost.textContent = NumberFormatter.formatInteger(cost);
    this.btnBuySolarFarm.disabled = state.clips < cost;
  }
}
