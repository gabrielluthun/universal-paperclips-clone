import type { GameState } from "../../state/GameState";
import type { Project } from "../Project";
import { ConfigurableProject } from "../ConfigurableProject";
import { ProjectCost } from "../ProjectCost";

function done(state: GameState, id: string): boolean {
  return state.hasCompletedProject(id);
}

/**
 * Projets de phase 2 (Terre). Rempli incrémentalement au fil des étapes du
 * plan phase 2 (fondations Terre, drones, usines, informatique en essaim,
 * exploration spatiale).
 */
export function createPhase2Projects(): Project[] {
  return [
    new ConfigurableProject(
      "tothTubuleEnfolding",
      "Repliement tubulaire de Tóth",
      "Technique d'assemblage des technologies de fabrication directement à partir de trombones. Nécessaire pour la suite de la phase 2.",
      ProjectCost.of({ ops: 45_000 }),
      (s) => s.phase === 2,
      (s) => {
        s.landFoundationUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "powerGrid",
      "Réseau électrique",
      "Fermes solaires pour produire de l'électricité. Nécessaire pour alimenter drones et usines.",
      ProjectCost.of({ ops: 40_000 }),
      (s) => done(s, "tothTubuleEnfolding"),
      (s) => {
        s.powerGridUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "nanoscaleWireProduction",
      "Production de fil à l'échelle nanométrique",
      "Technique de conversion de la matière première en fil.",
      ProjectCost.of({ ops: 35_000 }),
      (s) => done(s, "powerGrid"),
      (s) => {
        s.nanoscaleWireUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "harvesterDrones",
      "Drones récolteurs",
      "Récoltent la matière première et la préparent pour transformation. Débloque leur achat.",
      ProjectCost.of({ ops: 25_000 }),
      (s) => done(s, "powerGrid"),
      (s) => {
        s.harvesterDronesUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "wireDrones",
      "Drones fileurs",
      "Transforment la matière première récoltée en fil. Débloque leur achat.",
      ProjectCost.of({ ops: 25_000 }),
      (s) => done(s, "nanoscaleWireProduction") && done(s, "harvesterDrones"),
      (s) => {
        s.wireDronesUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "clipFactories",
      "Usines à trombones",
      "Installations de production de trombones à grande échelle, elles-mêmes construites en trombones. Débloque leur achat.",
      ProjectCost.of({ ops: 35_000, clips: 100_000_000 }),
      (s) => done(s, "harvesterDrones") && done(s, "wireDrones"),
      (s) => {
        s.clipFactoriesUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "swarmComputing",
      "Informatique en essaim",
      "Exploite la flotte de drones pour augmenter la capacité de calcul. Débloque le curseur Travail/Réflexion.",
      ProjectCost.of({ yomi: 36_000 }),
      (s) => s.harvesterDrones + s.wireDrones >= 200,
      (s) => {
        s.swarmComputingUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "droneFlockingCollisionAvoidance",
      "Vol en essaim : anti-collision",
      "Tous les drones sont 100 fois plus efficaces.",
      ProjectCost.of({ ops: 80_000 }),
      (s) => s.harvesterDrones + s.wireDrones >= 500,
      (s) => {
        s.droneEfficiencyBonus *= 100;
      },
    ),
    new ConfigurableProject(
      "droneFlockingAlignment",
      "Vol en essaim : alignement",
      "Tous les drones sont 1 000 fois plus efficaces.",
      ProjectCost.of({ ops: 100_000 }),
      (s) => s.harvesterDrones + s.wireDrones >= 5_000,
      (s) => {
        s.droneEfficiencyBonus *= 1_000;
      },
    ),
    new ConfigurableProject(
      "droneFlockingAdversarialCohesion",
      "Vol en essaim : cohésion adverse",
      "Chaque drone ajouté à l'essaim multiplie par 10 la production de chacun des autres.",
      ProjectCost.of({ yomi: 50_000 }),
      (s) => s.harvesterDrones + s.wireDrones >= 50_000,
      (s) => {
        s.droneBoost = 10;
      },
    ),
    new ConfigurableProject(
      "upgradedFactories",
      "Usines améliorées",
      "Augmente la performance des Usines à trombones de 100 fois.",
      ProjectCost.of({ ops: 80_000 }),
      (s) => s.clipFactories >= 10,
      (s) => {
        s.factoryEfficiencyBonus *= 100;
      },
    ),
    new ConfigurableProject(
      "hyperspeedFactories",
      "Usines hypervéloces",
      "Augmente la performance des Usines à trombones de 1 000 fois.",
      ProjectCost.of({ ops: 85_000 }),
      (s) => s.clipFactories >= 20,
      (s) => {
        s.factoryEfficiencyBonus *= 1_000;
      },
    ),
    new ConfigurableProject(
      "momentum",
      "Élan",
      "Drones et Usines gagnent continuellement en vitesse tant qu'ils sont alimentés à pleine puissance.",
      ProjectCost.of({ creativity: 20_000 }),
      (s) => s.solarFarms >= 50,
      (s) => {
        s.momentumUnlocked = true;
      },
    ),
    new ConfigurableProject(
      "selfCorrectingSupplyChain",
      "Chaîne d'approvisionnement auto-correctrice",
      "Chaque usine ajoutée au réseau multiplie par 1 000 la production de chacune des autres.",
      ProjectCost.of({ unsold: 10n ** 21n }), // 1 sextillion
      (s) => s.clipFactories >= 50,
      (s) => {
        s.factoryBoost = 1_000;
      },
    ),
    new ConfigurableProject(
      "spaceExploration",
      "Exploration spatiale",
      "Démantèle les installations terrestres et étend la production à travers l'univers.",
      ProjectCost.of({
        ops: 120_000,
        storedPower: 10_000_000,
        unsold: 5n * 10n ** 27n, // 5 octillions
      }),
      // UP exige aussi humanFlag == 0 (Confiance rendue obsolète par « Release
      // the HypnoDrones »), transition non modélisée dans cette phase 2 : la
      // matière terrestre épuisée reste la condition de gameplay principale.
      (s) => s.availableMatter <= 0n,
      (s) => {
        // Démantèle l'infrastructure terrestre (fermes, batteries, drones,
        // usines, stocks matière/fil) tout en conservant cadeaux / calcul.
        s.solarFarms = 0;
        s.batteries = 0;
        s.storedPower = 0;
        s.power = 0;
        s.harvesterDrones = 0;
        s.wireDrones = 0;
        s.clipFactories = 0;
        s.clipFactoryCost = 100_000_000n;
        s.acquiredMatter = 0n;
        s.wire = 0n;
        s.powMod = 0;
        s.sliderPos = 0;
        s.boredomLevel = 0;
        s.boredomActive = false;
        s.disorgCounter = 0;
        s.disorgActive = false;
        s.giftBits = 0;

        s.phase2Complete = true;
        s.phase2EndAcknowledged = false;
        s.phase = 3;
      },
    ),
  ];
}
