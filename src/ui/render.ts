import type { GameState } from "../state";
import { computeDemand, marketingCost, PRICE_MIN } from "../systems/market";
import {
  autoClipperCost,
  megaClipperCost,
} from "../systems/production";
import {
  maxOps,
  unusedTrust,
} from "../systems/compute";
import {
  canAfford,
  formatCost,
  visibleProjects,
} from "../systems/projects";
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
  megaClippers: () => el<HTMLSpanElement>("megaclippers"),
  megaClipperCost: () => el<HTMLSpanElement>("megaclipper-cost"),
  megaClipperBlock: () => el<HTMLDivElement>("megaclipper-block"),
  trust: () => el<HTMLSpanElement>("trust"),
  trustUnused: () => el<HTMLSpanElement>("trust-unused"),
  nextTrust: () => el<HTMLSpanElement>("next-trust"),
  processors: () => el<HTMLSpanElement>("processors"),
  memory: () => el<HTMLSpanElement>("memory"),
  ops: () => el<HTMLSpanElement>("ops"),
  opsMax: () => el<HTMLSpanElement>("ops-max"),
  creativity: () => el<HTMLSpanElement>("creativity"),
  creativityRow: () => el<HTMLDivElement>("creativity-row"),
  projectsList: () => el<HTMLDivElement>("projects-list"),
  btnMake: () => el<HTMLButtonElement>("btn-make"),
  btnBuyWire: () => el<HTMLButtonElement>("btn-buy-wire"),
  btnPriceDown: () => el<HTMLButtonElement>("btn-price-down"),
  btnPriceUp: () => el<HTMLButtonElement>("btn-price-up"),
  btnMarketing: () => el<HTMLButtonElement>("btn-marketing"),
  btnBuyAutoClipper: () => el<HTMLButtonElement>("btn-buy-autoclipper"),
  btnBuyMegaClipper: () => el<HTMLButtonElement>("btn-buy-megaclipper"),
  btnAddProcessor: () => el<HTMLButtonElement>("btn-add-processor"),
  btnAddMemory: () => el<HTMLButtonElement>("btn-add-memory"),
};

export interface RenderExtras {
  /** Trombones par seconde, mesuré sur la dernière seconde. */
  clipRate: number;
  /** Revenu moyen par seconde, lissé sur les 10 dernières secondes. */
  avgRev: number;
  /** Callback d'activation d'un projet (branché une fois depuis main). */
  onActivateProject: (id: string) => void;
}

/** Signature des projets affichés, pour éviter de reconstruire le DOM à chaque frame. */
let lastProjectsSignature = "";

function renderProjects(state: GameState, onActivate: (id: string) => void): void {
  const projects = visibleProjects(state);
  const signature = projects
    .map((p) => `${p.id}:${canAfford(state, p.cost) ? 1 : 0}`)
    .join("|");

  if (signature === lastProjectsSignature) {
    // Met à jour seulement l'état disabled des boutons existants.
    for (const p of projects) {
      const btn = document.getElementById(`project-${p.id}`) as HTMLButtonElement | null;
      if (btn) btn.disabled = !canAfford(state, p.cost);
    }
    return;
  }
  lastProjectsSignature = signature;

  const list = dom.projectsList();
  list.replaceChildren();

  if (projects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.id = "projects-empty";
    empty.textContent = "Aucun projet disponible pour l’instant.";
    list.appendChild(empty);
    return;
  }

  for (const p of projects) {
    const card = document.createElement("div");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = p.title;

    const desc = document.createElement("p");
    desc.textContent = p.description;

    const cost = document.createElement("div");
    cost.className = "project-cost";
    cost.textContent = formatCost(p.cost);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = `project-${p.id}`;
    btn.textContent = "Activer";
    btn.disabled = !canAfford(state, p.cost);
    btn.addEventListener("click", () => onActivate(p.id));

    card.append(title, desc, cost, btn);
    list.appendChild(card);
  }
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
  dom.megaClippers().textContent = formatInt(state.megaClippers);
  dom.megaClipperCost().textContent = formatMoney(megaClipperCost(state));

  const freeTrust = unusedTrust(state);
  dom.trust().textContent = formatInt(state.trust);
  dom.trustUnused().textContent = formatInt(freeTrust);
  dom.nextTrust().textContent = formatInt(state.nextTrust);
  dom.processors().textContent = formatInt(state.processors);
  dom.memory().textContent = formatInt(state.memory);
  dom.ops().textContent = formatInt(state.ops);
  dom.opsMax().textContent = formatInt(maxOps(state));
  dom.creativity().textContent = formatInt(state.creativity);

  dom.autoClipperBlock().hidden = !state.autoClippersUnlocked;
  dom.megaClipperBlock().hidden = !state.megaClippersUnlocked;
  dom.creativityRow().hidden = !state.creativityUnlocked;

  dom.btnMake().disabled = state.wire < 1;
  dom.btnBuyWire().disabled = state.funds < state.wireCost;
  dom.btnPriceDown().disabled = state.price <= PRICE_MIN;
  dom.btnMarketing().disabled = state.funds < marketingCost(state);
  dom.btnBuyAutoClipper().disabled = state.funds < autoClipperCost(state);
  dom.btnBuyMegaClipper().disabled = state.funds < megaClipperCost(state);
  dom.btnAddProcessor().disabled = freeTrust < 1;
  dom.btnAddMemory().disabled = freeTrust < 1;

  renderProjects(state, extras.onActivateProject);
}
