import type { GameState } from "../state/GameState";
import type { ComputeSystem } from "../systems/compute/ComputeSystem";
import type { InvestmentSystem } from "../systems/invest/InvestmentSystem";
import type { ProductionSystem } from "../systems/production/ProductionSystem";
import type { ProjectSystem } from "../systems/projects/ProjectSystem";
import type { QuantumSystem } from "../systems/quantum/QuantumSystem";
import type { StrategicModelingSystem } from "../systems/strategic/StrategicModelingSystem";
import type { MarketSystem } from "../systems/market/MarketSystem";

/** Contrat minimal attendu par le rendu (évite d'importer Game). */
export interface RenderModel {
  readonly state: GameState;
  readonly production: ProductionSystem;
  readonly market: MarketSystem;
  readonly compute: ComputeSystem;
  readonly projects: ProjectSystem;
  readonly investments: InvestmentSystem;
  readonly strategic: StrategicModelingSystem;
  readonly quantum: QuantumSystem;
  readonly clipRate: number;
  readonly avgRev: number;
  activateProject(id: string): void;
  acknowledgePhase1End(): void;
}
