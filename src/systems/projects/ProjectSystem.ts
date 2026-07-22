import type { GameState } from "../../state/GameState";
import type { Project } from "../../projects/Project";
import { createPhase1Projects } from "../../projects/data/phase1Projects";

/** Seuil de trombones avant d'ouvrir le panneau Projets. */
export const PROJECTS_UNLOCK_CLIPS = 2000;

export class ProjectSystem {
  private readonly catalog: Project[];

  constructor(private readonly state: GameState) {
    this.catalog = createPhase1Projects();
  }

  /**
   * Le plateau de projets se débloque après une vraie progression
   * (pas dès le premier trombone).
   */
  isProjectsBoardUnlocked(): boolean {
    const state = this.state;
    return state.clips >= PROJECTS_UNLOCK_CLIPS || state.trust > 2;
  }

  /** Projets visibles et pas encore réalisés (liste vide si plateau verrouillé). */
  getAvailableProjects(): Project[] {
    if (!this.isProjectsBoardUnlocked()) return [];
    return this.catalog.filter(
      (project) =>
        !this.state.hasCompletedProject(project.id) &&
        project.isVisible(this.state),
    );
  }

  /** Paie le coût, applique l'effet et marque le projet comme terminé. */
  activateProject(id: string): boolean {
    if (!this.isProjectsBoardUnlocked()) return false;
    const project = this.catalog.find((entry) => entry.id === id);
    if (!project) return false;
    if (this.state.hasCompletedProject(id)) return false;
    if (!project.isVisible(this.state)) return false;
    if (!project.cost.canAfford(this.state)) return false;

    project.cost.deductFrom(this.state);
    project.applyEffectTo(this.state);
    this.state.markProjectCompleted(id);
    return true;
  }
}
