/** Nombre de secondes glissantes utilisées pour lisser le revenu moyen affiché. */
const REV_WINDOW_SECONDS = 10;

/** Calcule les statistiques par seconde affichées à l'écran (clips/s, revenu moyen/s). */
export class GameStats {
  private clipsThisSecond = 0;
  private revenueThisSecond = 0;
  private readonly revenuePerSecondBuckets: number[] = [];
  private windowMs = 0;

  private clipsPerSecond = 0;
  private averageRevenuePerSecond = 0;

  get clipRate(): number {
    return this.clipsPerSecond;
  }

  get avgRev(): number {
    return this.averageRevenuePerSecond;
  }

  /** Comptabilise des trombones produits dans la fenêtre en cours (clic manuel ou tick). */
  addClips(count: number): void {
    this.clipsThisSecond += count;
  }

  /** Comptabilise du revenu encaissé dans la fenêtre en cours. */
  addRevenue(amount: number): void {
    this.revenueThisSecond += amount;
  }

  /** À appeler après chaque pas fixe de simulation ; finalise la fenêtre à chaque seconde écoulée. */
  advance(deltaMs: number): void {
    this.windowMs += deltaMs;
    if (this.windowMs >= 1_000) {
      this.finalizeWindow();
      this.windowMs = 0;
    }
  }

  private finalizeWindow(): void {
    this.clipsPerSecond = this.clipsThisSecond;
    this.clipsThisSecond = 0;

    this.revenuePerSecondBuckets.push(this.revenueThisSecond);
    this.revenueThisSecond = 0;
    if (this.revenuePerSecondBuckets.length > REV_WINDOW_SECONDS) {
      this.revenuePerSecondBuckets.shift();
    }
    this.averageRevenuePerSecond =
      this.revenuePerSecondBuckets.reduce((a, b) => a + b, 0) /
      this.revenuePerSecondBuckets.length;
  }
}
