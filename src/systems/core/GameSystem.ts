import type { GameState } from "../../state/GameState";

/** Classe de base de tous les systèmes de simulation. */
export abstract class GameSystem {
  protected constructor(protected readonly state: GameState) {}

  /** Fait avancer la simulation de `deltaMs` millisecondes. */
  abstract update(deltaMs: number): void;
}
