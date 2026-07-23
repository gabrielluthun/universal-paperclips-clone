import { GameState } from "../state/GameState";
import { SaveManager } from "../state/SaveManager";
import { ComputeSystem } from "../systems/compute/ComputeSystem";
import type { GameSystem } from "../systems/core/GameSystem";
import { InvestmentSystem } from "../systems/invest/InvestmentSystem";
import { LandSystem } from "../systems/land/LandSystem";
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
  readonly land: LandSystem;

  /** Systèmes actifs quelle que soit la phase (production, compute, quantique). */
  private readonly alwaysActiveSystems: GameSystem[];
  /** Systèmes « Affaires » (marché, investissements) : phase 1 seulement. */
  private readonly businessSystems: GameSystem[];
  /** Systèmes de la phase 2 (Terre) et au-delà. */
  private readonly landSystems: GameSystem[];
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
    this.land = new LandSystem(this.state);
    this.alwaysActiveSystems = [this.production, this.compute, this.quantum];
    this.businessSystems = [this.market, this.investments];
    this.landSystems = [this.land];

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

  /**
   * Systèmes de simulation actifs pour la phase courante : production, compute
   * et quantique restent actifs partout ; marché/investissements sont propres
   * à la phase 1, la Terre (drones, usines...) à la phase 2 et au-delà.
   */
  private get activeSystems(): GameSystem[] {
    const phaseSpecific =
      this.state.phase === 1 ? this.businessSystems : this.landSystems;
    return [...this.alwaysActiveSystems, ...phaseSpecific];
  }

  private updateSimulation(deltaMs: number): void {
    for (const system of this.activeSystems) {
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
