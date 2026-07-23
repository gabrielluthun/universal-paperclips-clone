import type { InvestmentSystem } from "../../systems/invest/InvestmentSystem";
import { bindClick } from "./bindClick";

/** Câble les actions d'investissement (dépôts/retraits, moteur, niveau de risque). */
export class InvestmentsController {
  constructor(private readonly investments: InvestmentSystem) {}

  bind(): void {
    bindClick("btn-invest-deposit", () => this.investments.depositAll());
    bindClick("btn-invest-withdraw", () => this.investments.withdrawAll());
    bindClick("btn-upgrade-engine", () =>
      this.investments.upgradeEngineWithYomi(),
    );
    bindClick("btn-risk-low", () => this.investments.setRiskLevel(1));
    bindClick("btn-risk-med", () => this.investments.setRiskLevel(2));
    bindClick("btn-risk-high", () => this.investments.setRiskLevel(3));
  }
}
