export interface ProductionFields {
  wire: number;
  wirePerSpool: number;
  wireCost: number;
  wireBasePrice: number;
  wirePriceCounter: number;
  autoClippers: number;
  autoClippersUnlocked: boolean;
  clipperBonus: number;
  autoClipFraction: number;
  megaClippers: number;
  megaClippersUnlocked: boolean;
  megaClipperBonus: number;
  autoWire: boolean;
  /**
   * Coût du prochain « Autre jeton de goodwill » ($).
   * Double à chaque achat, plafonné à 512 M$.
   */
  goodwillTokenCost: number;
}

export function createProductionFields(): ProductionFields {
  return {
    wire: 1000,
    wirePerSpool: 1000,
    wireCost: 20,
    wireBasePrice: 20,
    wirePriceCounter: 0,
    autoClippers: 0,
    autoClippersUnlocked: false,
    clipperBonus: 1,
    autoClipFraction: 0,
    megaClippers: 0,
    megaClippersUnlocked: false,
    megaClipperBonus: 1,
    autoWire: false,
    goodwillTokenCost: 1_000_000,
  };
}
