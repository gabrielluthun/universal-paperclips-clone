import type { GameState } from "../state/GameState";
import { Project } from "./Project";
import type { ProjectCost } from "./ProjectCost";

export interface ConfigurableProjectOptions {
  /** Coût dynamique (ex. jetons de goodwill qui doublent). */
  resolveCost?: (state: GameState) => ProjectCost;
  /** Si true, le projet reste achetable après activation. */
  repeatable?: boolean;
}

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
    private readonly options: ConfigurableProjectOptions = {},
  ) {
    super(id, title, description, cost);
  }

  override getCost(state: GameState): ProjectCost {
    return this.options.resolveCost?.(state) ?? this.cost;
  }

  override marksAsCompleted(): boolean {
    return !this.options.repeatable;
  }

  override isVisible(state: GameState): boolean {
    return this.visibilityRule(state);
  }

  protected override applyEffect(state: GameState): void {
    this.effectHandler(state);
  }
}
