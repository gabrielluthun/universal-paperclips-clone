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
import type { StrategyId } from "../systems/strategic/strategies";
import { Renderer } from "../ui/Renderer";
import { TitleScreen } from "../ui/TitleScreen";

const TICK_MS = 100;
const AUTOSAVE_MS = 10_000;
const AUTOCLIPPER_UNLOCK_FUNDS = 5;
const REV_WINDOW_SECONDS = 10;

/** Orchestrateur : boucle de jeu, systèmes, sauvegarde et interactions. */
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
  private gameLoopStarted = false;

  private clipsMadeThisSecond = 0;
  private revenueThisSecond = 0;
  private readonly revenuePerSecondBuckets: number[] = [];
  private rateWindowMs = 0;
  private lastFrameTimestamp = 0;
  private simulationAccumulatorMs = 0;
  private isResetting = false;
  private autosaveTimer: ReturnType<typeof setInterval> | null = null;

  private _clipsProducedPerSecond = 0;
  private _averageRevenuePerSecond = 0;

  get clipsProducedPerSecond(): number {
    return this._clipsProducedPerSecond;
  }

  get averageRevenuePerSecond(): number {
    return this._averageRevenuePerSecond;
  }

  /** Alias stables pour RenderModel. */
  get clipRate(): number {
    return this._clipsProducedPerSecond;
  }

  get avgRev(): number {
    return this._averageRevenuePerSecond;
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
  }

  start(): void {
    this.bindUserInterface();
    this.titleScreen.onEnter(() => this.beginGameLoop());

    if (import.meta.env.DEV) {
      (window as Window & { __tromboneGame?: Game }).__tromboneGame = this;
    }
  }

  /** Démarre tick, autosave et rendu après l’écran titre. */
  private beginGameLoop(): void {
    if (this.gameLoopStarted) return;
    this.gameLoopStarted = true;

    this.autosaveTimer = setInterval(() => {
      if (!this.isResetting) this.saveManager.saveGame(this.state);
    }, AUTOSAVE_MS);
    window.addEventListener("beforeunload", this.handlePageUnload);

    this.lastFrameTimestamp = performance.now();
    requestAnimationFrame(this.handleAnimationFrame);
  }

  activateProject(id: string): void {
    this.projects.activateProject(id);
  }

  acknowledgePhase1End(): void {
    this.state.phase1EndAcknowledged = true;
  }

  private readonly handlePageUnload = (): void => {
    if (!this.isResetting) this.saveManager.saveGame(this.state);
  };

  private readonly handleAnimationFrame = (now: number): void => {
    this.simulationAccumulatorMs += now - this.lastFrameTimestamp;
    this.lastFrameTimestamp = now;
    this.simulationAccumulatorMs = Math.min(this.simulationAccumulatorMs, 2_000);

    while (this.simulationAccumulatorMs >= TICK_MS) {
      this.updateSimulation(TICK_MS);
      this.simulationAccumulatorMs -= TICK_MS;
      this.rateWindowMs += TICK_MS;
      if (this.rateWindowMs >= 1_000) {
        this.finalizePerSecondStatistics();
        this.rateWindowMs = 0;
      }
    }

    this.renderer.render(this);
    requestAnimationFrame(this.handleAnimationFrame);
  };

  private updateSimulation(deltaMs: number): void {
    for (const system of this.simulationSystems) {
      system.update(deltaMs);
    }

    this.clipsMadeThisSecond +=
      this.production.takeClipsProducedDuringLastUpdate();
    this.revenueThisSecond += this.market.takeRevenueEarnedDuringLastUpdate();

    if (
      !this.state.autoClippersUnlocked &&
      this.state.funds >= AUTOCLIPPER_UNLOCK_FUNDS
    ) {
      this.state.autoClippersUnlocked = true;
    }
  }

  private finalizePerSecondStatistics(): void {
    this._clipsProducedPerSecond = this.clipsMadeThisSecond;
    this.clipsMadeThisSecond = 0;

    this.revenuePerSecondBuckets.push(this.revenueThisSecond);
    this.revenueThisSecond = 0;
    if (this.revenuePerSecondBuckets.length > REV_WINDOW_SECONDS) {
      this.revenuePerSecondBuckets.shift();
    }
    this._averageRevenuePerSecond =
      this.revenuePerSecondBuckets.reduce((a, b) => a + b, 0) /
      this.revenuePerSecondBuckets.length;
  }

  private bindUserInterface(): void {
    this.bindButtonClick("btn-make", () => {
      this.clipsMadeThisSecond += this.production.produceClips(1);
    });
    this.bindButtonClick("btn-buy-wire", () =>
      this.production.purchaseWireSpool(),
    );
    this.bindButtonClick("btn-price-up", () => this.market.increaseUnitPrice());
    this.bindButtonClick("btn-price-down", () =>
      this.market.decreaseUnitPrice(),
    );
    this.bindButtonClick("btn-marketing", () =>
      this.market.purchaseMarketingUpgrade(),
    );
    this.bindButtonClick("btn-buy-autoclipper", () =>
      this.production.purchaseAutoClipper(),
    );
    this.bindButtonClick("btn-buy-megaclipper", () =>
      this.production.purchaseMegaClipper(),
    );
    this.bindButtonClick("btn-add-processor", () =>
      this.compute.allocateProcessor(),
    );
    this.bindButtonClick("btn-add-memory", () => this.compute.allocateMemory());

    this.bindButtonClick("btn-invest-deposit", () =>
      this.investments.depositAll(),
    );
    this.bindButtonClick("btn-invest-withdraw", () =>
      this.investments.withdrawAll(),
    );
    this.bindButtonClick("btn-upgrade-engine", () =>
      this.investments.upgradeEngineWithYomi(),
    );
    this.bindButtonClick("btn-risk-low", () =>
      this.investments.setRiskLevel(1),
    );
    this.bindButtonClick("btn-risk-med", () =>
      this.investments.setRiskLevel(2),
    );
    this.bindButtonClick("btn-risk-high", () =>
      this.investments.setRiskLevel(3),
    );

    this.bindButtonClick("btn-run-tourney", () => this.strategic.runTournament());
    const stratPicker = document.getElementById("strat-picker");
    if (stratPicker) {
      stratPicker.addEventListener("change", (event) => {
        const value = (event.target as HTMLSelectElement).value as StrategyId;
        this.strategic.selectStrategy(value);
      });
    }

    this.bindButtonClick("btn-buy-qchip", () =>
      this.quantum.purchasePhotonicChip(),
    );
    this.bindButtonClick("btn-qcompute", () =>
      this.quantum.toggleQuantumCompute(),
    );

    this.bindButtonClick("btn-dismiss-phase1-end", () =>
      this.acknowledgePhase1End(),
    );

    this.bindButtonClick("btn-reset", () => this.resetGame());
  }

  private bindButtonClick(id: string, handler: () => void): void {
    document.getElementById(id)!.addEventListener("click", handler);
  }

  private resetGame(): void {
    if (!confirm("Réinitialiser la partie ? Toute la progression sera perdue.")) {
      return;
    }
    this.isResetting = true;
    if (this.autosaveTimer !== null) clearInterval(this.autosaveTimer);
    window.removeEventListener("beforeunload", this.handlePageUnload);
    this.saveManager.clearSavedGame();
    location.reload();
  }
}
