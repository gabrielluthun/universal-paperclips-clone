import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

/** Panneau phase 2 (Terre) : énergie et drones. */
export class LandPanel {
  private readonly energyPanel = requireElement<HTMLElement>(
    "panel-land-energy",
  );
  private readonly solarFarms = requireElement<HTMLSpanElement>("solar-farms");
  private readonly powerOutput =
    requireElement<HTMLSpanElement>("power-output");
  private readonly solarFarmCost =
    requireElement<HTMLSpanElement>("solar-farm-cost");
  private readonly btnBuySolarFarm =
    requireElement<HTMLButtonElement>("btn-buy-solar-farm");

  private readonly dronesPanel = requireElement<HTMLElement>(
    "panel-land-drones",
  );
  private readonly dronePowerRatio =
    requireElement<HTMLSpanElement>("drone-power-ratio");
  private readonly availableMatter =
    requireElement<HTMLSpanElement>("available-matter");
  private readonly acquiredMatter =
    requireElement<HTMLSpanElement>("acquired-matter");
  private readonly harvesterDrones =
    requireElement<HTMLSpanElement>("harvester-drones");
  private readonly harvesterDroneCost = requireElement<HTMLSpanElement>(
    "harvester-drone-cost",
  );
  private readonly btnBuyHarvesterDrone = requireElement<HTMLButtonElement>(
    "btn-buy-harvester-drone",
  );
  private readonly wireDrones = requireElement<HTMLSpanElement>("wire-drones");
  private readonly wireDroneCost =
    requireElement<HTMLSpanElement>("wire-drone-cost");
  private readonly btnBuyWireDrone = requireElement<HTMLButtonElement>(
    "btn-buy-wire-drone",
  );

  render(model: RenderModel): void {
    const { state, land } = model;

    this.energyPanel.hidden = !state.powerGridUnlocked;
    if (state.powerGridUnlocked) {
      this.solarFarms.textContent = NumberFormatter.formatInteger(
        state.solarFarms,
      );
      this.powerOutput.textContent = `${NumberFormatter.formatInteger(state.power)}\u00A0MW`;

      const farmCost = land.getNextSolarFarmCost();
      this.solarFarmCost.textContent = NumberFormatter.formatInteger(farmCost);
      this.btnBuySolarFarm.disabled = state.clips < farmCost;
    }

    const showDrones = state.harvesterDronesUnlocked || state.wireDronesUnlocked;
    this.dronesPanel.hidden = !showDrones;
    if (!showDrones) return;

    this.dronePowerRatio.textContent = `${NumberFormatter.formatInteger(
      land.getPowerRatio() * 100,
    )}\u00A0%`;
    this.availableMatter.textContent = `${NumberFormatter.formatInteger(state.availableMatter)}\u00A0g`;
    this.acquiredMatter.textContent = `${NumberFormatter.formatInteger(state.acquiredMatter)}\u00A0g`;

    this.harvesterDrones.textContent = NumberFormatter.formatInteger(
      state.harvesterDrones,
    );
    const harvesterCost = land.getNextHarvesterDroneCost();
    this.harvesterDroneCost.textContent =
      NumberFormatter.formatInteger(harvesterCost);
    this.btnBuyHarvesterDrone.disabled =
      !state.harvesterDronesUnlocked || state.clips < harvesterCost;

    this.wireDrones.textContent = NumberFormatter.formatInteger(
      state.wireDrones,
    );
    const wireCost = land.getNextWireDroneCost();
    this.wireDroneCost.textContent = NumberFormatter.formatInteger(wireCost);
    this.btnBuyWireDrone.disabled =
      !state.wireDronesUnlocked || state.clips < wireCost;
  }
}
