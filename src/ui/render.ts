import type { GameState } from "../state";
import { formatInt, formatMoney } from "../util/format";

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Élément introuvable : #${id}`);
  return node as T;
}

const dom = {
  clips: () => el<HTMLSpanElement>("clips"),
  funds: () => el<HTMLSpanElement>("funds"),
  unsold: () => el<HTMLSpanElement>("unsold"),
  price: () => el<HTMLSpanElement>("price"),
  clipRate: () => el<HTMLSpanElement>("clip-rate"),
  wire: () => el<HTMLSpanElement>("wire"),
  wireCost: () => el<HTMLSpanElement>("wire-cost"),
  btnMake: () => el<HTMLButtonElement>("btn-make"),
  btnBuyWire: () => el<HTMLButtonElement>("btn-buy-wire"),
};

export interface RenderExtras {
  /** Trombones par seconde, mesuré sur la dernière seconde. */
  clipRate: number;
}

export function render(state: GameState, extras: RenderExtras): void {
  dom.clips().textContent = formatInt(state.clips);
  dom.funds().textContent = formatMoney(state.funds);
  dom.unsold().textContent = formatInt(state.unsold);
  dom.price().textContent = formatMoney(state.price);
  dom.clipRate().textContent = formatInt(extras.clipRate);
  dom.wire().textContent = `${formatInt(state.wire)} cm`;
  dom.wireCost().textContent = formatMoney(state.wireCost);

  dom.btnMake().disabled = state.wire < 1;
  dom.btnBuyWire().disabled = state.funds < state.wireCost;
}
