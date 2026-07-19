import type { GameState } from "../state/GameState";
import { Project } from "./Project";
import type { ProjectCost } from "./ProjectCost";

/**
 * Projet configuré par fonctions (visibilité + effet).
 * Évite une sous-classe par projet tout en passant par l'héritage de Project.
 */
export class ConfigurableProject extends Project {
  constructor(
    id: string,
    title: string,
    description: string,
    cost: ProjectCost,
    private readonly visibilityRule: (state: GameState) => boolean,
    private readonly effectHandler: (state: GameState) => void,
  ) {
    super(id, title, description, cost);
  }

  override isVisible(state: GameState): boolean {
    return this.visibilityRule(state);
  }

  protected override applyEffect(state: GameState): void {
    this.effectHandler(state);
  }
}
