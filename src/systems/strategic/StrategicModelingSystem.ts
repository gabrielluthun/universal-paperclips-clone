import type { GameState } from "../../state/GameState";
import { GameSystem } from "../core/GameSystem";
import {
  CHOICE_A_LABELS,
  CHOICE_B_LABELS,
  STRATEGY_CATALOG,
  getStrategyDefinition,
  type Move,
  type PayoffGrid,
  type StrategyId,
} from "./strategies";

/** Itérations par appariement de stratégies (comme l'original). */
const ITERATIONS_PER_PAIRING = 10;

const STRATEGY_IDS = new Set<string>(STRATEGY_CATALOG.map((s) => s.id));

export interface TourneyResultRow {
  id: StrategyId;
  name: string;
  score: number;
}

/**
 * Tournois Strategic Modeling : dépense d'ops → Yomi selon la stratégie choisie.
 */
export class StrategicModelingSystem extends GameSystem {
  constructor(state: GameState) {
    super(state);
  }

  override update(_deltaMs: number): void {
    // Tournois déclenchés manuellement par le joueur.
  }

  getUnlockedStrategies(): StrategyId[] {
    return this.state.unlockedStrategyIds.filter((id): id is StrategyId =>
      STRATEGY_IDS.has(id),
    );
  }

  getTourneyCost(): number {
    return this.state.tourneyCost;
  }

  unlockStrategy(id: StrategyId): void {
    const s = this.state;
    if (s.unlockedStrategyIds.includes(id)) return;
    s.unlockedStrategyIds.push(id);
    s.tourneyCost += 1000;
    if (!s.unlockedStrategyIds.includes(s.selectedStrategyId)) {
      s.selectedStrategyId = id;
    }
  }

  selectStrategy(id: StrategyId): boolean {
    if (!this.state.strategicModelingUnlocked) return false;
    if (!this.state.unlockedStrategyIds.includes(id)) return false;
    this.state.selectedStrategyId = id;
    return true;
  }

  canRunTournament(): boolean {
    const s = this.state;
    return (
      s.strategicModelingUnlocked &&
      s.unlockedStrategyIds.length > 0 &&
      s.ops >= s.tourneyCost
    );
  }

  /**
   * Lance un tournoi instantané : grille aléatoire, tous les appariements,
   * Yomi = score × max(1, stratégies battues) × yomiBoost.
   */
  runTournament(random: () => number = Math.random): number {
    const s = this.state;
    if (!this.canRunTournament()) return 0;

    const unlocked = this.getUnlockedStrategies();
    if (unlocked.length === 0) return 0;
    const pool = unlocked.map((id) => getStrategyDefinition(id));
    s.ops -= s.tourneyCost;

    const grid = this.generateGrid(random);
    s.tourneyPayoff = { ...grid };
    const labelIndex = Math.floor(random() * CHOICE_A_LABELS.length);
    s.tourneyChoiceA = CHOICE_A_LABELS[labelIndex] ?? "A";
    s.tourneyChoiceB = CHOICE_B_LABELS[labelIndex] ?? "B";

    const scores = new Map<StrategyId, number>();
    for (const strat of pool) scores.set(strat.id, 0);

    const n = pool.length;
    for (let h = 0; h < n; h++) {
      for (let v = 0; v < n; v++) {
        this.playPairing(pool[h]!.id, pool[v]!.id, grid, scores, random);
      }
    }

    const ranked: TourneyResultRow[] = pool
      .map((strat) => ({
        id: strat.id,
        name: strat.name,
        score: scores.get(strat.id) ?? 0,
      }))
      .sort((a, b) => b.score - a.score);

    s.tourneyResults = ranked;

    const pickId = s.selectedStrategyId;
    const pick = ranked.find((row) => row.id === pickId);
    if (!pick) {
      s.lastTourneyYomiGained = 0;
      return 0;
    }

    const beaten = ranked.filter((row) => row.score < pick.score).length;
    const multiplier = Math.max(1, beaten);
    const gained = Math.floor(pick.score * multiplier * s.yomiBoost);
    s.yomi += gained;
    s.lastTourneyYomiGained = gained;
    return gained;
  }

  private generateGrid(random: () => number): PayoffGrid {
    return {
      aa: Math.ceil(random() * 10),
      ab: Math.ceil(random() * 10),
      ba: Math.ceil(random() * 10),
      bb: Math.ceil(random() * 10),
    };
  }

  private playPairing(
    hId: StrategyId,
    vId: StrategyId,
    grid: PayoffGrid,
    scores: Map<StrategyId, number>,
    random: () => number,
  ): void {
    const hStrat = getStrategyDefinition(hId);
    const vStrat = getStrategyDefinition(vId);
    let hMovePrev: Move = 1;
    let vMovePrev: Move = 1;

    for (let i = 0; i < ITERATIONS_PER_PAIRING; i++) {
      const hMove = hStrat.pickMove({
        grid,
        myPos: 1,
        hMovePrev,
        vMovePrev,
        random,
      });
      const vMove = vStrat.pickMove({
        grid,
        myPos: 2,
        hMovePrev,
        vMovePrev,
        random,
      });
      this.applyPayoff(hId, vId, hMove, vMove, grid, scores);
      hMovePrev = hMove;
      vMovePrev = vMove;
    }
  }

  private applyPayoff(
    hId: StrategyId,
    vId: StrategyId,
    hMove: Move,
    vMove: Move,
    grid: PayoffGrid,
    scores: Map<StrategyId, number>,
  ): void {
    let hGain = 0;
    let vGain = 0;
    if (hMove === 1 && vMove === 1) {
      hGain = grid.aa;
      vGain = grid.aa;
    } else if (hMove === 1 && vMove === 2) {
      hGain = grid.ab;
      vGain = grid.ba;
    } else if (hMove === 2 && vMove === 1) {
      hGain = grid.ba;
      vGain = grid.ab;
    } else {
      hGain = grid.bb;
      vGain = grid.bb;
    }
    scores.set(hId, (scores.get(hId) ?? 0) + hGain);
    scores.set(vId, (scores.get(vId) ?? 0) + vGain);
  }
}
