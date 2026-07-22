import { requireElement } from "../dom";
import type { RenderModel } from "../RenderModel";

export class ProjectsPanel {
  private lastSignature = "";
  private readonly panel = requireElement<HTMLElement>("panel-projects");
  private readonly list = requireElement<HTMLDivElement>("projects-list");

  render(model: RenderModel): void {
    this.panel.hidden = !model.projects.isProjectsBoardUnlocked();
    this.renderCards(model);
  }

  private renderCards(model: RenderModel): void {
    const available = model.projects.getAvailableProjects();
    const signature = available
      .map((p) => {
        const cost = p.getCost(model.state);
        return `${p.id}:${cost.canAfford(model.state) ? 1 : 0}:${cost.toDisplayString()}`;
      })
      .join("|");

    if (signature === this.lastSignature) {
      for (const project of available) {
        const btn = document.getElementById(
          `project-${project.id}`,
        ) as HTMLButtonElement | null;
        if (btn) {
          btn.disabled = !project.getCost(model.state).canAfford(model.state);
        }
      }
      return;
    }
    this.lastSignature = signature;

    this.list.replaceChildren();

    if (available.length === 0) {
      const empty = document.createElement("p");
      empty.className = "col-span-full text-[0.9em] text-muted";
      empty.textContent = "Aucun projet disponible pour l’instant.";
      this.list.appendChild(empty);
      return;
    }

    for (const project of available) {
      const card = document.createElement("div");
      card.className = "project-card";

      const title = document.createElement("h3");
      title.textContent = project.title;

      const desc = document.createElement("p");
      desc.textContent = project.description;

      const projectCost = project.getCost(model.state);
      const cost = document.createElement("div");
      cost.className = "project-cost";
      cost.textContent = projectCost.toDisplayString() || "Gratuit";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = `project-${project.id}`;
      btn.textContent = "Activer";
      btn.disabled = !projectCost.canAfford(model.state);
      btn.addEventListener("click", () => model.activateProject(project.id));

      card.append(title, desc, cost, btn);
      this.list.appendChild(card);
    }
  }
}
