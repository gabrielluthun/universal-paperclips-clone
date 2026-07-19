import type { GameState } from "../state";
import { computeDemand, marketingCost, PRICE_MIN } from "../systems/market";
import { autoClipperCost } from "../systems/production";
import { formatInt, formatMoney } from "../util/format";

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Élément introuvable : #${id}`);
  return node as T;
}

const dom = {
  clips: () => el<HTMLSpanElement>("clips"),
  funds: () => el<HTMLSpanElement>("funds"),
  avgRev: () => el<HTMLSpanElement>("avg-rev"),
  unsold: () => el<HTMLSpanElement>("unsold"),
  price: () => el<HTMLSpanElement>("price"),
  demand: () => el<HTMLSpanElement>("demand"),
  marketingLvl: () => el<HTMLSpanElement>("marketing-lvl"),
  marketingCost: () => el<HTMLSpanElement>("marketing-cost"),
  clipRate: () => el<HTMLSpanElement>("clip-rate"),
  wire: () => el<HTMLSpanElement>("wire"),
  wireCost: () => el<HTMLSpanElement>("wire-cost"),
  autoClippers: () => el<HTMLSpanElement>("autoclippers"),
  autoClipperCost: () => el<HTMLSpanElement>("autoclipper-cost"),
  autoClipperBlock: () => el<HTMLDivElement>("autoclipper-block"),
  btnMake: () => el<HTMLButtonElement>("btn-make"),
  btnBuyWire: () => el<HTMLButtonElement>("btn-buy-wire"),
  btnPriceDown: () => el<HTMLButtonElement>("btn-price-down"),
  btnPriceUp: () => el<HTMLButtonElement>("btn-price-up"),
  btnMarketing: () => el<HTMLButtonElement>("btn-marketing"),
  btnBuyAutoClipper: () => el<HTMLButtonElement>("btn-buy-autoclipper"),
};

export interface RenderExtras {
  /** Trombones par seconde, mesuré sur la dernière seconde. */
  clipRate: number;
  /** Revenu moyen par seconde, lissé sur les 10 dernières secondes. */
  avgRev: number;
}

export function render(state: GameState, extras: RenderExtras): void {
  dom.clips().textContent = formatInt(state.clips);
  dom.funds().textContent = formatMoney(state.funds);
  dom.avgRev().textContent = formatMoney(extras.avgRev);
  dom.unsold().textContent = formatInt(state.unsold);
  dom.price().textContent = formatMoney(state.price);
  dom.demand().textContent = `${formatInt(computeDemand(state) * 10)} %`;
  dom.marketingLvl().textContent = formatInt(state.marketingLvl);
  dom.marketingCost().textContent = formatMoney(marketingCost(state));
  dom.clipRate().textContent = formatInt(extras.clipRate);
  dom.wire().textContent = `${formatInt(state.wire)} cm`;
  dom.wireCost().textContent = formatMoney(state.wireCost);
  dom.autoClippers().textContent = formatInt(state.autoClippers);
  dom.autoClipperCost().textContent = formatMoney(autoClipperCost(state));

  dom.autoClipperBlock().hidden = !state.autoClippersUnlocked;

  dom.btnMake().disabled = state.wire < 1;
  dom.btnBuyWire().disabled = state.funds < state.wireCost;
  dom.btnPriceDown().disabled = state.price <= PRICE_MIN;
  dom.btnMarketing().disabled = state.funds < marketingCost(state);
  dom.btnBuyAutoClipper().disabled = state.funds < autoClipperCost(state);
}
