import type { GameState } from "../state/GameState";
import type { ComputeSystem } from "../systems/compute/ComputeSystem";
import type { ProductionSystem } from "../systems/production/ProductionSystem";
import type { ProjectSystem } from "../systems/projects/ProjectSystem";
import { MarketSystem } from "../systems/market/MarketSystem";
import { NumberFormatter } from "../util/NumberFormatter";

/** Contrat minimal attendu par le rendu (évite d'importer Game). */
export interface RenderModel {
  readonly state: GameState;
  readonly production: ProductionSystem;
  readonly market: MarketSystem;
  readonly compute: ComputeSystem;
  readonly projects: ProjectSystem;
  readonly clipRate: number;
  readonly avgRev: number;
  activateProject(id: string): void;
}

function requireElement<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Élément introuvable : #${id}`);
  return node as T;
}

export class Renderer {
  private lastProjectsSignature = "";

  private readonly dom = {
    clips: () => requireElement<HTMLSpanElement>("clips"),
    funds: () => requireElement<HTMLSpanElement>("funds"),
    avgRev: () => requireElement<HTMLSpanElement>("avg-rev"),
    unsold: () => requireElement<HTMLSpanElement>("unsold"),
    price: () => requireElement<HTMLSpanElement>("price"),
    demand: () => requireElement<HTMLSpanElement>("demand"),
    marketingLvl: () => requireElement<HTMLSpanElement>("marketing-lvl"),
    marketingCost: () => requireElement<HTMLSpanElement>("marketing-cost"),
    clipRate: () => requireElement<HTMLSpanElement>("clip-rate"),
    wire: () => requireElement<HTMLSpanElement>("wire"),
    wireCost: () => requireElement<HTMLSpanElement>("wire-cost"),
    autoClippers: () => requireElement<HTMLSpanElement>("autoclippers"),
    autoClipperCost: () => requireElement<HTMLSpanElement>("autoclipper-cost"),
    autoClipperBlock: () => requireElement<HTMLDivElement>("autoclipper-block"),
    megaClippers: () => requireElement<HTMLSpanElement>("megaclippers"),
    megaClipperCost: () => requireElement<HTMLSpanElement>("megaclipper-cost"),
    megaClipperBlock: () => requireElement<HTMLDivElement>("megaclipper-block"),
    trust: () => requireElement<HTMLSpanElement>("trust"),
    trustUnused: () => requireElement<HTMLSpanElement>("trust-unused"),
    nextTrust: () => requireElement<HTMLSpanElement>("next-trust"),
    processors: () => requireElement<HTMLSpanElement>("processors"),
    memory: () => requireElement<HTMLSpanElement>("memory"),
    ops: () => requireElement<HTMLSpanElement>("ops"),
    opsMax: () => requireElement<HTMLSpanElement>("ops-max"),
    creativity: () => requireElement<HTMLSpanElement>("creativity"),
    creativityRow: () => requireElement<HTMLDivElement>("creativity-row"),
    projectsList: () => requireElement<HTMLDivElement>("projects-list"),
    btnMake: () => requireElement<HTMLButtonElement>("btn-make"),
    btnBuyWire: () => requireElement<HTMLButtonElement>("btn-buy-wire"),
    btnPriceDown: () => requireElement<HTMLButtonElement>("btn-price-down"),
    btnPriceUp: () => requireElement<HTMLButtonElement>("btn-price-up"),
    btnMarketing: () => requireElement<HTMLButtonElement>("btn-marketing"),
    btnBuyAutoClipper: () =>
      requireElement<HTMLButtonElement>("btn-buy-autoclipper"),
    btnBuyMegaClipper: () =>
      requireElement<HTMLButtonElement>("btn-buy-megaclipper"),
    btnAddProcessor: () =>
      requireElement<HTMLButtonElement>("btn-add-processor"),
    btnAddMemory: () => requireElement<HTMLButtonElement>("btn-add-memory"),
  };

  render(model: RenderModel): void {
    const { state, production, market, compute } = model;
    const dom = this.dom;

    dom.clips().textContent = NumberFormatter.formatInteger(state.clips);
    dom.funds().textContent = NumberFormatter.formatMoney(state.funds);
    dom.avgRev().textContent = NumberFormatter.formatMoney(model.avgRev);
    dom.unsold().textContent = NumberFormatter.formatInteger(state.unsold);
    dom.price().textContent = NumberFormatter.formatMoney(state.price);
    dom.demand().textContent = `${NumberFormatter.formatInteger(market.getPublicDemand() * 10)} %`;
    dom.marketingLvl().textContent = NumberFormatter.formatInteger(state.marketingLvl);
    dom.marketingCost().textContent = NumberFormatter.formatMoney(
      market.getNextMarketingLevelCost(),
    );
    dom.clipRate().textContent = NumberFormatter.formatInteger(model.clipRate);
    dom.wire().textContent = `${NumberFormatter.formatInteger(state.wire)} cm`;
    dom.wireCost().textContent = NumberFormatter.formatMoney(state.wireCost);
    dom.autoClippers().textContent = NumberFormatter.formatInteger(state.autoClippers);
    dom.autoClipperCost().textContent = NumberFormatter.formatMoney(
      production.getNextAutoClipperCost(),
    );
    dom.megaClippers().textContent = NumberFormatter.formatInteger(state.megaClippers);
    dom.megaClipperCost().textContent = NumberFormatter.formatMoney(
      production.getNextMegaClipperCost(),
    );

    const availableTrust = compute.getAvailableTrustPoints();
    dom.trust().textContent = NumberFormatter.formatInteger(state.trust);
    dom.trustUnused().textContent = NumberFormatter.formatInteger(availableTrust);
    dom.nextTrust().textContent = NumberFormatter.formatInteger(state.nextTrust);
    dom.processors().textContent = NumberFormatter.formatInteger(state.processors);
    dom.memory().textContent = NumberFormatter.formatInteger(state.memory);
    dom.ops().textContent = NumberFormatter.formatInteger(state.ops);
    dom.opsMax().textContent = NumberFormatter.formatInteger(
      compute.getOperationsCapacity(),
    );
    dom.creativity().textContent = NumberFormatter.formatInteger(state.creativity);

    dom.autoClipperBlock().hidden = !state.autoClippersUnlocked;
    dom.megaClipperBlock().hidden = !state.megaClippersUnlocked;
    dom.creativityRow().hidden = !state.creativityUnlocked;

    dom.btnMake().disabled = state.wire < 1;
    dom.btnBuyWire().disabled = state.funds < state.wireCost;
    dom.btnPriceDown().disabled = state.price <= MarketSystem.PRICE_MIN;
    dom.btnMarketing().disabled =
      state.funds < market.getNextMarketingLevelCost();
    dom.btnBuyAutoClipper().disabled =
      state.funds < production.getNextAutoClipperCost();
    dom.btnBuyMegaClipper().disabled =
      state.funds < production.getNextMegaClipperCost();
    dom.btnAddProcessor().disabled = availableTrust < 1;
    dom.btnAddMemory().disabled = availableTrust < 1;

    this.renderProjectCards(model);
  }

  private renderProjectCards(model: RenderModel): void {
    const available = model.projects.getAvailableProjects();
    const signature = available
      .map((p) => `${p.id}:${p.cost.canAfford(model.state) ? 1 : 0}`)
      .join("|");

    if (signature === this.lastProjectsSignature) {
      for (const project of available) {
        const btn = document.getElementById(
          `project-${project.id}`,
        ) as HTMLButtonElement | null;
        if (btn) btn.disabled = !project.cost.canAfford(model.state);
      }
      return;
    }
    this.lastProjectsSignature = signature;

    const list = this.dom.projectsList();
    list.replaceChildren();

    if (available.length === 0) {
      const empty = document.createElement("p");
      empty.className = "text-[0.9em] text-muted";
      empty.textContent = "Aucun projet disponible pour l’instant.";
      list.appendChild(empty);
      return;
    }

    for (const project of available) {
      const card = document.createElement("div");
      card.className = "project-card";

      const title = document.createElement("h3");
      title.textContent = project.title;

      const desc = document.createElement("p");
      desc.textContent = project.description;

      const cost = document.createElement("div");
      cost.className = "project-cost";
      cost.textContent = project.cost.toDisplayString();

      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = `project-${project.id}`;
      btn.textContent = "Activer";
      btn.disabled = !project.cost.canAfford(model.state);
      btn.addEventListener("click", () => model.activateProject(project.id));

      card.append(title, desc, cost, btn);
      list.appendChild(card);
    }
  }
}
