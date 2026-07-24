import type { SwarmStatus } from "../../systems/land/LandSystem";
import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

const SWARM_STATUS_LABELS: Record<SwarmStatus, string> = {
  lonely: "Solitaire",
  noPower: "Hors tension",
  bored: "Ennuyé",
  disorganized: "Désorganisé",
  active: "Actif",
};

/** Panneau phase 2 (Terre) : énergie, drones, usines, essaim. */
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
  private readonly btnBuySolarFarm10 = requireElement<HTMLButtonElement>(
    "btn-buy-solar-farm-10",
  );
  private readonly btnBuySolarFarm100 = requireElement<HTMLButtonElement>(
    "btn-buy-solar-farm-100",
  );
  private readonly btnDisassembleAllSolarFarms =
    requireElement<HTMLButtonElement>("btn-disassemble-all-solar-farms");
  private readonly batteries = requireElement<HTMLSpanElement>("batteries");
  private readonly storedPower =
    requireElement<HTMLSpanElement>("stored-power");
  private readonly batteryCost =
    requireElement<HTMLSpanElement>("battery-cost");
  private readonly btnBuyBattery =
    requireElement<HTMLButtonElement>("btn-buy-battery");
  private readonly btnBuyBattery10 =
    requireElement<HTMLButtonElement>("btn-buy-battery-10");
  private readonly btnBuyBattery100 =
    requireElement<HTMLButtonElement>("btn-buy-battery-100");
  private readonly btnDisassembleAllBatteries =
    requireElement<HTMLButtonElement>("btn-disassemble-all-batteries");

  private readonly dronesPanel = requireElement<HTMLElement>(
    "panel-land-drones",
  );
  private readonly dronePowerRatio =
    requireElement<HTMLSpanElement>("drone-power-ratio");
  private readonly availableMatter =
    requireElement<HTMLSpanElement>("available-matter");
  private readonly matterRate = requireElement<HTMLSpanElement>("matter-rate");
  private readonly acquiredMatter =
    requireElement<HTMLSpanElement>("acquired-matter");
  private readonly landWire = requireElement<HTMLSpanElement>("land-wire");
  private readonly landWireRate =
    requireElement<HTMLSpanElement>("land-wire-rate");
  private readonly harvesterDrones =
    requireElement<HTMLSpanElement>("harvester-drones");
  private readonly harvesterDroneCost = requireElement<HTMLSpanElement>(
    "harvester-drone-cost",
  );
  private readonly btnBuyHarvesterDrone = requireElement<HTMLButtonElement>(
    "btn-buy-harvester-drone",
  );
  private readonly btnBuyHarvesterDrone10 = requireElement<HTMLButtonElement>(
    "btn-buy-harvester-drone-10",
  );
  private readonly btnBuyHarvesterDrone100 = requireElement<HTMLButtonElement>(
    "btn-buy-harvester-drone-100",
  );
  private readonly btnDisassembleAllHarvesterDrones =
    requireElement<HTMLButtonElement>("btn-disassemble-all-harvester-drones");
  private readonly wireDrones = requireElement<HTMLSpanElement>("wire-drones");
  private readonly wireDroneCost =
    requireElement<HTMLSpanElement>("wire-drone-cost");
  private readonly btnBuyWireDrone = requireElement<HTMLButtonElement>(
    "btn-buy-wire-drone",
  );
  private readonly btnBuyWireDrone10 = requireElement<HTMLButtonElement>(
    "btn-buy-wire-drone-10",
  );
  private readonly btnBuyWireDrone100 = requireElement<HTMLButtonElement>(
    "btn-buy-wire-drone-100",
  );
  private readonly btnDisassembleAllWireDrones =
    requireElement<HTMLButtonElement>("btn-disassemble-all-wire-drones");

  private readonly factoriesPanel = requireElement<HTMLElement>(
    "panel-land-factories",
  );
  private readonly clipFactories =
    requireElement<HTMLSpanElement>("clip-factories");
  private readonly factoryClipRate = requireElement<HTMLSpanElement>(
    "factory-clip-rate",
  );
  private readonly clipFactoryCost = requireElement<HTMLSpanElement>(
    "clip-factory-cost",
  );
  private readonly btnBuyClipFactory = requireElement<HTMLButtonElement>(
    "btn-buy-clip-factory",
  );
  private readonly btnBuyClipFactory10 = requireElement<HTMLButtonElement>(
    "btn-buy-clip-factory-10",
  );
  private readonly btnBuyClipFactory100 = requireElement<HTMLButtonElement>(
    "btn-buy-clip-factory-100",
  );
  private readonly btnDisassembleAllClipFactories =
    requireElement<HTMLButtonElement>("btn-disassemble-all-clip-factories");

  private readonly swarmPanel = requireElement<HTMLElement>(
    "panel-land-swarm",
  );
  private readonly swarmSize = requireElement<HTMLSpanElement>("swarm-size");
  private readonly swarmStatus =
    requireElement<HTMLSpanElement>("swarm-status");
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
    const onEarth = state.phase === 2;

    // Toujours formater toutes les sections (même masquées) pour garder
    // un ordre de slots de lissage stable au fil des déblocages.
    this.energyPanel.hidden = !onEarth || !state.powerGridUnlocked;
    this.solarFarms.textContent = NumberFormatter.formatInteger(
      state.solarFarms,
    );
    this.powerOutput.textContent = `${NumberFormatter.formatInteger(state.power)}\u00A0MW`;
    const farmCost = land.getNextSolarFarmCost();
    this.solarFarmCost.textContent = NumberFormatter.formatInteger(farmCost);
    const canBuyFarm = state.powerGridUnlocked && state.clips >= farmCost;
    this.btnBuySolarFarm.disabled = !canBuyFarm;
    this.btnBuySolarFarm10.disabled = !canBuyFarm;
    this.btnBuySolarFarm100.disabled = !canBuyFarm;
    this.btnDisassembleAllSolarFarms.disabled = state.solarFarms < 1;

    this.batteries.textContent = NumberFormatter.formatInteger(state.batteries);
    this.storedPower.textContent = `${NumberFormatter.formatInteger(
      state.storedPower,
    )}\u00A0/\u00A0${NumberFormatter.formatInteger(
      land.getBatteryCapacity(),
    )}\u00A0MW·s`;
    const batteryCost = land.getNextBatteryCost();
    this.batteryCost.textContent = NumberFormatter.formatInteger(batteryCost);
    const canBuyBattery = state.powerGridUnlocked && state.clips >= batteryCost;
    this.btnBuyBattery.disabled = !canBuyBattery;
    this.btnBuyBattery10.disabled = !canBuyBattery;
    this.btnBuyBattery100.disabled = !canBuyBattery;
    this.btnDisassembleAllBatteries.disabled = state.batteries < 1;

    const showDrones =
      state.harvesterDronesUnlocked || state.wireDronesUnlocked;
    this.dronesPanel.hidden = !onEarth || !showDrones;

    this.dronePowerRatio.textContent = `${NumberFormatter.formatInteger(
      land.getPowerRatio() * 100,
    )}\u00A0%`;
    this.availableMatter.textContent = `${NumberFormatter.formatCompact(state.availableMatter)}\u00A0g`;
    this.matterRate.textContent = `${NumberFormatter.formatCompact(land.getMatterRate())}\u00A0g/s`;
    this.acquiredMatter.textContent = `${NumberFormatter.formatCompact(state.acquiredMatter)}\u00A0g`;
    this.landWire.textContent = `${NumberFormatter.formatInteger(state.wire)}\u00A0cm`;
    this.landWireRate.textContent = `${NumberFormatter.formatCompact(land.getWireRate())}\u00A0/s`;

    this.harvesterDrones.textContent = NumberFormatter.formatInteger(
      state.harvesterDrones,
    );
    const harvesterCost = land.getNextHarvesterDroneCost();
    this.harvesterDroneCost.textContent =
      NumberFormatter.formatInteger(harvesterCost);
    const canBuyHarvester =
      state.harvesterDronesUnlocked && state.clips >= harvesterCost;
    this.btnBuyHarvesterDrone.disabled = !canBuyHarvester;
    this.btnBuyHarvesterDrone10.disabled = !canBuyHarvester;
    this.btnBuyHarvesterDrone100.disabled = !canBuyHarvester;
    this.btnDisassembleAllHarvesterDrones.disabled = state.harvesterDrones < 1;

    this.wireDrones.textContent = NumberFormatter.formatInteger(
      state.wireDrones,
    );
    const wireCost = land.getNextWireDroneCost();
    this.wireDroneCost.textContent = NumberFormatter.formatInteger(wireCost);
    const canBuyWire = state.wireDronesUnlocked && state.clips >= wireCost;
    this.btnBuyWireDrone.disabled = !canBuyWire;
    this.btnBuyWireDrone10.disabled = !canBuyWire;
    this.btnBuyWireDrone100.disabled = !canBuyWire;
    this.btnDisassembleAllWireDrones.disabled = state.wireDrones < 1;

    this.factoriesPanel.hidden = !onEarth || !state.clipFactoriesUnlocked;
    this.clipFactories.textContent = NumberFormatter.formatInteger(
      state.clipFactories,
    );
    this.factoryClipRate.textContent = `${NumberFormatter.formatCompact(land.getFactoryClipRate())}\u00A0/s`;
    const factoryCost = land.getNextClipFactoryCost();
    this.clipFactoryCost.textContent =
      NumberFormatter.formatInteger(factoryCost);
    const canBuyFactory =
      state.clipFactoriesUnlocked && state.clips >= factoryCost;
    this.btnBuyClipFactory.disabled = !canBuyFactory;
    this.btnBuyClipFactory10.disabled = !canBuyFactory;
    this.btnBuyClipFactory100.disabled = !canBuyFactory;
    this.btnDisassembleAllClipFactories.disabled = state.clipFactories < 1;

    this.swarmPanel.hidden = !onEarth || !state.swarmComputingUnlocked;
    this.swarmSize.textContent = NumberFormatter.formatInteger(
      land.getSwarmSize(),
    );
    this.swarmStatus.textContent = state.swarmComputingUnlocked
      ? SWARM_STATUS_LABELS[land.getSwarmStatus()]
      : "—";
    this.swarmGifts.textContent = NumberFormatter.formatInteger(
      state.swarmGifts,
    );
    if (document.activeElement !== this.swarmSlider) {
      this.swarmSlider.value = String(state.sliderPos);
    }
    this.swarmSliderValue.textContent = `${NumberFormatter.formatInteger(state.sliderPos)}\u00A0%`;

    this.boredomWarning.hidden =
      !state.swarmComputingUnlocked || !state.boredomActive;
    this.btnEntertainSwarm.hidden =
      !state.swarmComputingUnlocked || !state.boredomActive;
    const entertainCost = land.getEntertainSwarmCost();
    this.entertainSwarmCost.textContent =
      NumberFormatter.formatInteger(entertainCost);
    this.btnEntertainSwarm.disabled = state.creativity < entertainCost;

    this.disorgWarning.hidden =
      !state.swarmComputingUnlocked || !state.disorgActive;
    this.btnSynchSwarm.hidden =
      !state.swarmComputingUnlocked || !state.disorgActive;
    const synchCost = land.getSynchSwarmCost();
    this.synchSwarmCost.textContent = NumberFormatter.formatInteger(synchCost);
    this.btnSynchSwarm.disabled = state.yomi < synchCost;
  }
}
