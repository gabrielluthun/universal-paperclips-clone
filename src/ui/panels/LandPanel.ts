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
  private readonly batteries = requireElement<HTMLSpanElement>("batteries");
  private readonly storedPower =
    requireElement<HTMLSpanElement>("stored-power");
  private readonly batteryCost =
    requireElement<HTMLSpanElement>("battery-cost");
  private readonly btnBuyBattery =
    requireElement<HTMLButtonElement>("btn-buy-battery");

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

  private readonly factoriesPanel = requireElement<HTMLElement>(
    "panel-land-factories",
  );
  private readonly clipFactories =
    requireElement<HTMLSpanElement>("clip-factories");
  private readonly clipFactoryCost = requireElement<HTMLSpanElement>(
    "clip-factory-cost",
  );
  private readonly btnBuyClipFactory = requireElement<HTMLButtonElement>(
    "btn-buy-clip-factory",
  );

  private readonly swarmPanel = requireElement<HTMLElement>(
    "panel-land-swarm",
  );
  private readonly swarmSize = requireElement<HTMLSpanElement>("swarm-size");
  private readonly swarmGifts =
    requireElement<HTMLSpanElement>("swarm-gifts");
  private readonly swarmSlider =
    requireElement<HTMLInputElement>("swarm-slider");
  private readonly swarmSliderValue = requireElement<HTMLSpanElement>(
    "swarm-slider-value",
  );
  private readonly boredomWarning = requireElement<HTMLElement>(
    "swarm-boredom-warning",
  );
  private readonly btnEntertainSwarm = requireElement<HTMLButtonElement>(
    "btn-entertain-swarm",
  );
  private readonly entertainSwarmCost = requireElement<HTMLSpanElement>(
    "entertain-swarm-cost",
  );
  private readonly disorgWarning = requireElement<HTMLElement>(
    "swarm-disorg-warning",
  );
  private readonly btnSynchSwarm = requireElement<HTMLButtonElement>(
    "btn-synch-swarm",
  );
  private readonly synchSwarmCost = requireElement<HTMLSpanElement>(
    "synch-swarm-cost",
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

      this.batteries.textContent = NumberFormatter.formatInteger(
        state.batteries,
      );
      this.storedPower.textContent = `${NumberFormatter.formatCompact(
        state.storedPower,
      )}\u00A0/\u00A0${NumberFormatter.formatCompact(
        land.getBatteryCapacity(),
      )}\u00A0MW·s`;
      const batteryCost = land.getNextBatteryCost();
      this.batteryCost.textContent = NumberFormatter.formatInteger(batteryCost);
      this.btnBuyBattery.disabled = state.clips < batteryCost;
    }

    const showDrones = state.harvesterDronesUnlocked || state.wireDronesUnlocked;
    this.dronesPanel.hidden = !showDrones;
    if (!showDrones) return;

    this.dronePowerRatio.textContent = `${NumberFormatter.formatInteger(
      land.getPowerRatio() * 100,
    )}\u00A0%`;
    this.availableMatter.textContent = `${NumberFormatter.formatCompact(state.availableMatter)}\u00A0g`;
    this.acquiredMatter.textContent = `${NumberFormatter.formatCompact(state.acquiredMatter)}\u00A0g`;

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

    this.factoriesPanel.hidden = !state.clipFactoriesUnlocked;
    if (!state.clipFactoriesUnlocked) return;

    this.clipFactories.textContent = NumberFormatter.formatInteger(
      state.clipFactories,
    );
    const factoryCost = land.getNextClipFactoryCost();
    this.clipFactoryCost.textContent =
      NumberFormatter.formatInteger(factoryCost);
    this.btnBuyClipFactory.disabled = state.clips < factoryCost;

    this.swarmPanel.hidden = !state.swarmComputingUnlocked;
    if (!state.swarmComputingUnlocked) return;

    this.swarmSize.textContent = NumberFormatter.formatInteger(
      land.getSwarmSize(),
    );
    this.swarmGifts.textContent = NumberFormatter.formatInteger(
      state.swarmGifts,
    );
    if (document.activeElement !== this.swarmSlider) {
      this.swarmSlider.value = String(state.sliderPos);
    }
    this.swarmSliderValue.textContent = `${NumberFormatter.formatInteger(state.sliderPos)}\u00A0%`;

    this.boredomWarning.hidden = !state.boredomActive;
    this.btnEntertainSwarm.hidden = !state.boredomActive;
    const entertainCost = land.getEntertainSwarmCost();
    this.entertainSwarmCost.textContent =
      NumberFormatter.formatInteger(entertainCost);
    this.btnEntertainSwarm.disabled = state.creativity < entertainCost;

    this.disorgWarning.hidden = !state.disorgActive;
    this.btnSynchSwarm.hidden = !state.disorgActive;
    const synchCost = land.getSynchSwarmCost();
    this.synchSwarmCost.textContent = NumberFormatter.formatInteger(synchCost);
    this.btnSynchSwarm.disabled = state.yomi < synchCost;
  }
}
