import type { GameState } from "../../state/GameState";
import {
  baApplyRate,
  baFromPow,
  baMulFloat,
} from "../../util/BigAmount";
import { GameSystem } from "../core/GameSystem";

/**
 * Constantes phase 2 issues du vrai `globals.js` d'Universal Paperclips
 * (valeurs initiales des variables globales, distinctes de `main.js` qui ne
 * contient que les fonctions) : coûts, taux de production et puissance.
 */
/** Coût de la première ferme (farmLevel = 0). */
const INITIAL_SOLAR_FARM_COST = 10_000_000n;
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
const INITIAL_BATTERY_COST = 1_000_000n;
/** Formule UP du coût des Batteries suivantes : (n+1)^2.54 × 1e7. */
const BATTERY_COST_EXPONENT = 2.54;
const BATTERY_COST_FACTOR = 10_000_000;
/** Trombones produits par Usine à pleine puissance (clips/s) — factoryRate. */
const CLIPS_PER_FACTORY = 1_000_000_000;
/** Coût de la première usine (persisté ensuite via multiplicateurs). */
const INITIAL_CLIP_FACTORY_COST = 100_000_000n;
/** Seuil d'accumulation (giftBits) avant l'octroi d'un cadeau de calcul — giftPeriod. */
const GIFT_PERIOD = 125_000;
/** Seuil d'ennui (boredomLevel) qui bloque les cadeaux tant que non résolu. */
const BOREDOM_THRESHOLD = 30_000;
/** Seuil de désorganisation (disorgCounter) qui bloque les cadeaux tant que non résolu. */
const DISORG_THRESHOLD = 100;
/** Coût (en Yomi) de « Synchroniser le swarm », fixe dans UP (synchCost). */
const SYNCH_SWARM_COST = 5_000;
/** Incrément du coût de « Distraire le swarm » à chaque usage (créativité). */
const ENTERTAIN_SWARM_COST_INCREMENT = 10_000;
/**
 * Gain de performance par seconde tant que l'alimentation est à 100 % et
 * qu'Élan est acquis (momentum dans UP, +0,0001 par tick de 10 ms → +0,01/s).
 * Non plafonné : powMod peut dépasser 1 indéfiniment.
 */
const MOMENTUM_GAIN_PER_SECOND = 0.01;

export type SwarmStatus =
  | "lonely"
  | "noPower"
  | "bored"
  | "disorganized"
  | "active";

/**
 * Multiplicateur appliqué au coût de l'Usine à chaque achat (fcmod dans UP).
 * Contrairement aux fermes/drones/batteries, ce n'est pas une fonction pure
 * du nombre d'usines : c'est un facteur *multiplicatif* appliqué au coût
 * courant, d'où la nécessité de persister `clipFactoryCost` dans l'état.
 */
function getFactoryCostMultiplier(newLevel: number): number {
  if (newLevel > 0 && newLevel < 8) return 11 - newLevel;
  if (newLevel < 13) return 2;
  if (newLevel < 20) return 1.5;
  if (newLevel < 39) return 1.25;
  if (newLevel < 79) return 1.15;
  return 1.1;
}

/**
 * Système de simulation de la phase 2 (Terre) : grid électrique, drones,
 * usines à trombones, informatique en essaim.
 */
export class LandSystem extends GameSystem {
  /** Accumulateurs fractionnaires pour les débits float → bigint. */
  private harvestFrac = 0;
  private wireFrac = 0;
  private factoryFrac = 0;

  constructor(state: GameState) {
    super(state);
  }

  /**
   * Coût (en trombones) de la prochaine Ferme solaire.
   * Formule UP : 10M à 0 ferme, puis Math.pow(solarFarms+1, 2.78)*1e8.
   */
  getNextSolarFarmCost(): bigint {
    return this.solarFarmCostForOwned(this.state.solarFarms);
  }

  private solarFarmCostForOwned(owned: number): bigint {
    if (owned === 0) return INITIAL_SOLAR_FARM_COST;
    return baFromPow(owned + 1, SOLAR_FARM_COST_EXPONENT, SOLAR_FARM_COST_FACTOR);
  }

  /** Coût remboursé en désassemblant une ferme quand `owned` fermes sont détenues. */
  private solarFarmRefundForOwned(owned: number): bigint {
    if (owned <= 0) return 0n;
    return this.solarFarmCostForOwned(owned - 1);
  }

  /**
   * Achète jusqu'à `qty` fermes (arrêt si fonds insuffisants).
   * @returns true si au moins une unité a été achetée.
   */
  purchaseSolarFarm(qty = 1): boolean {
    return this.buyMany(qty, () => {
      const s = this.state;
      if (!s.powerGridUnlocked) return false;
      const cost = this.getNextSolarFarmCost();
      if (s.clips < cost) return false;
      s.clips -= cost;
      s.solarFarms += 1;
      return true;
    });
  }

  disassembleSolarFarm(qty = 1): boolean {
    return this.sellMany(qty, () => {
      const s = this.state;
      if (s.solarFarms < 1) return false;
      s.clips += this.solarFarmRefundForOwned(s.solarFarms);
      s.solarFarms -= 1;
      return true;
    });
  }

  disassembleAllSolarFarms(): boolean {
    return this.disassembleSolarFarm(this.state.solarFarms);
  }

  /** Coût (en trombones) de la prochaine Batterie. Formule UP : (n+1)^2.54 × 1e7. */
  getNextBatteryCost(): bigint {
    return this.batteryCostForOwned(this.state.batteries);
  }

  private batteryCostForOwned(owned: number): bigint {
    if (owned === 0) return INITIAL_BATTERY_COST;
    return baFromPow(owned + 1, BATTERY_COST_EXPONENT, BATTERY_COST_FACTOR);
  }

  private batteryRefundForOwned(owned: number): bigint {
    if (owned <= 0) return 0n;
    return this.batteryCostForOwned(owned - 1);
  }

  purchaseBattery(qty = 1): boolean {
    return this.buyMany(qty, () => {
      const s = this.state;
      if (!s.powerGridUnlocked) return false;
      const cost = this.getNextBatteryCost();
      if (s.clips < cost) return false;
      s.clips -= cost;
      s.batteries += 1;
      return true;
    });
  }

  disassembleBattery(qty = 1): boolean {
    return this.sellMany(qty, () => {
      const s = this.state;
      if (s.batteries < 1) return false;
      s.clips += this.batteryRefundForOwned(s.batteries);
      s.batteries -= 1;
      const capacity = this.getBatteryCapacity();
      if (s.storedPower > capacity) s.storedPower = capacity;
      return true;
    });
  }

  disassembleAllBatteries(): boolean {
    return this.disassembleBattery(this.state.batteries);
  }

  /** Capacité totale de stockage des batteries (MW·s). */
  getBatteryCapacity(): number {
    return this.state.batteries * BATTERY_CAPACITY_PER_UNIT;
  }

  /** Coût (en trombones) du prochain Drone récolteur. */
  getNextHarvesterDroneCost(): bigint {
    return baFromPow(
      this.state.harvesterDrones + 1,
      DRONE_COST_EXPONENT,
      DRONE_COST_BASE,
    );
  }

  private harvesterRefundForOwned(owned: number): bigint {
    if (owned <= 0) return 0n;
    return baFromPow(owned, DRONE_COST_EXPONENT, DRONE_COST_BASE);
  }

  purchaseHarvesterDrone(qty = 1): boolean {
    return this.buyMany(qty, () => {
      const s = this.state;
      if (!s.harvesterDronesUnlocked) return false;
      const cost = this.getNextHarvesterDroneCost();
      if (s.clips < cost) return false;
      s.clips -= cost;
      s.harvesterDrones += 1;
      return true;
    });
  }

  disassembleHarvesterDrone(qty = 1): boolean {
    return this.sellMany(qty, () => {
      const s = this.state;
      if (s.harvesterDrones < 1) return false;
      s.clips += this.harvesterRefundForOwned(s.harvesterDrones);
      s.harvesterDrones -= 1;
      return true;
    });
  }

  disassembleAllHarvesterDrones(): boolean {
    return this.disassembleHarvesterDrone(this.state.harvesterDrones);
  }

  /** Coût (en trombones) du prochain Drone fileur. */
  getNextWireDroneCost(): bigint {
    return baFromPow(
      this.state.wireDrones + 1,
      DRONE_COST_EXPONENT,
      DRONE_COST_BASE,
    );
  }

  private wireDroneRefundForOwned(owned: number): bigint {
    if (owned <= 0) return 0n;
    return baFromPow(owned, DRONE_COST_EXPONENT, DRONE_COST_BASE);
  }

  purchaseWireDrone(qty = 1): boolean {
    return this.buyMany(qty, () => {
      const s = this.state;
      if (!s.wireDronesUnlocked) return false;
      const cost = this.getNextWireDroneCost();
      if (s.clips < cost) return false;
      s.clips -= cost;
      s.wireDrones += 1;
      return true;
    });
  }

  disassembleWireDrone(qty = 1): boolean {
    return this.sellMany(qty, () => {
      const s = this.state;
      if (s.wireDrones < 1) return false;
      s.clips += this.wireDroneRefundForOwned(s.wireDrones);
      s.wireDrones -= 1;
      return true;
    });
  }

  disassembleAllWireDrones(): boolean {
    return this.disassembleWireDrone(this.state.wireDrones);
  }

  /** Coût (en trombones) de la prochaine Usine (valeur persistée, formule UP non fermée). */
  getNextClipFactoryCost(): bigint {
    return this.state.clipFactoryCost;
  }

  purchaseClipFactory(qty = 1): boolean {
    return this.buyMany(qty, () => {
      const s = this.state;
      if (!s.clipFactoriesUnlocked) return false;
      const cost = s.clipFactoryCost;
      if (s.clips < cost) return false;
      s.clips -= cost;
      s.clipFactories += 1;
      s.clipFactoryCost = baMulFloat(
        s.clipFactoryCost,
        getFactoryCostMultiplier(s.clipFactories),
      );
      return true;
    });
  }

  disassembleClipFactory(qty = 1): boolean {
    return this.sellMany(qty, () => {
      const s = this.state;
      if (s.clipFactories < 1) return false;
      const multiplier = getFactoryCostMultiplier(s.clipFactories);
      const lastPaid = baMulFloat(s.clipFactoryCost, 1 / multiplier);
      s.clipFactoryCost = lastPaid;
      s.clips += lastPaid;
      s.clipFactories -= 1;
      if (s.clipFactories === 0) {
        s.clipFactoryCost = INITIAL_CLIP_FACTORY_COST;
      }
      return true;
    });
  }

  disassembleAllClipFactories(): boolean {
    return this.disassembleClipFactory(this.state.clipFactories);
  }

  /** Taille de l'essaim (nombre total de drones), base de la génération de cadeaux. */
  getSwarmSize(): number {
    return Math.floor(this.state.harvesterDrones + this.state.wireDrones);
  }

  /**
   * Statut UP de l'essaim pour l'UI.
   * Priorité : lonely → noPower → bored → disorganized → active.
   */
  getSwarmStatus(): SwarmStatus {
    const s = this.state;
    if (this.getSwarmSize() < 2) return "lonely";
    if (s.powMod <= 0) return "noPower";
    if (s.boredomActive) return "bored";
    if (s.disorgActive) return "disorganized";
    return "active";
  }

  /** Positionne le curseur Travail (0) ⟷ Réflexion (100), révélé par Informatique en essaim. */
  setSliderPos(value: number): void {
    if (!this.state.swarmComputingUnlocked) return;
    this.state.sliderPos = Math.min(100, Math.max(0, Math.round(value)));
  }

  /** Coût (en Yomi) de « Synchroniser le swarm » (résout la désorganisation). */
  getSynchSwarmCost(): number {
    return SYNCH_SWARM_COST;
  }

  synchronizeSwarm(): boolean {
    const s = this.state;
    if (!s.swarmComputingUnlocked) return false;
    if (s.yomi < SYNCH_SWARM_COST) return false;
    s.yomi -= SYNCH_SWARM_COST;
    s.disorgActive = false;
    s.disorgCounter = 0;
    return true;
  }

  /** Coût (en créativité) de « Distraire le swarm » (résout l'ennui), augmente à chaque usage. */
  getEntertainSwarmCost(): number {
    return this.state.entertainSwarmCost;
  }

  entertainSwarm(): boolean {
    const s = this.state;
    if (!s.swarmComputingUnlocked) return false;
    if (s.creativity < s.entertainSwarmCost) return false;
    s.creativity -= s.entertainSwarmCost;
    s.entertainSwarmCost += ENTERTAIN_SWARM_COST_INCREMENT;
    s.boredomActive = false;
    s.boredomLevel = 0;
    return true;
  }

  /**
   * Mécanique du swarm (fidèle à UP, converti en taux continus par seconde
   * depuis les incréments par tick de 10 ms de l'original) : ennui,
   * désorganisation, et génération de cadeaux de calcul.
   */
  private updateSwarm(dt: number): void {
    const s = this.state;
    const d = this.getSwarmSize();

    if (s.availableMatter <= 0n && d >= 1) {
      s.boredomLevel = Math.min(BOREDOM_THRESHOLD, s.boredomLevel + 100 * dt);
    } else if (s.boredomLevel > 0) {
      s.boredomLevel = Math.max(0, s.boredomLevel - 100 * dt);
    }
    if (s.boredomLevel >= BOREDOM_THRESHOLD) {
      s.boredomActive = true;
    }

    const droneRatio =
      Math.max(s.harvesterDrones + 1, s.wireDrones + 1) /
      Math.min(s.harvesterDrones + 1, s.wireDrones + 1);
    if (droneRatio > 1.5) {
      s.disorgCounter += Math.min(droneRatio / 100, 1) * dt;
    } else if (s.disorgCounter > 1) {
      s.disorgCounter = Math.max(0, s.disorgCounter - 1 * dt);
    }
    if (s.disorgCounter >= DISORG_THRESHOLD) {
      s.disorgActive = true;
    }

    // Pas de cadeau tant que le swarm est ennuyé, désorganisé, à l'arrêt
    // (panne de courant) ou trop petit (statuts UP « Lonely »/« NO RESPONSE »).
    if (s.boredomActive || s.disorgActive || s.powMod <= 0 || d < 2) return;

    const giftRate = Math.log(d) * s.sliderPos; // giftBits par seconde
    s.giftBits += giftRate * dt;

    while (s.giftBits >= GIFT_PERIOD) {
      const gift = Math.max(1, Math.round(Math.log10(d) * (s.sliderPos / 100)));
      s.swarmGifts += gift;
      s.giftBits -= GIFT_PERIOD;
    }
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
  getWorkFactor(): number {
    return (200 - this.state.sliderPos) / 100;
  }

  /**
   * Multiplicateur « boost » (dbsth/dbstw/fbst dans UP) : reste à 1 tant que
   * Cohésion adverse / Chaîne auto-correctrice ne sont pas acquises. Une
   * fois actif, la production devient quadratique en nombre d'unités
   * (chaque unité ajoutée multiplie la production de toutes les autres).
   */
  private getBoostMultiplier(boost: number, count: number): number {
    return boost > 1 ? boost * count : 1;
  }

  /** Débit de récolte (g/s) aux conditions courantes. */
  getMatterRate(): number {
    const s = this.state;
    if (!s.harvesterDronesUnlocked || s.harvesterDrones <= 0) return 0;
    return (
      s.harvesterDrones *
      this.getBoostMultiplier(s.droneBoost, s.harvesterDrones) *
      MATTER_PER_HARVESTER_DRONE *
      s.droneEfficiencyBonus *
      s.powMod *
      this.getWorkFactor()
    );
  }

  /** Débit de filage (pouces/s) aux conditions courantes. */
  getWireRate(): number {
    const s = this.state;
    if (!s.wireDronesUnlocked || s.wireDrones <= 0) return 0;
    return (
      s.wireDrones *
      this.getBoostMultiplier(s.droneBoost, s.wireDrones) *
      WIRE_PER_WIRE_DRONE *
      s.droneEfficiencyBonus *
      s.powMod *
      this.getWorkFactor()
    );
  }

  /** Débit des usines (trombones/s) aux conditions courantes. */
  getFactoryClipRate(): number {
    const s = this.state;
    if (!s.clipFactoriesUnlocked || s.clipFactories <= 0) return 0;
    return (
      s.clipFactories *
      this.getBoostMultiplier(s.factoryBoost, s.clipFactories) *
      CLIPS_PER_FACTORY *
      s.factoryEfficiencyBonus *
      s.powMod
    );
  }

  /**
   * Remet l'infrastructure terrestre à zéro (effet Exploration spatiale).
   * Conserve les déblocages et les cadeaux d'essaim.
   */
  dismantleEarthInfrastructure(): void {
    const s = this.state;
    s.solarFarms = 0;
    s.batteries = 0;
    s.storedPower = 0;
    s.power = 0;
    s.harvesterDrones = 0;
    s.wireDrones = 0;
    s.clipFactories = 0;
    s.clipFactoryCost = INITIAL_CLIP_FACTORY_COST;
    s.acquiredMatter = 0n;
    s.wire = 0n;
    s.powMod = 0;
    s.sliderPos = 0;
    s.boredomLevel = 0;
    s.boredomActive = false;
    s.disorgCounter = 0;
    s.disorgActive = false;
    s.giftBits = 0;
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
      if (s.momentumUnlocked) s.powMod += MOMENTUM_GAIN_PER_SECOND * dt;
    } else if (demand > 0) {
      const deficitEnergy = (demand - supply) * dt;
      const drawnFromBattery = Math.min(deficitEnergy, s.storedPower);
      s.storedPower -= drawnFromBattery;
      const unmetEnergy = deficitEnergy - drawnFromBattery;
      if (unmetEnergy > 0) {
        s.powMod = Math.max(0, 1 - unmetEnergy / (demand * dt));
      } else {
        s.powMod = 1;
        if (s.momentumUnlocked) s.powMod += MOMENTUM_GAIN_PER_SECOND * dt;
      }
    } else {
      s.powMod = 1;
    }

    if (s.harvesterDronesUnlocked) {
      const harvested = baApplyRate(
        s.availableMatter,
        this.getMatterRate(),
        dt,
        this.harvestFrac,
      );
      s.availableMatter = harvested.stock;
      s.acquiredMatter += harvested.moved;
      this.harvestFrac = harvested.frac;
    }

    if (s.wireDronesUnlocked) {
      // Hypothèse (non documentée telle quelle par le wiki) : 1 g de matière
      // acquise produit 1 pouce de fil, la matière acquise est donc bien la
      // ressource limitante de cette conversion.
      const converted = baApplyRate(
        s.acquiredMatter,
        this.getWireRate(),
        dt,
        this.wireFrac,
      );
      s.acquiredMatter = converted.stock;
      s.wire += converted.moved;
      this.wireFrac = converted.frac;
    }

    if (s.clipFactoriesUnlocked) {
      const produced = baApplyRate(
        s.wire,
        this.getFactoryClipRate(),
        dt,
        this.factoryFrac,
      );
      s.wire = produced.stock;
      s.clips += produced.moved;
      s.unsold += produced.moved;
      this.factoryFrac = produced.frac;
    }

    if (s.swarmComputingUnlocked) {
      this.updateSwarm(dt);
    }
  }

  private buyMany(qty: number, buyOne: () => boolean): boolean {
    const n = Math.max(0, Math.floor(qty));
    let bought = 0;
    for (let i = 0; i < n; i += 1) {
      if (!buyOne()) break;
      bought += 1;
    }
    return bought > 0;
  }

  private sellMany(qty: number, sellOne: () => boolean): boolean {
    const n = Math.max(0, Math.floor(qty));
    let sold = 0;
    for (let i = 0; i < n; i += 1) {
      if (!sellOne()) break;
      sold += 1;
    }
    return sold > 0;
  }
}
