import { load, save, resetSave, type GameState } from "./state";
import { makeClips, buyWire } from "./systems/production";
import { render } from "./ui/render";

const TICK_MS = 100; // logique à 10 Hz
const AUTOSAVE_MS = 10_000;

const state: GameState = load();

// Mesure de la production récente pour afficher « trombones / s ».
let clipsMadeThisSecond = 0;
let clipRate = 0;
let rateWindowMs = 0;

function tick(_dtMs: number): void {
  // Les systèmes automatiques (ventes, machines…) arriveront aux étapes
  // suivantes ; pour l'instant le tick ne sert qu'à la mesure du débit.
}

// --- Boucle : logique à pas fixe, rendu à chaque frame ---
let lastTime = performance.now();
let accumulator = 0;

function frame(now: number): void {
  accumulator += now - lastTime;
  lastTime = now;

  // Évite une spirale de rattrapage si l'onglet est resté en arrière-plan.
  accumulator = Math.min(accumulator, 2_000);

  while (accumulator >= TICK_MS) {
    tick(TICK_MS);
    accumulator -= TICK_MS;
    rateWindowMs += TICK_MS;
    if (rateWindowMs >= 1_000) {
      clipRate = clipsMadeThisSecond;
      clipsMadeThisSecond = 0;
      rateWindowMs = 0;
    }
  }

  render(state, { clipRate });
  requestAnimationFrame(frame);
}

// --- Interactions ---
document.getElementById("btn-make")!.addEventListener("click", () => {
  clipsMadeThisSecond += makeClips(state, 1);
});

document.getElementById("btn-buy-wire")!.addEventListener("click", () => {
  buyWire(state);
});

let resetting = false;
document.getElementById("btn-reset")!.addEventListener("click", () => {
  if (confirm("Réinitialiser la partie ? Toute la progression sera perdue.")) {
    resetting = true;
    resetSave();
    location.reload();
  }
});

// --- Sauvegarde ---
setInterval(() => {
  if (!resetting) save(state);
}, AUTOSAVE_MS);
window.addEventListener("beforeunload", () => {
  if (!resetting) save(state);
});

requestAnimationFrame(frame);
