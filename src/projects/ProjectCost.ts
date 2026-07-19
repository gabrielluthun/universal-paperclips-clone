import type { GameState } from "../state/GameState";

export class ProjectCost {
  constructor(
    readonly ops?: number,
    readonly creativity?: number,
    readonly trust?: number,
    readonly funds?: number,
  ) {}

  static of(partial: {
    ops?: number;
    creativity?: number;
    trust?: number;
    funds?: number;
  }): ProjectCost {
    return new ProjectCost(
      partial.ops,
      partial.creativity,
      partial.trust,
      partial.funds,
    );
  }

  canAfford(state: GameState): boolean {
    if (this.ops !== undefined && state.ops < this.ops) return false;
    if (this.creativity !== undefined && state.creativity < this.creativity) {
      return false;
    }
    if (this.trust !== undefined && state.trust < this.trust) return false;
    if (this.funds !== undefined && state.funds < this.funds) return false;
    return true;
  }

  /** Débite le coût depuis l'état du joueur. */
  deductFrom(state: GameState): void {
    if (this.ops !== undefined) state.ops -= this.ops;
    if (this.creativity !== undefined) state.creativity -= this.creativity;
    if (this.trust !== undefined) state.trust -= this.trust;
    if (this.funds !== undefined) state.funds -= this.funds;
  }

  /** Texte du coût pour l'interface (ex. « 750 ops · 50 créat. »). */
  toDisplayString(): string {
    const parts: string[] = [];
    if (this.ops !== undefined) {
      parts.push(`${this.ops.toLocaleString("fr-FR")} ops`);
    }
    if (this.creativity !== undefined) {
      parts.push(`${this.creativity.toLocaleString("fr-FR")} créat.`);
    }
    if (this.trust !== undefined) {
      parts.push(`${this.trust.toLocaleString("fr-FR")} confiance`);
    }
    if (this.funds !== undefined) {
      parts.push(
        `${this.funds.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} $`,
      );
    }
    return parts.join(" · ");
  }
}
