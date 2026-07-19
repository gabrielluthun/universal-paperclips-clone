import type { GameState } from "../state/GameState";
import type { ProjectCost } from "./ProjectCost";

/**
 * Projet achetable. Les sous-classes définissent visibilité et effet.
 */
export abstract class Project {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly cost: ProjectCost,
  ) {}

  /** Le projet est-il proposé au joueur dans l'état actuel ? */
  abstract isVisible(state: GameState): boolean;

  /** Effet concret du projet — implémenté par chaque sous-classe. */
  protected abstract applyEffect(state: GameState): void;

  /** Applique l'effet après paiement (point d'entrée public). */
  applyEffectTo(state: GameState): void {
    this.applyEffect(state);
  }
}
