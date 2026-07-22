/** Récupère un élément DOM par id, ou lève une erreur explicite. */
export function requireElement<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Élément introuvable : #${id}`);
  return node as T;
}
