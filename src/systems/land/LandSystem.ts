import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

/**
 * Constantes d'équilibrage de la phase 2. Le jeu original ne publie pas ses
 * formules internes de simulation (cf. réserve du plan) — ces valeurs sont
 * un équilibrage original, cohérent avec la progression documentée, pas une
 * rétro-ingénierie exacte.
 */
const BASE_SOLAR_FARM_COST = 1_000_000;
const SOLAR_FARM_COST_GROWTH = 1.05;
/** Puissance générée par ferme solaire (MW). */
const POWER_PER_SOLAR_FARM = 100;

/**
 * Système de simulation de la phase 2 (Terre) : grid électrique, drones,
 * usines à trombones, informatique en essaim. Rempli incrémentalement au
 * fil des étapes du plan phase 2.
 */
export class LandSystem extends GameSystem {
  constructor(state: GameState) {
    super(state);
  }

  /** Coût (en trombones) de la prochaine Ferme solaire. */
  getNextSolarFarmCost(): number {
    return Math.floor(
      BASE_SOLAR_FARM_COST *
        Math.pow(SOLAR_FARM_COST_GROWTH, this.state.solarFarms),
    );
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
