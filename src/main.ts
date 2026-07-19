import { load, save, resetSave, type GameState } from "./state";
import {
  makeClips,
  buyWire,
  buyAutoClipper,
  buyMegaClipper,
  autoProductionTick,
  autoWireTick,
} from "./systems/production";
import {
  sellTick,
  wireMarketTick,
  raisePrice,
  lowerPrice,
  buyMarketing,
} from "./systems/market";
import { computeTick, addProcessor, addMemory } from "./systems/compute";
import { activateProject } from "./systems/projects";
import { render } from "./ui/render";

const TICK_MS = 100; // logique à 10 Hz
const AUTOSAVE_MS = 10_000;
const AUTOCLIPPER_UNLOCK_FUNDS = 5;
const REV_WINDOW_SECONDS = 10;

const state: GameState = load();

// --- Statistiques transitoires (non sauvegardées) ---
let clipsMadeThisSecond = 0;
let clipRate = 0;
let revenueThisSecond = 0;
const revBuckets: number[] = [];
let avgRev = 0;
let rateWindowMs = 0;

function tick(dtMs: number): void {
  clipsMadeThisSecond += autoProductionTick(state, dtMs);
  revenueThisSecond += sellTick(state, dtMs);
  wireMarketTick(state);
  autoWireTick(state);
  computeTick(state, dtMs);

  if (!state.autoClippersUnlocked && state.funds >= AUTOCLIPPER_UNLOCK_FUNDS) {
    state.autoClippersUnlocked = true;
  }
}

function closeStatsWindow(): void {
  clipRate = clipsMadeThisSecond;
  clipsMadeThisSecond = 0;

  revBuckets.push(revenueThisSecond);
  revenueThisSecond = 0;
  if (revBuckets.length > REV_WINDOW_SECONDS) revBuckets.shift();
  avgRev = revBuckets.reduce((a, b) => a + b, 0) / revBuckets.length;
}

// --- Boucle : logique à pas fixe, rendu à chaque frame ---
let lastTime = performance.now();
let accumulator = 0;

function onActivateProject(id: string): void {
  activateProject(state, id);
}

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
      closeStatsWindow();
      rateWindowMs = 0;
    }
  }

  render(state, { clipRate, avgRev, onActivateProject });
  requestAnimationFrame(frame);
}

// --- Interactions ---
function on(id: string, handler: () => void): void {
  document.getElementById(id)!.addEventListener("click", handler);
}

on("btn-make", () => {
  clipsMadeThisSecond += makeClips(state, 1);
});
on("btn-buy-wire", () => buyWire(state));
on("btn-price-up", () => raisePrice(state));
on("btn-price-down", () => lowerPrice(state));
on("btn-marketing", () => buyMarketing(state));
on("btn-buy-autoclipper", () => buyAutoClipper(state));
on("btn-buy-megaclipper", () => buyMegaClipper(state));
on("btn-add-processor", () => addProcessor(state));
on("btn-add-memory", () => addMemory(state));

let resetting = false;
on("btn-reset", () => {
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
