import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";

/** Intervalle entre deux ticks boursiers (ms). */
const STOCK_TICK_MS = 1000;

/**
 * Trading algorithmique : dépôt/retrait, risque, rendements aléatoires.
 * Débloqué par le projet « Modélisation stratégique ».
 */
export class InvestmentSystem extends GameSystem {
  private stockAccumulatorMs = 0;

  constructor(state: GameState) {
    super(state);
  }

  setRiskLevel(level: 1 | 2 | 3): void {
    this.state.investRisk = level;
  }

  /** Dépose tout le cash disponible (ou une fraction). */
  depositAll(): boolean {
    return this.deposit(this.state.funds);
  }

  deposit(amount: number): boolean {
    if (!this.state.investmentsUnlocked) return false;
    const moved = Math.min(Math.max(0, amount), this.state.funds);
    if (moved <= 0) return false;
    this.state.funds -= moved;
    this.state.investmentFunds += moved;
    return true;
  }

  withdrawAll(): boolean {
    return this.withdraw(this.state.investmentFunds);
  }

  withdraw(amount: number): boolean {
    if (!this.state.investmentsUnlocked) return false;
    const moved = Math.min(Math.max(0, amount), this.state.investmentFunds);
    if (moved <= 0) return false;
    this.state.investmentFunds -= moved;
    this.state.funds += moved;
    return true;
  }

  /**
   * Rendement attendu par seconde selon moteur et risque.
   * Le Yomi n'agit plus directement : il paie les upgrades de moteur.
   */
  getExpectedReturnRate(): number {
    const s = this.state;
    const riskFactor = s.investRisk === 1 ? 0.4 : s.investRisk === 2 ? 1 : 1.8;
    return 0.002 * s.investEngineLevel * riskFactor;
  }

  getVolatility(): number {
    return 0.01 * this.state.investRisk;
  }

  /** Coût Yomi du prochain niveau de moteur (formule UP). */
  getNextEngineUpgradeCost(): number {
    return Math.floor(Math.pow(this.state.investEngineLevel, Math.E) * 100);
  }

  /** Améliore le moteur d'investissement en dépensant du Yomi. */
  upgradeEngineWithYomi(): boolean {
    if (!this.state.investmentsUnlocked) return false;
    const cost = this.getNextEngineUpgradeCost();
    if (this.state.yomi < cost) return false;
    this.state.yomi -= cost;
    this.state.investEngineLevel += 1;
    return true;
  }

  /** Applique un tick boursier (exposé pour les tests). */
  applyStockTick(): number {
    const s = this.state;
    if (!s.investmentsUnlocked || s.investmentFunds <= 0) {
      s.lastStockDelta = 0;
      return 0;
    }
    const expected = this.getExpectedReturnRate();
    const noise = (Math.random() - 0.5) * 2 * this.getVolatility();
    const delta = s.investmentFunds * (expected + noise);
    s.investmentFunds = Math.max(0, s.investmentFunds + delta);
    s.lastStockDelta = delta;
    return delta;
  }

  override update(deltaMs: number): void {
    if (!this.state.investmentsUnlocked) return;
    this.stockAccumulatorMs += deltaMs;
    while (this.stockAccumulatorMs >= STOCK_TICK_MS) {
      this.applyStockTick();
      this.stockAccumulatorMs -= STOCK_TICK_MS;
    }
  }
}
