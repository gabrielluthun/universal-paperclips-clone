import type { GameState } from "../../state/GameState";
import type { ComputeSystem } from "../compute/ComputeSystem";
import { GameSystem } from "../core/GameSystem";

export class ProductionSystem extends GameSystem {
  private clipsProducedDuringLastUpdate = 0;

  constructor(
    state: GameState,
    private readonly compute: ComputeSystem,
  ) {
    super(state);
  }

  /**
   * Fabrique jusqu'à `count` trombones (limité par le fil disponible).
   * Retourne le nombre réellement fabriqué.
   */
  produceClips(count: number): number {
    const state = this.state;
    const made = Math.min(count, Math.floor(state.wire));
    if (made <= 0) return 0;
    state.clips += made;
    state.unsold += made;
    state.wire -= made;
    this.compute.grantTrustForProductionMilestones();
    return made;
  }

  purchaseWireSpool(): boolean {
    const state = this.state;
    if (state.funds < state.wireCost) return false;
    state.funds -= state.wireCost;
    state.wire += state.wirePerSpool;
    state.wireBasePrice += 0.05;
    return true;
  }

  /** Coût de la prochaine AutoTrombineuse : 1,1^n + 5 $. */
  getNextAutoClipperCost(): number {
    return Math.pow(1.1, this.state.autoClippers) + 5;
  }

  purchaseAutoClipper(): boolean {
    const cost = this.getNextAutoClipperCost();
    if (this.state.funds < cost) return false;
    this.state.funds -= cost;
    this.state.autoClippers += 1;
    return true;
  }

  getNextMegaClipperCost(): number {
    return Math.pow(1.07, this.state.megaClippers) * 1000;
  }

  purchaseMegaClipper(): boolean {
    if (!this.state.megaClippersUnlocked) return false;
    const cost = this.getNextMegaClipperCost();
    if (this.state.funds < cost) return false;
    this.state.funds -= cost;
    this.state.megaClippers += 1;
    return true;
  }

  getAutomaticProductionRate(): number {
    const state = this.state;
    const fromAuto = state.autoClippers * state.clipperBonus;
    const fromMega = state.megaClippers * 500 * state.megaClipperBonus;
    return fromAuto + fromMega;
  }

  private produceClipsAutomatically(deltaMs: number): number {
    const state = this.state;
    const production_rate = this.getAutomaticProductionRate();
    if (production_rate <= 0) return 0;
    state.autoClipFraction += production_rate * (deltaMs / 1000);
    const whole = Math.floor(state.autoClipFraction);
    if (whole <= 0) return 0;
    const made = this.produceClips(whole);
    state.autoClipFraction = made < whole ? 0 : state.autoClipFraction - whole;
    return made;
  }

  private purchaseWireIfStockIsLow(): void {
    const state = this.state;
    if (!state.autoWire) return;
    if (state.wire >= state.wirePerSpool / 2) return;
    this.purchaseWireSpool();
  }

  /**
   * Filet anti soft-lock : plus de fil, plus de stock, et liquidités
   * insuffisantes pour une bobine → bobine d'urgence offerte.
   */
  grantEmergencyWireIfSoftLocked(): boolean {
    const state = this.state;
    if (state.phase1Complete) return false;
    const liquid = state.funds + state.investmentFunds;
    if (state.wire >= 1 || state.unsold >= 1 || liquid >= state.wireCost) {
      return false;
    }
    state.wire += state.wirePerSpool;
    return true;
  }

  override update(deltaMs: number): void {
    this.grantEmergencyWireIfSoftLocked();
    this.clipsProducedDuringLastUpdate =
      this.produceClipsAutomatically(deltaMs);
    this.purchaseWireIfStockIsLow();
  }

  takeClipsProducedDuringLastUpdate(): number {
    const clips_produced = this.clipsProducedDuringLastUpdate;
    this.clipsProducedDuringLastUpdate = 0;
    return clips_produced;
  }
}
