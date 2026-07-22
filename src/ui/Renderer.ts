import type { GameState } from "../state/GameState";
import type { ComputeSystem } from "../systems/compute/ComputeSystem";
import type { InvestmentSystem } from "../systems/invest/InvestmentSystem";
import type { ProductionSystem } from "../systems/production/ProductionSystem";
import type { ProjectSystem } from "../systems/projects/ProjectSystem";
import type { QuantumSystem } from "../systems/quantum/QuantumSystem";
import type { StrategicModelingSystem } from "../systems/strategic/StrategicModelingSystem";
import { MarketSystem } from "../systems/market/MarketSystem";
import { NumberFormatter } from "../util/NumberFormatter";

/** Contrat minimal attendu par le rendu (évite d'importer Game). */
export interface RenderModel {
  readonly state: GameState;
  readonly production: ProductionSystem;
  readonly market: MarketSystem;
  readonly compute: ComputeSystem;
  readonly projects: ProjectSystem;
  readonly investments: InvestmentSystem;
  readonly strategic: StrategicModelingSystem;
  readonly quantum: QuantumSystem;
  readonly clipRate: number;
  readonly avgRev: number;
  activateProject(id: string): void;
  acknowledgePhase1End(): void;
}

function requireElement<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Élément introuvable : #${id}`);
  return node as T;
}

const RISK_LABELS: Record<number, string> = {
  1: "Faible",
  2: "Moyen",
  3: "Élevé",
};

export class Renderer {
  private lastProjectsSignature = "";
  private lastStratPickerSignature = "";

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
    panelProjects: () => requireElement<HTMLElement>("panel-projects"),
    panelStrategic: () => requireElement<HTMLElement>("panel-strategic"),
    strategicYomi: () => requireElement<HTMLSpanElement>("strategic-yomi"),
    tourneyCost: () => requireElement<HTMLSpanElement>("tourney-cost"),
    stratPicker: () => requireElement<HTMLSelectElement>("strat-picker"),
    btnRunTourney: () => requireElement<HTMLButtonElement>("btn-run-tourney"),
    tourneyGrid: () => requireElement<HTMLElement>("tourney-grid"),
    tourneyLabelA: () => requireElement<HTMLSpanElement>("tourney-label-a"),
    tourneyLabelB: () => requireElement<HTMLSpanElement>("tourney-label-b"),
    payoffHA: () => requireElement<HTMLTableCellElement>("payoff-h-a"),
    payoffHB: () => requireElement<HTMLTableCellElement>("payoff-h-b"),
    payoffVA: () => requireElement<HTMLTableCellElement>("payoff-v-a"),
    payoffVB: () => requireElement<HTMLTableCellElement>("payoff-v-b"),
    payoffAA: () => requireElement<HTMLTableCellElement>("payoff-aa"),
    payoffAB: () => requireElement<HTMLTableCellElement>("payoff-ab"),
    payoffBA: () => requireElement<HTMLTableCellElement>("payoff-ba"),
    payoffBB: () => requireElement<HTMLTableCellElement>("payoff-bb"),
    tourneyResults: () => requireElement<HTMLElement>("tourney-results"),
    tourneyYomiGained: () =>
      requireElement<HTMLSpanElement>("tourney-yomi-gained"),
    tourneyResultsList: () =>
      requireElement<HTMLOListElement>("tourney-results-list"),
    panelInvestments: () => requireElement<HTMLElement>("panel-investments"),
    investFunds: () => requireElement<HTMLSpanElement>("invest-funds"),
    investDelta: () => requireElement<HTMLSpanElement>("invest-delta"),
    investEngine: () => requireElement<HTMLSpanElement>("invest-engine"),
    yomi: () => requireElement<HTMLSpanElement>("yomi"),
    investRisk: () => requireElement<HTMLSpanElement>("invest-risk"),
    investUpgradeCost: () =>
      requireElement<HTMLSpanElement>("invest-upgrade-cost"),
    btnRiskLow: () => requireElement<HTMLButtonElement>("btn-risk-low"),
    btnRiskMed: () => requireElement<HTMLButtonElement>("btn-risk-med"),
    btnRiskHigh: () => requireElement<HTMLButtonElement>("btn-risk-high"),
    btnInvestDeposit: () =>
      requireElement<HTMLButtonElement>("btn-invest-deposit"),
    btnInvestWithdraw: () =>
      requireElement<HTMLButtonElement>("btn-invest-withdraw"),
    btnUpgradeEngine: () =>
      requireElement<HTMLButtonElement>("btn-upgrade-engine"),
    panelQuantum: () => requireElement<HTMLElement>("panel-quantum"),
    qChips: () => requireElement<HTMLSpanElement>("qchips"),
    qChipCost: () => requireElement<HTMLSpanElement>("qchip-cost"),
    btnBuyQChip: () => requireElement<HTMLButtonElement>("btn-buy-qchip"),
    btnQCompute: () => requireElement<HTMLButtonElement>("btn-qcompute"),
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
    phase1EndOverlay: () => requireElement<HTMLElement>("phase1-end-overlay"),
    phase1EndClips: () => requireElement<HTMLSpanElement>("phase1-end-clips"),
    phase2Banner: () => requireElement<HTMLElement>("phase2-banner"),
  };

  render(model: RenderModel): void {
    const { state, production, market, compute, quantum } = model;
    const dom = this.dom;

    this.renderPhase1End(model);

    dom.clips().textContent = NumberFormatter.formatInteger(state.clips);
    dom.funds().textContent = NumberFormatter.formatMoney(state.funds);
    dom.avgRev().textContent = NumberFormatter.formatMoney(model.avgRev);
    dom.unsold().textContent = NumberFormatter.formatInteger(state.unsold);
    dom.price().textContent = NumberFormatter.formatMoney(state.price);
    dom.demand().textContent = `${NumberFormatter.formatInteger(market.getPublicDemand() * 10)} %`;
    dom.marketingLvl().textContent = NumberFormatter.formatInteger(
      state.marketingLvl,
    );
    dom.marketingCost().textContent = NumberFormatter.formatMoney(
      market.getNextMarketingLevelCost(),
    );
    dom.clipRate().textContent = NumberFormatter.formatInteger(model.clipRate);
    dom.wire().textContent = `${NumberFormatter.formatInteger(state.wire)} cm`;
    dom.wireCost().textContent = NumberFormatter.formatMoney(state.wireCost);
    dom.autoClippers().textContent = NumberFormatter.formatInteger(
      state.autoClippers,
    );
    dom.autoClipperCost().textContent = NumberFormatter.formatMoney(
      production.getNextAutoClipperCost(),
    );
    dom.megaClippers().textContent = NumberFormatter.formatInteger(
      state.megaClippers,
    );
    dom.megaClipperCost().textContent = NumberFormatter.formatMoney(
      production.getNextMegaClipperCost(),
    );

    const availableTrust = compute.getAvailableTrustPoints();
    dom.trust().textContent = NumberFormatter.formatInteger(state.trust);
    dom.trustUnused().textContent =
      NumberFormatter.formatInteger(availableTrust);
    dom.nextTrust().textContent = NumberFormatter.formatInteger(state.nextTrust);
    dom.processors().textContent = NumberFormatter.formatInteger(
      state.processors,
    );
    dom.memory().textContent = NumberFormatter.formatInteger(state.memory);
    dom.ops().textContent = NumberFormatter.formatInteger(state.ops);
    dom.opsMax().textContent = NumberFormatter.formatInteger(
      compute.getOperationsCapacity(),
    );
    dom.creativity().textContent = NumberFormatter.formatInteger(
      state.creativity,
    );

    dom.autoClipperBlock().hidden = !state.autoClippersUnlocked;
    dom.megaClipperBlock().hidden = !state.megaClippersUnlocked;
    dom.creativityRow().hidden = !state.creativityUnlocked;

    this.renderStrategic(model);
    this.renderInvestments(model);
    this.renderQuantum(model);

    this.dom.panelProjects().hidden = !model.projects.isProjectsBoardUnlocked();

    dom.btnMake().disabled =
      state.wire < 1 || model.production.isProductionHalted();
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
    dom.btnBuyQChip().disabled =
      !state.quantumUnlocked ||
      state.ops < quantum.getNextPhotonicChipCost();
    dom.btnQCompute().disabled =
      !state.quantumUnlocked || state.qChips < 1;

    this.renderProjectCards(model);
  }

  private renderPhase1End(model: RenderModel): void {
    const { state } = model;
    const showOverlay =
      state.phase1Complete && !state.phase1EndAcknowledged;
    this.dom.phase1EndOverlay().hidden = !showOverlay;
    if (showOverlay) {
      this.dom.phase1EndClips().textContent = NumberFormatter.formatInteger(
        state.clips,
      );
    }
    this.dom.phase2Banner().hidden = !(
      state.phase1Complete && state.phase1EndAcknowledged
    );
  }

  private renderStrategic(model: RenderModel): void {
    const { state, strategic } = model;
    const dom = this.dom;
    dom.panelStrategic().hidden = !state.strategicModelingUnlocked;
    if (!state.strategicModelingUnlocked) return;

    dom.strategicYomi().textContent = NumberFormatter.formatInteger(state.yomi);
    dom.tourneyCost().textContent = NumberFormatter.formatInteger(
      strategic.getTourneyCost(),
    );
    dom.btnRunTourney().disabled = !strategic.canRunTournament();

    const unlocked = strategic.getUnlockedStrategies();
    const pickerSig = `${unlocked.join(",")}|${state.selectedStrategyId}`;
    if (pickerSig !== this.lastStratPickerSignature) {
      this.lastStratPickerSignature = pickerSig;
      const picker = dom.stratPicker();
      picker.replaceChildren();
      for (const id of unlocked) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = id.replaceAll("_", " ");
        if (id === state.selectedStrategyId) option.selected = true;
        picker.appendChild(option);
      }
    } else {
      dom.stratPicker().value = state.selectedStrategyId;
    }

    const payoff = state.tourneyPayoff;
    const hasGrid = payoff !== null;
    dom.tourneyGrid().hidden = !hasGrid;
    if (hasGrid && payoff) {
      dom.tourneyLabelA().textContent = state.tourneyChoiceA;
      dom.tourneyLabelB().textContent = state.tourneyChoiceB;
      dom.payoffHA().textContent = state.tourneyChoiceA;
      dom.payoffHB().textContent = state.tourneyChoiceB;
      dom.payoffVA().textContent = state.tourneyChoiceA;
      dom.payoffVB().textContent = state.tourneyChoiceB;
      dom.payoffAA().textContent = `${payoff.aa},${payoff.aa}`;
      dom.payoffAB().textContent = `${payoff.ab},${payoff.ba}`;
      dom.payoffBA().textContent = `${payoff.ba},${payoff.ab}`;
      dom.payoffBB().textContent = `${payoff.bb},${payoff.bb}`;
    }

    const hasResults = state.tourneyResults.length > 0;
    dom.tourneyResults().hidden = !hasResults;
    if (hasResults) {
      dom.tourneyYomiGained().textContent = NumberFormatter.formatInteger(
        state.lastTourneyYomiGained,
      );
      const list = dom.tourneyResultsList();
      list.replaceChildren();
      for (const row of state.tourneyResults) {
        const li = document.createElement("li");
        li.textContent = `${row.name} : ${NumberFormatter.formatInteger(row.score)}`;
        if (row.id === state.selectedStrategyId) li.className = "picked";
        list.appendChild(li);
      }
    }
  }

  private renderInvestments(model: RenderModel): void {
    const { state, investments } = model;
    const dom = this.dom;
    dom.panelInvestments().hidden = !state.investmentsUnlocked;
    if (!state.investmentsUnlocked) return;

    dom.investFunds().textContent = NumberFormatter.formatMoney(
      state.investmentFunds,
    );
    const delta = state.lastStockDelta;
    const sign = delta > 0 ? "+" : "";
    dom.investDelta().textContent = `${sign}${NumberFormatter.formatMoney(delta)}`;
    dom.investEngine().textContent = NumberFormatter.formatInteger(
      state.investEngineLevel,
    );
    dom.yomi().textContent = NumberFormatter.formatInteger(state.yomi);
    dom.investRisk().textContent = RISK_LABELS[state.investRisk] ?? "—";
    const upgradeCost = investments.getNextEngineUpgradeCost();
    dom.investUpgradeCost().textContent =
      NumberFormatter.formatInteger(upgradeCost);

    dom.btnRiskLow().disabled = state.investRisk === 1;
    dom.btnRiskMed().disabled = state.investRisk === 2;
    dom.btnRiskHigh().disabled = state.investRisk === 3;
    dom.btnInvestDeposit().disabled = state.funds <= 0;
    dom.btnInvestWithdraw().disabled = state.investmentFunds <= 0;
    dom.btnUpgradeEngine().disabled = state.yomi < upgradeCost;
  }

  private renderQuantum(model: RenderModel): void {
    const { state, quantum } = model;
    const dom = this.dom;
    dom.panelQuantum().hidden = !state.quantumUnlocked;
    if (!state.quantumUnlocked) return;

    dom.qChips().textContent = NumberFormatter.formatInteger(state.qChips);
    dom.qChipCost().textContent = NumberFormatter.formatInteger(
      quantum.getNextPhotonicChipCost(),
    );
    dom.btnQCompute().textContent = state.qComputeActive
      ? "Arrêter le calcul (figer les ops)"
      : "Calcul quantique";
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
      empty.className = "col-span-full text-[0.9em] text-muted";
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
