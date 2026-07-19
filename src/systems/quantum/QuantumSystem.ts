import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

/**
 * Informatique quantique : puces photoniques + calcul à ops oscillantes.
 * Pendant le calcul, les ops suivent une sinusoïde ; un second clic fige la valeur.
 */
export class QuantumSystem extends GameSystem {
  constructor(state: GameState) {
    super(state);
  }

  getNextPhotonicChipCost(): number {
    return Math.floor(10_000 * Math.pow(1.15, this.state.qChips));
  }

  purchasePhotonicChip(): boolean {
    if (!this.state.quantumUnlocked) return false;
    const cost = this.getNextPhotonicChipCost();
    if (this.state.ops < cost) return false;
    this.state.ops -= cost;
    this.state.qChips += 1;
    return true;
  }

  /** Démarre ou arrête le calcul quantique (ops oscillantes). */
  toggleQuantumCompute(): void {
    if (!this.state.quantumUnlocked || this.state.qChips < 1) return;
    if (this.state.qComputeActive) {
      this.state.qComputeActive = false;
      return;
    }
    this.state.qComputeActive = true;
    this.state.qPhase = 0;
  }

  /** Amplitude 0–1 selon le nombre de puces (plus de puces → pics plus hauts). */
  getOscillationStrength(): number {
    return Math.min(1, 0.25 + this.state.qChips * 0.08);
  }

  override update(deltaMs: number): void {
    const s = this.state;
    if (!s.quantumUnlocked || !s.qComputeActive) return;

    s.qPhase += deltaMs / 1000;
    const capacity = s.memory * 1000;
    const wave = (Math.sin(s.qPhase * 10) + 1) / 2; // 0..1
    const strength = this.getOscillationStrength();
    s.ops = capacity * wave * strength;
  }
}
