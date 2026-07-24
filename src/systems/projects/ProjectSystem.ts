import type { GameState } from "../../state/GameState";
import type { Project } from "../../projects/Project";
import { createPhase1Projects } from "../../projects/data/phase1Projects";
import { createPhase2Projects } from "../../projects/data/phase2Projects";

/** Seuil de trombones avant d'ouvrir le panneau Projets. */
export const PROJECTS_UNLOCK_CLIPS = 2000n;

export class ProjectSystem {
  private readonly phase1Catalog: Project[];
  private readonly phase2Catalog: Project[];

  constructor(private readonly state: GameState) {
    this.phase1Catalog = createPhase1Projects();
    this.phase2Catalog = createPhase2Projects();
  }

  /** Catalogue actif pour la phase courante (la phase change en cours de partie). */
  private get catalog(): Project[] {
    return this.state.phase === 1 ? this.phase1Catalog : this.phase2Catalog;
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
    return this.catalog.filter((project) => {
      if (project.marksAsCompleted() && this.state.hasCompletedProject(project.id)) {
        return false;
      }
      return project.isVisible(this.state);
    });
  }

  /** Paie le coût, applique l'effet et marque le projet comme terminé (sauf répétables). */
  activateProject(id: string): boolean {
    if (!this.isProjectsBoardUnlocked()) return false;
    const project = this.catalog.find((entry) => entry.id === id);
    if (!project) return false;
    if (project.marksAsCompleted() && this.state.hasCompletedProject(id)) {
      return false;
    }
    if (!project.isVisible(this.state)) return false;

    const cost = project.getCost(this.state);
    if (!cost.canAfford(this.state)) return false;

    cost.deductFrom(this.state);
    project.applyEffectTo(this.state);
    if (project.marksAsCompleted()) {
      this.state.markProjectCompleted(id);
    }
    return true;
  }
}
