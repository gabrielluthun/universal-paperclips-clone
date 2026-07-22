import { NumberFormatter } from "../../util/NumberFormatter";
import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

const RISK_LABELS: Record<number, string> = {
  1: "Faible",
  2: "Moyen",
  3: "Élevé",
};

export class InvestmentsPanel {
  private readonly panel = requireElement<HTMLElement>("panel-investments");
  private readonly investFunds =
    requireElement<HTMLSpanElement>("invest-funds");
  private readonly investDelta =
    requireElement<HTMLSpanElement>("invest-delta");
  private readonly investEngine =
    requireElement<HTMLSpanElement>("invest-engine");
  private readonly yomi = requireElement<HTMLSpanElement>("yomi");
  private readonly investRisk = requireElement<HTMLSpanElement>("invest-risk");
  private readonly investUpgradeCost =
    requireElement<HTMLSpanElement>("invest-upgrade-cost");
  private readonly btnRiskLow =
    requireElement<HTMLButtonElement>("btn-risk-low");
  private readonly btnRiskMed =
    requireElement<HTMLButtonElement>("btn-risk-med");
  private readonly btnRiskHigh =
    requireElement<HTMLButtonElement>("btn-risk-high");
  private readonly btnInvestDeposit =
    requireElement<HTMLButtonElement>("btn-invest-deposit");
  private readonly btnInvestWithdraw =
    requireElement<HTMLButtonElement>("btn-invest-withdraw");
  private readonly btnUpgradeEngine =
    requireElement<HTMLButtonElement>("btn-upgrade-engine");

  render(model: RenderModel): void {
    const { state, investments } = model;
    this.panel.hidden = !state.investmentsUnlocked;
    if (!state.investmentsUnlocked) return;

    this.investFunds.textContent = NumberFormatter.formatMoney(
      state.investmentFunds,
    );
    const delta = state.lastStockDelta;
    const sign = delta > 0 ? "+" : "";
    this.investDelta.textContent = `${sign}${NumberFormatter.formatMoney(delta)}`;
    this.investEngine.textContent = NumberFormatter.formatInteger(
      state.investEngineLevel,
    );
    this.yomi.textContent = NumberFormatter.formatInteger(state.yomi);
    this.investRisk.textContent = RISK_LABELS[state.investRisk] ?? "—";
    const upgradeCost = investments.getNextEngineUpgradeCost();
    this.investUpgradeCost.textContent =
      NumberFormatter.formatInteger(upgradeCost);

    this.btnRiskLow.disabled = state.investRisk === 1;
    this.btnRiskMed.disabled = state.investRisk === 2;
    this.btnRiskHigh.disabled = state.investRisk === 3;
    this.btnInvestDeposit.disabled = state.funds <= 0;
    this.btnInvestWithdraw.disabled = state.investmentFunds <= 0;
    this.btnUpgradeEngine.disabled = state.yomi < upgradeCost;
  }
}
