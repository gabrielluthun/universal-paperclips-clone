/** Durée maximale rattrapable en un seul cadre (évite les à-coups après un onglet en veille). */
const MAX_ACCUMULATOR_MS = 2_000;

export interface GameLoopHandlers {
  /** Avance la simulation d'un pas fixe de `deltaMs` millisecondes. */
  onTick(deltaMs: number): void;
  /** Appelé une fois par frame, après les pas fixes éventuels (rendu). */
  onFrame(): void;
}

/**
 * Boucle de jeu à pas fixe pilotée par `requestAnimationFrame` :
 * accumule le temps écoulé et exécute autant de pas de `tickMs` que nécessaire,
 * puis notifie une fois par frame pour le rendu.
 */
export class GameLoop {
  private accumulatorMs = 0;
  private lastFrameTimestamp = 0;
  private running = false;

  constructor(
    private readonly handlers: GameLoopHandlers,
    private readonly tickMs: number,
  ) {}

  /** Démarre la boucle (idempotent : un second appel est ignoré). */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTimestamp = performance.now();
    requestAnimationFrame(this.handleAnimationFrame);
  }

  private readonly handleAnimationFrame = (now: number): void => {
    this.accumulatorMs += now - this.lastFrameTimestamp;
    this.lastFrameTimestamp = now;
    this.accumulatorMs = Math.min(this.accumulatorMs, MAX_ACCUMULATOR_MS);

    while (this.accumulatorMs >= this.tickMs) {
      this.handlers.onTick(this.tickMs);
      this.accumulatorMs -= this.tickMs;
    }

    this.handlers.onFrame();
    requestAnimationFrame(this.handleAnimationFrame);
  };
}
