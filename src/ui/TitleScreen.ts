import { requireElement } from "./dom";

/** Écran titre : logo trombone cliquable pour entrer dans le jeu. */
export class TitleScreen {
  private readonly root = requireElement<HTMLElement>("title-screen");
  private readonly app = requireElement<HTMLElement>("app");
  private readonly enterButton =
    requireElement<HTMLButtonElement>("btn-enter-game");
  private entered = false;

  /** Affiche le jeu et masque le titre. Retourne false si déjà entré. */
  enterGame(): boolean {
    if (this.entered) return false;
    this.entered = true;
    this.root.classList.add("title-screen--leaving");
    window.setTimeout(() => {
      this.root.hidden = true;
      this.root.classList.remove("title-screen--leaving");
    }, 280);
    this.app.hidden = false;
    this.app.classList.add("app--entering");
    return true;
  }

  onEnter(handler: () => void): void {
    this.enterButton.addEventListener("click", () => {
      if (this.enterGame()) handler();
    });
  }
}
