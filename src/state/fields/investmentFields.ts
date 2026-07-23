export interface InvestmentFields {
  investmentsUnlocked: boolean;
  /** Fonds placés sur les marchés. */
  investmentFunds: number;
  /** Niveau du moteur de trading (1+). */
  investEngineLevel: number;
  /** Risque : 1 = faible, 2 = moyen, 3 = élevé. */
  investRisk: number;
  /** Yomi (gagné aux tournois, dépensé pour le moteur). */
  yomi: number;
  /** Dernière variation boursière affichée ($). */
  lastStockDelta: number;
}

export function createInvestmentFields(): InvestmentFields {
  return {
    investmentsUnlocked: false,
    investmentFunds: 0,
    investEngineLevel: 1,
    investRisk: 1,
    yomi: 0,
    lastStockDelta: 0,
  };
}
