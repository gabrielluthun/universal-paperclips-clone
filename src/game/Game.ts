import { GameState } from "../state/GameState";
import { SaveManager } from "../state/SaveManager";
import { ComputeSystem } from "../systems/compute/ComputeSystem";
import type { GameSystem } from "../systems/core/GameSystem";
import { InvestmentSystem } from "../systems/invest/InvestmentSystem";
import { MarketSystem } from "../systems/market/MarketSystem";
import { ProductionSystem } from "../systems/production/ProductionSystem";
import { ProjectSystem } from "../systems/projects/ProjectSystem";
import { QuantumSystem } from "../systems/quantum/QuantumSystem";
import { StrategicModelingSystem } from "../systems/strategic/StrategicModelingSystem";
import { Renderer } from "../ui/Renderer";
import { TitleScreen } from "../ui/TitleScreen";
import { ComputeController } from "./controllers/ComputeController";
import { InvestmentsController } from "./controllers/InvestmentsController";
import { MarketController } from "./controllers/MarketController";
import { PhaseController } from "./controllers/PhaseController";
import { ProductionController } from "./controllers/ProductionController";
import { QuantumController } from "./controllers/QuantumController";
import { StrategicController } from "./controllers/StrategicController";
import { GameLifecycle } from "./GameLifecycle";
import { GameLoop } from "./GameLoop";
import { GameStats } from "./GameStats";

const TICK_MS = 100;
const AUTOSAVE_MS = 10_000;
const AUTOCLIPPER_UNLOCK_FUNDS = 5;

/** Orchestrateur : construit systèmes, boucle, sauvegarde et rendu, et les relie entre eux. */
export class Game {
  readonly state: GameState;
  readonly compute: ComputeSystem;
  readonly production: ProductionSystem;
  readonly market: MarketSystem;
  readonly projects: ProjectSystem;
  readonly investments: InvestmentSystem;
  readonly strategic: StrategicModelingSystem;
  readonly quantum: QuantumSystem;

  private readonly simulationSystems: GameSystem[];
  private readonly saveManager = new SaveManager();
  private readonly renderer = new Renderer();
  private readonly titleScreen = new TitleScreen();
  private readonly stats = new GameStats();
  private readonly lifecycle: GameLifecycle;
  private readonly loop: GameLoop;
  private gameLoopStarted = false;

  get clipsProducedPerSecond(): number {
    return this.stats.clipRate;
  }

  get averageRevenuePerSecond(): number {
    return this.stats.avgRev;
  }

  /** Alias stables pour RenderModel. */
  get clipRate(): number {
    return this.stats.clipRate;
  }

  get avgRev(): number {
    return this.stats.avgRev;
  }

  constructor() {
    this.state = this.saveManager.loadGame();
    this.compute = new ComputeSystem(this.state);
    this.production = new ProductionSystem(this.state, this.compute);
    this.market = new MarketSystem(this.state);
    this.projects = new ProjectSystem(this.state);
    this.investments = new InvestmentSystem(this.state);
    this.strategic = new StrategicModelingSystem(this.state);
    this.quantum = new QuantumSystem(this.state);
    this.simulationSystems = [
      this.production,
      this.market,
      this.compute,
      this.investments,
      this.quantum,
    ];

    this.lifecycle = new GameLifecycle(this.state, this.saveManager, AUTOSAVE_MS);
    this.loop = new GameLoop(
      {
        onTick: (deltaMs) => this.updateSimulation(deltaMs),
        onFrame: () => this.renderer.render(this),
      },
      TICK_MS,
    );
  }

  start(): void {
    this.bindUserInterface();
    this.titleScreen.onEnter(() => this.beginGameLoop());

    if (import.meta.env.DEV) {
      (window as Window & { __tromboneGame?: Game }).__tromboneGame = this;
    }
  }

  activateProject(id: string): void {
    this.projects.activateProject(id);
  }

  acknowledgePhase1End(): void {
    this.state.phase1EndAcknowledged = true;
  }

  /** Démarre tick, autosave et rendu après l’écran titre. */
  private beginGameLoop(): void {
    if (this.gameLoopStarted) return;
    this.gameLoopStarted = true;
    this.lifecycle.start();
    this.loop.start();
  }

  private updateSimulation(deltaMs: number): void {
    for (const system of this.simulationSystems) {
      system.update(deltaMs);
    }

    this.stats.addClips(this.production.takeClipsProducedDuringLastUpdate());
    this.stats.addRevenue(this.market.takeRevenueEarnedDuringLastUpdate());
    this.stats.advance(deltaMs);

    if (
      !this.state.autoClippersUnlocked &&
      this.state.funds >= AUTOCLIPPER_UNLOCK_FUNDS
    ) {
      this.state.autoClippersUnlocked = true;
    }
  }

  private bindUserInterface(): void {
    new ProductionController(this.production, this.stats).bind();
    new MarketController(this.market).bind();
    new ComputeController(this.compute).bind();
    new InvestmentsController(this.investments).bind();
    new StrategicController(this.strategic).bind();
    new QuantumController(this.quantum).bind();
    new PhaseController(() => this.acknowledgePhase1End()).bind();
    this.lifecycle.bindResetButton();
  }
}
