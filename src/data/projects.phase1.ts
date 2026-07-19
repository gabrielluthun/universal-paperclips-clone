import type { GameState } from "../state";

export interface ProjectCost {
  ops?: number;
  creativity?: number;
  trust?: number;
  funds?: number;
}

export interface ProjectDef {
  id: string;
  title: string;
  description: string;
  cost: ProjectCost;
  visible: (state: GameState) => boolean;
  effect: (state: GameState) => void;
}

function done(state: GameState, id: string): boolean {
  return state.completedProjects.includes(id);
}

/**
 * Projets de phase 1 (hors bourse, quantique et HypnoDrones — étapes 4/5).
 * Conditions d'apparition volontairement proches de l'original.
 */
export const PHASE1_PROJECTS: ProjectDef[] = [
  {
    id: "improvedAutoClippers",
    title: "AutoTrombineuses améliorées",
    description: "Gain de production des AutoTrombineuses : +25 %.",
    cost: { ops: 750 },
    visible: (s) => s.autoClippers >= 1,
    effect: (s) => {
      s.clipperBonus *= 1.25;
    },
  },
  {
    id: "evenBetterAutoClippers",
    title: "AutoTrombineuses encore meilleures",
    description: "Gain de production des AutoTrombineuses : +50 %.",
    cost: { ops: 2500 },
    visible: (s) => done(s, "improvedAutoClippers"),
    effect: (s) => {
      s.clipperBonus *= 1.5;
    },
  },
  {
    id: "optimizedAutoClippers",
    title: "AutoTrombineuses optimisées",
    description: "Gain de production des AutoTrombineuses : +75 %.",
    cost: { ops: 5000 },
    visible: (s) => done(s, "evenBetterAutoClippers"),
    effect: (s) => {
      s.clipperBonus *= 1.75;
    },
  },
  {
    id: "hadwigerClipDiagrams",
    title: "Diagrammes de Hadwiger",
    description: "Gain de production des AutoTrombineuses : +500 %.",
    cost: { ops: 6000 },
    visible: (s) => done(s, "optimizedAutoClippers"),
    effect: (s) => {
      s.clipperBonus *= 5;
    },
  },
  {
    id: "improvedWireExtrusion",
    title: "Extrusion de fil améliorée",
    description: "Taille d'une bobine : ×1,5.",
    cost: { ops: 750 },
    visible: (s) => s.clips >= 1,
    effect: (s) => {
      s.wirePerSpool = Math.floor(s.wirePerSpool * 1.5);
    },
  },
  {
    id: "optimizedWireExtrusion",
    title: "Extrusion de fil optimisée",
    description: "Taille d'une bobine : ×2.",
    cost: { ops: 5000 },
    visible: (s) => done(s, "improvedWireExtrusion"),
    effect: (s) => {
      s.wirePerSpool = Math.floor(s.wirePerSpool * 2);
    },
  },
  {
    id: "microlatticeShapecasting",
    title: "Moulage micro-réseau",
    description: "Taille d'une bobine : ×5.",
    cost: { ops: 10_000 },
    visible: (s) => done(s, "optimizedWireExtrusion"),
    effect: (s) => {
      s.wirePerSpool = Math.floor(s.wirePerSpool * 5);
    },
  },
  {
    id: "spectralFrothAnneal",
    title: "Recuit à écume spectrale",
    description: "Taille d'une bobine : ×10.",
    cost: { ops: 12_000 },
    visible: (s) => done(s, "microlatticeShapecasting"),
    effect: (s) => {
      s.wirePerSpool = Math.floor(s.wirePerSpool * 10);
    },
  },
  {
    id: "quantumFoamAnneal",
    title: "Recuit à écume quantique",
    description: "Taille d'une bobine : ×20.",
    cost: { ops: 15_000 },
    visible: (s) => done(s, "spectralFrothAnneal"),
    effect: (s) => {
      s.wirePerSpool = Math.floor(s.wirePerSpool * 20);
    },
  },
  {
    id: "newSlogan",
    title: "Nouveau slogan",
    description: "Efficacité marketing : ×2.",
    cost: { creativity: 50, ops: 1000 },
    visible: (s) => s.creativityUnlocked,
    effect: (s) => {
      s.marketingEffectiveness *= 2;
    },
  },
  {
    id: "catchyJingle",
    title: "Jingle entraînant",
    description: "Efficacité marketing : ×5.",
    cost: { creativity: 1000, ops: 2500 },
    visible: (s) => done(s, "newSlogan"),
    effect: (s) => {
      s.marketingEffectiveness *= 5;
    },
  },
  {
    id: "hypnoHarmonics",
    title: "Harmoniques hypnotiques",
    description: "Efficacité marketing : ×5.",
    cost: { creativity: 7500, ops: 5000 },
    visible: (s) => done(s, "catchyJingle"),
    effect: (s) => {
      s.marketingEffectiveness *= 5;
    },
  },
  {
    id: "autoWirePurchasing",
    title: "Achat automatique de fil",
    description: "Achète une bobine dès que le stock de fil est bas.",
    cost: { ops: 1000 },
    visible: (s) => s.autoClippersUnlocked,
    effect: (s) => {
      s.autoWire = true;
    },
  },
  {
    id: "megaClippers",
    title: "MégaTrombineuses",
    description: "Débloque les MégaTrombineuses (500 trombones/s chacune).",
    cost: { ops: 10_000 },
    visible: (s) => done(s, "hadwigerClipDiagrams") && s.autoClippers >= 75,
    effect: (s) => {
      s.megaClippersUnlocked = true;
    },
  },
  {
    id: "improvedMegaClippers",
    title: "MégaTrombineuses améliorées",
    description: "Gain de production des MégaTrombineuses : +25 %.",
    cost: { ops: 12_000 },
    visible: (s) => s.megaClippers >= 1,
    effect: (s) => {
      s.megaClipperBonus *= 1.25;
    },
  },
  {
    id: "evenBetterMegaClippers",
    title: "MégaTrombineuses encore meilleures",
    description: "Gain de production des MégaTrombineuses : +50 %.",
    cost: { ops: 14_000 },
    visible: (s) => done(s, "improvedMegaClippers"),
    effect: (s) => {
      s.megaClipperBonus *= 1.5;
    },
  },
  {
    id: "optimizedMegaClippers",
    title: "MégaTrombineuses optimisées",
    description: "Gain de production des MégaTrombineuses : +100 %.",
    cost: { ops: 17_000 },
    visible: (s) => done(s, "evenBetterMegaClippers"),
    effect: (s) => {
      s.megaClipperBonus *= 2;
    },
  },
  {
    id: "limerick",
    title: "Limerick",
    description: "Un petit poème. +1 créativité.",
    cost: { creativity: 10 },
    visible: (s) => s.creativityUnlocked,
    effect: (s) => {
      s.creativity += 1;
    },
  },
  {
    id: "lexicalProcessing",
    title: "Traitement lexical",
    description: "Améliore la production de créativité (+1 confiance).",
    cost: { creativity: 50 },
    visible: (s) => s.creativityUnlocked,
    effect: (s) => {
      s.trust += 1;
    },
  },
  {
    id: "combinatoryHarmonics",
    title: "Harmoniques combinatoires",
    description: "Améliore la production de créativité (+1 confiance).",
    cost: { creativity: 100 },
    visible: (s) => done(s, "lexicalProcessing"),
    effect: (s) => {
      s.trust += 1;
    },
  },
  {
    id: "theHadwigerProblem",
    title: "Le problème de Hadwiger",
    description: "Avancée mathématique (+1 confiance).",
    cost: { creativity: 150 },
    visible: (s) => done(s, "combinatoryHarmonics"),
    effect: (s) => {
      s.trust += 1;
    },
  },
  {
    id: "hadwigerChallenge",
    title: "Défi de Hadwiger",
    description: "Résolution du défi (+1 confiance).",
    cost: { creativity: 200 },
    visible: (s) => done(s, "theHadwigerProblem") && done(s, "hadwigerClipDiagrams"),
    effect: (s) => {
      s.trust += 1;
    },
  },
];
