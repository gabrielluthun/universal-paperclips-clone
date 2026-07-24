import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

export class ComputeSystem extends GameSystem {
  constructor(state: GameState) {
    super(state);
  }

  /** Capacité max d'opérations = mémoire × 1000. */
  getOperationsCapacity(): number {
    return this.state.memory * 1000;
  }

  /** Points de confiance encore disponibles à allouer. */
  getAvailableTrustPoints(): number {
    return this.state.trust - this.state.processors - this.state.memory;
  }

  /**
   * Accorde +1 confiance pour chaque palier Fibonacci × 1000 franchi
   * (3 000, 5 000, 8 000…).
   */
  grantTrustForProductionMilestones(): void {
    const s = this.state;
    while (s.clips >= BigInt(s.nextTrust)) {
      s.trust += 1;
      const next = s.trustFibA + s.trustFibB;
      s.trustFibA = s.trustFibB;
      s.trustFibB = next;
      s.nextTrust = s.trustFibB * 1000;
    }
  }

  allocateProcessor(): boolean {
    if (this.getAvailableTrustPoints() < 1) return false;
    this.state.processors += 1;
    return true;
  }

  allocateMemory(): boolean {
    if (this.getAvailableTrustPoints() < 1) return false;
    this.state.memory += 1;
    return true;
  }

  /** Ops / s = 10 × processeurs`. */
  getOperationsPerSecond(): number {
    return this.state.processors * 10;
  }

  /**
   * Créativité / s :
   * log10(processeurs) × processeurs^1,1 + processeurs − 1.
   */
  getCreativityPerSecond(): number {
    if (!this.state.creativityUnlocked) return 0;
    const p = this.state.processors;
    return Math.log10(p) * Math.pow(p, 1.1) + p - 1;
  }

  /** Génère opérations puis, au plafond, créativité. */
  override update(deltaMs: number): void {
    const s = this.state;
    // Pendant le calcul quantique, les ops sont pilotées par QuantumSystem.
    if (s.qComputeActive) return;

    const capacity = this.getOperationsCapacity();
    const dt = deltaMs / 1000;
    s.ops = Math.min(capacity, s.ops + this.getOperationsPerSecond() * dt);

    if (s.ops >= capacity && capacity > 0) {
      s.creativityUnlocked = true;
      s.creativity += this.getCreativityPerSecond() * dt;
    }
  }
}
