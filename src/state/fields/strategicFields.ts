export interface StrategicFields {
  strategicModelingUnlocked: boolean;
  /** Stratégies débloquées (RANDOM au départ du projet). */
  unlockedStrategyIds: string[];
  selectedStrategyId: string;
  /** Coût ops d'un tournoi (1000 × nombre de stratégies). */
  tourneyCost: number;
  /** Multiplicateur de Yomi (×2 après Théorie de l'esprit, plus tard). */
  yomiBoost: number;
  tourneyPayoff: { aa: number; ab: number; ba: number; bb: number } | null;
  tourneyChoiceA: string;
  tourneyChoiceB: string;
  tourneyResults: { id: string; name: string; score: number }[];
  lastTourneyYomiGained: number;
}

export function createStrategicFields(): StrategicFields {
  return {
    strategicModelingUnlocked: false,
    unlockedStrategyIds: ["RANDOM"],
    selectedStrategyId: "RANDOM",
    tourneyCost: 1000,
    yomiBoost: 1,
    tourneyPayoff: null,
    tourneyChoiceA: "",
    tourneyChoiceB: "",
    tourneyResults: [],
    lastTourneyYomiGained: 0,
  };
}
