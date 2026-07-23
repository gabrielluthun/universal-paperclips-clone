import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

/**
 * Système de simulation de la phase 2 (Terre) : grid électrique, drones,
 * usines à trombones, informatique en essaim. Rempli incrémentalement au
 * fil des étapes du plan phase 2 ; ne fait rien tant qu'aucune de ces
 * mécaniques n'est encore câblée.
 */
export class LandSystem extends GameSystem {
  constructor(state: GameState) {
    super(state);
  }

  override update(_deltaMs: number): void {
    // Rempli au fil des étapes suivantes (énergie, drones, usines...).
  }
}
