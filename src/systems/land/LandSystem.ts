import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

/**
 * Constantes phase 2 issues de Universal Paperclips
 */
/** Coût de la première ferme (farmLevel = 0). */
const INITIAL_SOLAR_FARM_COST = 10_000_000;
/** Exposant et facteur de la formule UP : (n+1)^2.78 × 1e8 pour n ≥ 1. */
const SOLAR_FARM_COST_EXPONENT = 2.78;
const SOLAR_FARM_COST_FACTOR = 100_000_000;
/** Puissance générée par ferme solaire (MW) — farmRate = 50 dans UP. */
const POWER_PER_SOLAR_FARM = 50;
/** Consommation électrique par drone (MW), qu'il soit récolteur ou fileur. */
const POWER_PER_DRONE = 1;
/** Consommation électrique par Usine (MW) — factoryPowerRate = 200 dans UP. */
const POWER_PER_FACTORY = 200;
/** Matière récoltée par Drone récolteur à pleine puissance (g/s) — harvesterRate. */
const MATTER_PER_HARVESTER_DRONE = 26_180_337;
/** Fil produit par Drone fileur à pleine puissance (pouces/s) — wireDroneRate. */
const WIRE_PER_WIRE_DRONE = 16_180_339;
/**
 * Coût des drones (récolteurs et fileurs, même formule dans UP) :
 * 1M, 4.76M, 11.84M… = 1_000_000 × n^2.25, n = nombre de drones après achat.
 */
const DRONE_COST_BASE = 1_000_000;
const DRONE_COST_EXPONENT = 2.25;
/** Capacité de stockage par Batterie (MW·s) — batterySize = 10000 dans UP. */
const BATTERY_CAPACITY_PER_UNIT = 10_000;
/** Coût de la première Batterie. */
const INITIAL_BATTERY_COST = 1_000_000;
/** Formule UP du coût des Batteries suivantes : (n+1)^2.54 × 1e7. */
const BATTERY_COST_EXPONENT = 2.54;
const BATTERY_COST_FACTOR = 10_000_000;

/**
 * Système de simulation de la phase 2 (Terre) : grid électrique, drones,
 * usines à trombones, informatique en essaim. Rempli incrémentalement au
 * fil des étapes du plan phase 2.
 */
export class LandSystem extends GameSystem {
  constructor(state: GameState) {
    super(state);
  }

  /**
   * Coût (en trombones) de la prochaine Ferme solaire.
   * Formule UP : 10M à 0 ferme, puis Math.pow(solarFarms+1, 2.78)*1e8.
   */
  getNextSolarFarmCost(): number {
    const owned = this.state.solarFarms;
    if (owned === 0) return INITIAL_SOLAR_FARM_COST;
    return Math.pow(owned + 1, SOLAR_FARM_COST_EXPONENT) * SOLAR_FARM_COST_FACTOR;
  }

  purchaseSolarFarm(): boolean {
    const s = this.state;
    if (!s.powerGridUnlocked) return false;
    const cost = this.getNextSolarFarmCost();
    if (s.clips < cost) return false;
    s.clips -= cost;
    s.solarFarms += 1;
    return true;
  }

  /** Coût (en trombones) de la prochaine Batterie. Formule UP : (n+1)^2.54 × 1e7. */
  getNextBatteryCost(): number {
    const owned = this.state.batteries;
    if (owned === 0) return INITIAL_BATTERY_COST;
    return Math.pow(owned + 1, BATTERY_COST_EXPONENT) * BATTERY_COST_FACTOR;
  }

  purchaseBattery(): boolean {
    const s = this.state;
    if (!s.powerGridUnlocked) return false;
    const cost = this.getNextBatteryCost();
    if (s.clips < cost) return false;
    s.clips -= cost;
    s.batteries += 1;
    return true;
  }

  /** Capacité totale de stockage des batteries (MW·s). */
  getBatteryCapacity(): number {
    return this.state.batteries * BATTERY_CAPACITY_PER_UNIT;
  }

  /** Coût (en trombones) du prochain Drone récolteur. */
  getNextHarvesterDroneCost(): number {
    return Math.round(
      Math.pow(this.state.harvesterDrones + 1, DRONE_COST_EXPONENT) * DRONE_COST_BASE,
    );
  }

  purchaseHarvesterDrone(): boolean {
    const s = this.state;
    if (!s.harvesterDronesUnlocked) return false;
    const cost = this.getNextHarvesterDroneCost();
    if (s.clips < cost) return false;
    s.clips -= cost;
    s.harvesterDrones += 1;
    return true;
  }

  /** Coût (en trombones) du prochain Drone fileur. */
  getNextWireDroneCost(): number {
    return Math.round(
      Math.pow(this.state.wireDrones + 1, DRONE_COST_EXPONENT) * DRONE_COST_BASE,
    );
  }

  purchaseWireDrone(): boolean {
    const s = this.state;
    if (!s.wireDronesUnlocked) return false;
    const cost = this.getNextWireDroneCost();
    if (s.clips < cost) return false;
    s.clips -= cost;
    s.wireDrones += 1;
    return true;
  }

  /** Puissance électrique instantanée générée par les Fermes solaires (MW). */
  getPowerOutput(): number {
    return this.state.solarFarms * POWER_PER_SOLAR_FARM;
  }

  /** Puissance requise pour faire tourner tous les drones et usines à pleine capacité (MW). */
  getPowerDemand(): number {
    const s = this.state;
    return (
      (s.harvesterDrones + s.wireDrones) * POWER_PER_DRONE +
      s.clipFactories * POWER_PER_FACTORY
    );
  }

  /**
   * Ratio de performance instantané pour l'affichage (0 à 1), sans effet de
   * bord : approxime `s.powMod` en supposant que la batterie peut couvrir
   * intégralement un déficit tant qu'elle n'est pas vide. Le calcul exact,
   * qui dépend du temps écoulé, se fait dans {@link update}.
   */
  getPowerRatio(): number {
    const supply = this.getPowerOutput();
    const demand = this.getPowerDemand();
    if (demand <= 0) return 1;
    if (supply >= demand) return 1;
    const deficit = demand - supply;
    const coveredByBattery = Math.min(deficit, this.state.storedPower);
    return Math.min(1, (supply + coveredByBattery) / demand);
  }

  /**
   * Facteur Travail/Réflexion appliqué à la récolte et au filage (formule
   * UP : (200-sliderPos)/100). sliderPos reste à 0 (donc facteur ×2) tant
   * que l'Informatique en essaim n'est pas débloquée.
   */
  private getWorkFactor(): number {
    return (200 - this.state.sliderPos) / 100;
  }

  override update(deltaMs: number): void {
    const s = this.state;
    if (!s.powerGridUnlocked) return;

    const dt = deltaMs / 1000;
    const supply = this.getPowerOutput();
    const demand = this.getPowerDemand();
    s.power = supply;

    // Batterie tampon fidèle à UP : un déficit ponctuel est d'abord comblé
    // par l'énergie stockée ; la performance (powMod) ne chute que si la
    // batterie est elle aussi épuisée.
    if (supply >= demand) {
      const surplusEnergy = (supply - demand) * dt;
      const capacity = this.getBatteryCapacity();
      s.storedPower = Math.min(capacity, s.storedPower + surplusEnergy);
      if (s.powMod < 1) s.powMod = 1;
    } else if (demand > 0) {
      const deficitEnergy = (demand - supply) * dt;
      const drawnFromBattery = Math.min(deficitEnergy, s.storedPower);
      s.storedPower -= drawnFromBattery;
      const unmetEnergy = deficitEnergy - drawnFromBattery;
      s.powMod = unmetEnergy > 0 ? Math.max(0, 1 - unmetEnergy / (demand * dt)) : 1;
    } else {
      s.powMod = 1;
    }

    const workFactor = this.getWorkFactor();

    if (s.harvesterDronesUnlocked) {
      const harvestRate =
        s.harvesterDrones *
        MATTER_PER_HARVESTER_DRONE *
        s.droneEfficiencyBonus *
        s.powMod *
        workFactor;
      const harvested = Math.min(harvestRate * dt, s.availableMatter);
      s.availableMatter -= harvested;
      s.acquiredMatter += harvested;
    }

    if (s.wireDronesUnlocked) {
      // Hypothèse (non documentée telle quelle par le wiki) : 1 g de matière
      // acquise produit 1 pouce de fil, la matière acquise est donc bien la
      // ressource limitante de cette conversion.
      const wireRate =
        s.wireDrones *
        WIRE_PER_WIRE_DRONE *
        s.droneEfficiencyBonus *
        s.powMod *
        workFactor;
      const converted = Math.min(wireRate * dt, s.acquiredMatter);
      s.acquiredMatter -= converted;
      s.wire += converted;
    }
  }
}
