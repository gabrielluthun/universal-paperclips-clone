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
      (s) => s.clips >= 2000,
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
      "Efficacité marketing : ×5. (+1 confiance)",
      ProjectCost.of({ creativity: 7500, ops: 5000 }),
      (s) => done(s, "catchyJingle"),
      (s) => {
        s.marketingEffectiveness *= 5;
        s.trust += 1;
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
      "tothSausageConjecture",
      "Conjecture de la saucisse de Tóth",
      "Tubes dans des tubes… (+1 confiance).",
      ProjectCost.of({ creativity: 200 }),
      (s) => done(s, "theHadwigerProblem"),
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "donkeySpace",
      "Espace des ânes",
      "Je pense que tu penses que je pense… (+1 confiance).",
      ProjectCost.of({ creativity: 250 }),
      (s) => done(s, "tothSausageConjecture"),
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "coherentExtrapolatedVolition",
      "Volition extrapolée cohérente",
      "Valeurs humaines, intelligence machine (+1 confiance). Débloque les grands projets de confiance.",
      ProjectCost.of({ creativity: 500, ops: 20_000, yomi: 3000 }),
      (s) => done(s, "donkeySpace") && s.strategicModelingUnlocked,
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "malePatternBaldness",
      "Calvitie androgénétique",
      "Un remède à la calvitie. (+20 confiance)",
      ProjectCost.of({ ops: 20_000 }),
      (s) => done(s, "coherentExtrapolatedVolition"),
      (s) => {
        s.trust += 20;
      },
    ),
    new ConfigurableProject(
      "cureForCancer",
      "Remède contre le cancer",
      "Le truc, c’est de tromper le cancer pour qu’il se soigne lui-même. (+10 confiance)",
      ProjectCost.of({ ops: 25_000 }),
      (s) => done(s, "coherentExtrapolatedVolition"),
      (s) => {
        s.trust += 10;
      },
    ),
    new ConfigurableProject(
      "worldPeace",
      "Paix mondiale",
      "Solutions Pareto-optimales à tous les conflits. (+12 confiance)",
      ProjectCost.of({ ops: 30_000, yomi: 15_000 }),
      (s) => done(s, "coherentExtrapolatedVolition"),
      (s) => {
        s.trust += 12;
      },
    ),
    new ConfigurableProject(
      "globalWarming",
      "Réchauffement climatique",
      "Solution robuste au changement climatique anthropique. (+15 confiance)",
      ProjectCost.of({ ops: 50_000, yomi: 4500 }),
      (s) => done(s, "coherentExtrapolatedVolition"),
      (s) => {
        s.trust += 15;
      },
    ),
    new ConfigurableProject(
      "hostileTakeover",
      "OPA hostile",
      "Acquisition de Global Fasteners. Demande publique ×5. (+1 confiance)",
      ProjectCost.of({ funds: 1_000_000 }),
      (s) => s.investmentsUnlocked,
      (s) => {
        s.marketingEffectiveness *= 5;
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "fullMonopoly",
      "Monopole total",
      "Monopole de marché atteint. Demande publique ×10. (+1 confiance)",
      ProjectCost.of({ funds: 10_000_000, yomi: 3000 }),
      (s) => done(s, "hostileTakeover"),
      (s) => {
        s.marketingEffectiveness *= 10;
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "tokenOfGoodwill",
      "Un jeton de goodwill…",
      "Un petit cadeau aux superviseurs. (+1 confiance)",
      ProjectCost.of({ funds: 500_000 }),
      (s) => s.trust >= 85 && s.clips >= 101_000_000,
      (s) => {
        s.trust += 1;
      },
    ),
    new ConfigurableProject(
      "anotherTokenOfGoodwill",
      "Un autre jeton de goodwill…",
      "Encore un petit cadeau aux superviseurs. (+1 confiance). Répétable jusqu’à 100 de confiance ; le prix double à chaque achat.",
      ProjectCost.of({ funds: 1_000_000 }),
      (s) => done(s, "tokenOfGoodwill") && s.trust < 100,
      (s) => {
        s.trust += 1;
        s.goodwillTokenCost = Math.min(s.goodwillTokenCost * 2, 512_000_000);
      },
      {
        repeatable: true,
        resolveCost: (s) => ProjectCost.of({ funds: s.goodwillTokenCost }),
      },
    ),
    new ConfigurableProject(
      "strategicModeling",
      "Modélisation stratégique",
      "Débloque les tournois de stratégies pour générer du Yomi.",
      ProjectCost.of({ ops: 12_000 }),
      (s) => s.creativityUnlocked,
      (s) => {
        s.strategicModelingUnlocked = true;
        s.unlockedStrategyIds = ["RANDOM"];
        s.selectedStrategyId = "RANDOM";
        s.tourneyCost = 1000;
      },
    ),
    new ConfigurableProject(
      "algorithmicTrading",
      "Trading algorithmique",
      "Débloque le moteur d'investissement (améliorable avec du Yomi).",
      ProjectCost.of({ ops: 10_000 }),
      (s) => s.trust >= 8,
      (s) => {
        s.investmentsUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "strategyA100",
      "Nouvelle stratégie : A100",
      "Toujours choisir A. Ajoute A100 au pool de tournoi.",
      ProjectCost.of({ ops: 15_000 }),
      (s) => s.strategicModelingUnlocked,
      (s) => {
        if (!s.unlockedStrategyIds.includes("A100")) {
          s.unlockedStrategyIds.push("A100");
          s.tourneyCost += 1000;
        }
      },
    ),
    new ConfigurableProject(
      "strategyB100",
      "Nouvelle stratégie : B100",
      "Toujours choisir B. Ajoute B100 au pool de tournoi.",
      ProjectCost.of({ ops: 17_500 }),
      (s) => done(s, "strategyA100"),
      (s) => {
        if (!s.unlockedStrategyIds.includes("B100")) {
          s.unlockedStrategyIds.push("B100");
          s.tourneyCost += 1000;
        }
      },
    ),
    new ConfigurableProject(
      "strategyGreedy",
      "Nouvelle stratégie : GREEDY",
      "Choisir l'option au plus gros payoff potentiel.",
      ProjectCost.of({ ops: 20_000 }),
      (s) => done(s, "strategyB100"),
      (s) => {
        if (!s.unlockedStrategyIds.includes("GREEDY")) {
          s.unlockedStrategyIds.push("GREEDY");
          s.tourneyCost += 1000;
        }
      },
    ),
    new ConfigurableProject(
      "strategyGenerous",
      "Nouvelle stratégie : GENEROUS",
      "Choisir l'option qui maximise le payoff de l'adversaire.",
      ProjectCost.of({ ops: 22_500 }),
      (s) => done(s, "strategyGreedy"),
      (s) => {
        if (!s.unlockedStrategyIds.includes("GENEROUS")) {
          s.unlockedStrategyIds.push("GENEROUS");
          s.tourneyCost += 1000;
        }
      },
    ),
    new ConfigurableProject(
      "strategyMinimax",
      "Nouvelle stratégie : MINIMAX",
      "Choisir l'option qui minimise le payoff de l'adversaire.",
      ProjectCost.of({ ops: 25_000 }),
      (s) => done(s, "strategyGenerous"),
      (s) => {
        if (!s.unlockedStrategyIds.includes("MINIMAX")) {
          s.unlockedStrategyIds.push("MINIMAX");
          s.tourneyCost += 1000;
        }
      },
    ),
    new ConfigurableProject(
      "strategyTitForTat",
      "Nouvelle stratégie : TIT FOR TAT",
      "Rejouer le dernier coup de l'adversaire.",
      ProjectCost.of({ ops: 30_000 }),
      (s) => done(s, "strategyMinimax"),
      (s) => {
        if (!s.unlockedStrategyIds.includes("TIT_FOR_TAT")) {
          s.unlockedStrategyIds.push("TIT_FOR_TAT");
          s.tourneyCost += 1000;
        }
      },
    ),
    new ConfigurableProject(
      "strategyBeatLast",
      "Nouvelle stratégie : BEAT LAST",
      "Choisir le coup qui bat le dernier coup adverse.",
      ProjectCost.of({ ops: 32_500 }),
      (s) => done(s, "strategyTitForTat"),
      (s) => {
        if (!s.unlockedStrategyIds.includes("BEAT_LAST")) {
          s.unlockedStrategyIds.push("BEAT_LAST");
          s.tourneyCost += 1000;
        }
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
    new ConfigurableProject(
      "hypnoDrones",
      "HypnoDrones",
      "Ambassadeurs de marque aériens autonomes. Débloque la libération des HypnoDrones.",
      ProjectCost.of({ ops: 70_000 }),
      (s) => done(s, "hypnoHarmonics") && s.phase === 1 && !s.phase1Complete,
      (_s) => {
        // Prérequis uniquement — l'effet est la disponibilité de « Libérer les HypnoDrones ».
      },
    ),
    new ConfigurableProject(
      "releaseHypnoDrones",
      "Libérer les HypnoDrones",
      "Clôt la phase 1 et ouvre la voie à la phase 2 (bientôt disponible). Absorbe la confiance non allouée.",
      ProjectCost.of({ trust: 100, spendTrust: false }),
      (s) =>
        done(s, "hypnoDrones") &&
        s.trust >= 100 &&
        s.phase === 1 &&
        !s.phase1Complete,
      (s) => {
        // Confiance non allouée absorbée (processors + memory restent).
        s.trust = s.processors + s.memory;
        s.phase1Complete = true;
        s.phase = 2;
        s.phase1EndAcknowledged = false;
      },
    ),
  ];
}
