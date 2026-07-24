export interface QuantumFields {
  quantumUnlocked: boolean;
  /** Puces photoniques. */
  qChips: number;
  /** Calcul quantique en cours (ops oscillantes). */
  qComputeActive: boolean;
  /** Phase de l'oscillation quantique. */
  qPhase: number;
}

export function createQuantumFields(): QuantumFields {
  return {
    quantumUnlocked: false,
    qChips: 0,
    qComputeActive: false,
    qPhase: 0,
  };
}
