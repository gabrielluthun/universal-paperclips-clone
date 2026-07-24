export interface MarketFields {
  price: number;
  marketingLvl: number;
  marketingEffectiveness: number;
}

export function createMarketFields(): MarketFields {
  return {
    price: 0.25,
    marketingLvl: 1,
    marketingEffectiveness: 1,
  };
}
