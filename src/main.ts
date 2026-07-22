import "./style.css";
import { Game } from "./game/Game";

new Game().start();

if (import.meta.env.DEV) {
  void import("./dev/midGameTest");
}
