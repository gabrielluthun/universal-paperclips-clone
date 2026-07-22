import type { RenderModel } from "./RenderModel";
import { BusinessPanel } from "./panels/BusinessPanel";
import { ComputePanel } from "./panels/ComputePanel";
import { InvestmentsPanel } from "./panels/InvestmentsPanel";
import { PhasePanel } from "./panels/PhasePanel";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { QuantumPanel } from "./panels/QuantumPanel";
import { StrategicPanel } from "./panels/StrategicPanel";

export type { RenderModel } from "./RenderModel";

/** Orchestre le rendu de tous les panneaux UI. */
export class Renderer {
  private readonly phase = new PhasePanel();
  private readonly business = new BusinessPanel();
  private readonly compute = new ComputePanel();
  private readonly strategic = new StrategicPanel();
  private readonly investments = new InvestmentsPanel();
  private readonly quantum = new QuantumPanel();
  private readonly projects = new ProjectsPanel();

  render(model: RenderModel): void {
    this.phase.render(model);
    this.business.render(model);
    this.compute.render(model);
    this.strategic.render(model);
    this.investments.render(model);
    this.quantum.render(model);
    this.projects.render(model);
  }
}
