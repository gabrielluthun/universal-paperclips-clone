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
  ];
}
