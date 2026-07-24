import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

/**
 * Constantes phase 2 issues du source original Universal Paperclips
 * (`globals.js` / `main.js`) : coûts et production électrique documentés.
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
/** Matière récoltée par Drone récolteur à pleine puissance (g/s), valeur « de base » UP. */
const MATTER_PER_HARVESTER_DRONE = 5_235_700_000;

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

  /** Puissance électrique instantanée générée par les Fermes solaires (MW). */
  getPowerOutput(): number {
    return this.state.solarFarms * POWER_PER_SOLAR_FARM;
  }

  /** Puissance requise pour faire tourner tous les drones à pleine capacité (MW). */
  getPowerDemand(): number {
    const s = this.state;
    return (s.harvesterDrones + s.wireDrones) * POWER_PER_DRONE;
  }

  /**
   * Fraction de la puissance requise réellement disponible (0 à 1). En
   * dessous de 1, les drones tournent au ralenti faute d'électricité.
   */
  getPowerRatio(): number {
    const demand = this.getPowerDemand();
    if (demand <= 0) return 1;
    return Math.min(1, this.getPowerOutput() / demand);
  }

  override update(deltaMs: number): void {
    const s = this.state;
    if (!s.powerGridUnlocked) return;

    const dt = deltaMs / 1000;
    s.power = this.getPowerOutput();

    const powerRatio = this.getPowerRatio();
    const demand = this.getPowerDemand();
    // Le surplus (puissance produite - consommée par les drones) s'accumule
    // dans les batteries ; en dessous, elles ne se déchargent pas (pas de
    // stockage négatif, seule la récolte ralentit).
    s.powerBanked += Math.max(0, s.power - demand) * dt;

    if (s.harvesterDronesUnlocked) {
      const harvestRate =
        s.harvesterDrones * MATTER_PER_HARVESTER_DRONE * s.droneEfficiencyBonus * powerRatio;
      const harvested = Math.min(harvestRate * dt, s.availableMatter);
      s.availableMatter -= harvested;
      s.acquiredMatter += harvested;
    }
  }
}
