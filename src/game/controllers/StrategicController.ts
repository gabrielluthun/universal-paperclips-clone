import type { StrategicModelingSystem } from "../../systems/strategic/StrategicModelingSystem";
import type { StrategyId } from "../../systems/strategic/strategies";
import { requireElement } from "../../ui/dom";
import { bindClick } from "./bindClick";

/** Câble le plateau de modélisation stratégique (tournois, choix de stratégie). */
export class StrategicController {
  constructor(private readonly strategic: StrategicModelingSystem) {}

  bind(): void {
    bindClick("btn-run-tourney", () => this.strategic.runTournament());

    const stratPicker = requireElement<HTMLSelectElement>("strat-picker");
    stratPicker.addEventListener("change", (event) => {
      const value = (event.target as HTMLSelectElement).value as StrategyId;
      this.strategic.selectStrategy(value);
    });
  }
}
