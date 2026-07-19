import type { GameState } from "../state";
import { PHASE1_PROJECTS, type ProjectCost, type ProjectDef } from "../data/projects.phase1";

export function isCompleted(state: GameState, id: string): boolean {
  return state.completedProjects.includes(id);
}

export function canAfford(state: GameState, cost: ProjectCost): boolean {
  if (cost.ops !== undefined && state.ops < cost.ops) return false;
  if (cost.creativity !== undefined && state.creativity < cost.creativity) return false;
  if (cost.trust !== undefined && state.trust < cost.trust) return false;
  if (cost.funds !== undefined && state.funds < cost.funds) return false;
  return true;
}

function pay(state: GameState, cost: ProjectCost): void {
  if (cost.ops !== undefined) state.ops -= cost.ops;
  if (cost.creativity !== undefined) state.creativity -= cost.creativity;
  if (cost.trust !== undefined) state.trust -= cost.trust;
  if (cost.funds !== undefined) state.funds -= cost.funds;
}

/** Projets visibles et non encore réalisés. */
export function visibleProjects(state: GameState): ProjectDef[] {
  return PHASE1_PROJECTS.filter(
    (p) => !isCompleted(state, p.id) && p.visible(state),
  );
}

export function activateProject(state: GameState, id: string): boolean {
  const project = PHASE1_PROJECTS.find((p) => p.id === id);
  if (!project) return false;
  if (isCompleted(state, id)) return false;
  if (!project.visible(state)) return false;
  if (!canAfford(state, project.cost)) return false;

  pay(state, project.cost);
  project.effect(state);
  state.completedProjects.push(id);
  return true;
}

export function formatCost(cost: ProjectCost): string {
  const parts: string[] = [];
  if (cost.ops !== undefined) {
    parts.push(`${cost.ops.toLocaleString("fr-FR")} ops`);
  }
  if (cost.creativity !== undefined) {
    parts.push(`${cost.creativity.toLocaleString("fr-FR")} créat.`);
  }
  if (cost.trust !== undefined) {
    parts.push(`${cost.trust.toLocaleString("fr-FR")} confiance`);
  }
  if (cost.funds !== undefined) {
    parts.push(
      `${cost.funds.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} $`,
    );
  }
  return parts.join(" · ");
}
