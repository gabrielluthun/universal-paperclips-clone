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

  override update(deltaMs: number): void {
    const s = this.state;
    if (!s.powerGridUnlocked) return;

    const dt = deltaMs / 1000;
    s.power = this.getPowerOutput();
    s.powerBanked += s.power * dt;
  }
}
