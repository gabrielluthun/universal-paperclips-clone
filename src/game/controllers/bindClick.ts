import { requireElement } from "../../ui/dom";

/** Attache un handler de clic à un bouton, en levant une erreur claire s'il est absent du DOM. */
export function bindClick(id: string, handler: () => void): void {
  requireElement<HTMLButtonElement>(id).addEventListener("click", handler);
}
