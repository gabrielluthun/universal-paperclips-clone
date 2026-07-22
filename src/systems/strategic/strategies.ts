/** Coup A = 1, coup B = 2 */
export type Move = 1 | 2;

export interface PayoffGrid {
  aa: number;
  ab: number;
  ba: number;
  bb: number;
}

export interface MatchContext {
  grid: PayoffGrid;
  /** 1 = joueur horizontal, 2 = joueur vertical. */
  myPos: 1 | 2;
  hMovePrev: Move;
  vMovePrev: Move;
  random?: () => number;
}

export type StrategyId =
  | "RANDOM"
  | "A100"
  | "B100"
  | "GREEDY"
  | "GENEROUS"
  | "MINIMAX"
  | "TIT_FOR_TAT"
  | "BEAT_LAST";

export interface StrategyDefinition {
  readonly id: StrategyId;
  readonly name: string;
  pickMove(ctx: MatchContext): Move;
}

/** Index du plus gros payoff : 1=AA, 2=AB, 3=BA, 4=BB. */
export function findBiggestPayoff(grid: PayoffGrid): 1 | 2 | 3 | 4 {
  const { aa, ab, ba, bb } = grid;
  if (aa >= ab && aa >= ba && aa >= bb) return 1;
  if (ab >= aa && ab >= ba && ab >= bb) return 2;
  if (ba >= aa && ba >= ab && ba >= bb) return 3;
  return 4;
}

/** Coup qui bat le dernier coup de l'adversaire (BEAT LAST). */
export function whatBeatsLast(ctx: MatchContext): Move {
  const { grid, myPos, hMovePrev, vMovePrev } = ctx;
  const { aa, ab, ba, bb } = grid;
  const oppPos: 1 | 2 = myPos === 1 ? 2 : 1;

  if (oppPos === 1 && hMovePrev === 1) return aa > ba ? 1 : 2;
  if (oppPos === 1 && hMovePrev === 2) return ab > bb ? 1 : 2;
  if (oppPos === 2 && vMovePrev === 1) return aa > ba ? 1 : 2;
  return ab > bb ? 1 : 2;
}

export const STRATEGY_CATALOG: readonly StrategyDefinition[] = [
  {
    id: "RANDOM",
    name: "RANDOM",
    pickMove(ctx) {
      const r = (ctx.random ?? Math.random)();
      return r < 0.5 ? 1 : 2;
    },
  },
  {
    id: "A100",
    name: "A100",
    pickMove() {
      return 1;
    },
  },
  {
    id: "B100",
    name: "B100",
    pickMove() {
      return 2;
    },
  },
  {
    id: "GREEDY",
    name: "GREEDY",
    pickMove(ctx) {
      const x = findBiggestPayoff(ctx.grid);
      return x < 3 ? 1 : 2;
    },
  },
  {
    id: "GENEROUS",
    name: "GENEROUS",
    pickMove(ctx) {
      const x = findBiggestPayoff(ctx.grid);
      return x === 1 || x === 3 ? 1 : 2;
    },
  },
  {
    id: "MINIMAX",
    name: "MINIMAX",
    pickMove(ctx) {
      const x = findBiggestPayoff(ctx.grid);
      return x === 1 || x === 3 ? 2 : 1;
    },
  },
  {
    id: "TIT_FOR_TAT",
    name: "TIT FOR TAT",
    pickMove(ctx) {
      return ctx.myPos === 1 ? ctx.vMovePrev : ctx.hMovePrev;
    },
  },
  {
    id: "BEAT_LAST",
    name: "BEAT LAST",
    pickMove(ctx) {
      return whatBeatsLast(ctx);
    },
  },
];

export function getStrategyDefinition(id: StrategyId): StrategyDefinition {
  const found = STRATEGY_CATALOG.find((s) => s.id === id);
  if (!found) throw new Error(`Stratégie inconnue : ${id}`);
  return found;
}

export const CHOICE_A_LABELS = [
  "coopérer",
  "dévier",
  "macro",
  "combattre",
  "miser",
  "hausser le prix",
  "opéra",
  "partir",
  "face",
  "particule",
  "discret",
  "paix",
  "chercher",
  "mener",
  "accepter",
  "attaquer",
] as const;

export const CHOICE_B_LABELS = [
  "trahir",
  "tout droit",
  "micro",
  "reculer",
  "se coucher",
  "baisser le prix",
  "football",
  "rester",
  "pile",
  "onde",
  "continu",
  "guerre",
  "évaluer",
  "suivre",
  "refuser",
  "décroître",
] as const;
