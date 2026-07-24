import type { Project } from "../Project";
import { ConfigurableProject } from "../ConfigurableProject";
import { ProjectCost } from "../ProjectCost";

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
  ];
}
