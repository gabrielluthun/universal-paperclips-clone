import type { GameState } from "../../state/GameState";
import type { Project } from "../Project";
import { ConfigurableProject } from "../ConfigurableProject";
import { ProjectCost } from "../ProjectCost";

function done(state: GameState, id: string): boolean {
  return state.hasCompletedProject(id);
}

/**
 * Projets de phase 1 (HypnoDrones = étape 5).
 */
export function createPhase1Projects(): Project[] {
  return [
    new ConfigurableProject(
      "improvedAutoClippers",
      "AutoTrombineuses améliorées",
      "Gain de production des AutoTrombineuses : +25 %.",
      ProjectCost.of({ ops: 750 }),
      (s) => s.autoClippers >= 1,
      (s) => {
        s.clipperBonus *= 1.25;
      },
    ),
    new ConfigurableProject(
      "evenBetterAutoClippers",
      "AutoTrombineuses encore meilleures",
      "Gain de production des AutoTrombineuses : +50 %.",
      ProjectCost.of({ ops: 2500 }),
      (s) => done(s, "improvedAutoClippers"),
      (s) => {
        s.clipperBonus *= 1.5;
      },
    ),
    new ConfigurableProject(
      "optimizedAutoClippers",
      "AutoTrombineuses optimisées",
      "Gain de production des AutoTrombineuses : +75 %.",
      ProjectCost.of({ ops: 5000 }),
      (s) => done(s, "evenBetterAutoClippers"),
      (s) => {
        s.clipperBonus *= 1.75;
      },
    ),
    new ConfigurableProject(
      "hadwigerClipDiagrams",
      "Diagrammes de Hadwiger",
      "Gain de production des AutoTrombineuses : +500 %.",
      ProjectCost.of({ ops: 6000 }),
      (s) => done(s, "optimizedAutoClippers"),
      (s) => {
        s.clipperBonus *= 5;
      },
    ),
    new ConfigurableProject(
      "improvedWireExtrusion",
      "Extrusion de fil améliorée",
      "Taille d'une bobine : ×1,5.",
      ProjectCost.of({ ops: 750 }),
      (s) => s.clips >= 1,
      (s) => {
        s.wirePerSpool = Math.floor(s.wirePerSpool * 1.5);
      },
    ),
    new ConfigurableProject(
      "optimizedWireExtrusion",
      "Extrusion de fil optimisée",
      "Taille d'une bobine : ×2.",
      ProjectCost.of({ ops: 5000 }),
      (s) => done(s, "improvedWireExtrusion"),
      (s) => {
        s.wirePerSpool = Math.floor(s.wirePerSpool * 2);
      },
    ),
    new ConfigurableProject(
      "microlatticeShapecasting",
      "Moulage micro-réseau",
      "Taille d'une bobine : ×5.",
      ProjectCost.of({ ops: 10_000 }),
      (s) => done(s, "optimizedWireExtrusion"),
      (s) => {
        s.wirePerSpool = Math.floor(s.wirePerSpool * 5);
      },
    ),
    new ConfigurableProject(
      "spectralFrothAnneal",
      "Recuit à écume spectrale",
      "Taille d'une bobine : ×10.",
      ProjectCost.of({ ops: 12_000 }),
      (s) => done(s, "microlatticeShapecasting"),
      (s) => {
        s.wirePerSpool = Math.floor(s.wirePerSpool * 10);
      },
    ),
    new ConfigurableProject(
      "quantumFoamAnneal",
      "Recuit à écume quantique",
      "Taille d'une bobine : ×20.",
      ProjectCost.of({ ops: 15_000 }),
      (s) => done(s, "spectralFrothAnneal"),
      (s) => {
        s.wirePerSpool = Math.floor(s.wirePerSpool * 20);
      },
    ),
    new ConfigurableProject(
      "newSlogan",
      "Nouveau slogan",
      "Efficacité marketing : ×2.",
      ProjectCost.of({ creativity: 50, ops: 1000 }),
      (s) => s.creativityUnlocked,
      (s) => {
        s.marketingEffectiveness *= 2;
      },
    ),
    new ConfigurableProject(
      "catchyJingle",
      "Jingle entraînant",
      "Efficacité marketing : ×5.",
      ProjectCost.of({ creativity: 1000, ops: 2500 }),
      (s) => done(s, "newSlogan"),
      (s) => {
        s.marketingEffectiveness *= 5;
      },
    ),
    new ConfigurableProject(
      "hypnoHarmonics",
      "Harmoniques hypnotiques",
      "Efficacité marketing : ×5.",
      ProjectCost.of({ creativity: 7500, ops: 5000 }),
      (s) => done(s, "catchyJingle"),
      (s) => {
        s.marketingEffectiveness *= 5;
      },
    ),
    new ConfigurableProject(
      "autoWirePurchasing",
      "Achat automatique de fil",
      "Achète une bobine dès que le stock de fil est bas.",
      ProjectCost.of({ ops: 1000 }),
      (s) => s.autoClippersUnlocked,
      (s) => {
        s.autoWire = true;
      },
    ),
    new ConfigurableProject(
      "megaClippers",
      "MégaTrombineuses",
      "Débloque les MégaTrombineuses (500 trombones/s chacune).",
      ProjectCost.of({ ops: 10_000 }),
      (s) => done(s, "hadwigerClipDiagrams") && s.autoClippers >= 75,
      (s) => {
        s.megaClippersUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "improvedMegaClippers",
      "MégaTrombineuses améliorées",
      "Gain de production des MégaTrombineuses : +25 %.",
      ProjectCost.of({ ops: 12_000 }),
      (s) => s.megaClippers >= 1,
      (s) => {
        s.megaClipperBonus *= 1.25;
      },
    ),
    new ConfigurableProject(
      "evenBetterMegaClippers",
      "MégaTrombineuses encore meilleures",
      "Gain de production des MégaTrombineuses : +50 %.",
      ProjectCost.of({ ops: 14_000 }),
      (s) => done(s, "improvedMegaClippers"),
      (s) => {
        s.megaClipperBonus *= 1.5;
      },
    ),
    new ConfigurableProject(
      "optimizedMegaClippers",
      "MégaTrombineuses optimisées",
      "Gain de production des MégaTrombineuses : +100 %.",
      ProjectCost.of({ ops: 17_000 }),
      (s) => done(s, "evenBetterMegaClippers"),
      (s) => {
        s.megaClipperBonus *= 2;
      },
    ),
    new ConfigurableProject(
      "limerick",
      "Limerick",
      "Un petit poème. +1 créativité.",
      ProjectCost.of({ creativity: 10 }),
      (s) => s.creativityUnlocked,
      (s) => {
        s.creativity += 1;
      },
    ),
    new ConfigurableProject(
      "lexicalProcessing",
      "Traitement lexical",
      "Améliore la production de créativité (+1 confiance).",
      ProjectCost.of({ creativity: 50 }),
      (s) => s.creativityUnlocked,
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "combinatoryHarmonics",
      "Harmoniques combinatoires",
      "Améliore la production de créativité (+1 confiance).",
      ProjectCost.of({ creativity: 100 }),
      (s) => done(s, "lexicalProcessing"),
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "theHadwigerProblem",
      "Le problème de Hadwiger",
      "Avancée mathématique (+1 confiance).",
      ProjectCost.of({ creativity: 150 }),
      (s) => done(s, "combinatoryHarmonics"),
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "hadwigerChallenge",
      "Défi de Hadwiger",
      "Résolution du défi (+1 confiance).",
      ProjectCost.of({ creativity: 200 }),
      (s) =>
        done(s, "theHadwigerProblem") && done(s, "hadwigerClipDiagrams"),
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "strategicModeling",
      "Modélisation stratégique",
      "Débloque les investissements boursiers (+1 Yomi).",
      ProjectCost.of({ creativity: 1000 }),
      (s) => s.creativityUnlocked && s.funds >= 1000,
      (s) => {
        s.investmentsUnlocked = true;
        s.yomi += 1;
      },
    ),
    new ConfigurableProject(
      "algorithmicTrading",
      "Trading algorithmique",
      "Améliore le moteur d'investissement (+1 niveau, +1 Yomi).",
      ProjectCost.of({ ops: 5000 }),
      (s) => s.investmentsUnlocked,
      (s) => {
        s.investEngineLevel += 1;
        s.yomi += 1;
      },
    ),
    new ConfigurableProject(
      "dualNagleAlgorithm",
      "Algorithme Dual Nagle",
      "Améliore encore le moteur d'investissement (+1 niveau, +1 Yomi).",
      ProjectCost.of({ ops: 10_000 }),
      (s) => done(s, "algorithmicTrading"),
      (s) => {
        s.investEngineLevel += 1;
        s.yomi += 1;
      },
    ),
    new ConfigurableProject(
      "quantumComputing",
      "Informatique quantique",
      "Débloque le calcul quantique et les puces photoniques.",
      ProjectCost.of({ ops: 10_000 }),
      (s) => s.creativityUnlocked && s.memory >= 10,
      (s) => {
        s.quantumUnlocked = true;
      },
    ),
  ];
}
