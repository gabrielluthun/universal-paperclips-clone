import { createLandFields } from "./fields/landFields";

/** Transforme une sauvegarde brute d'une version vers la suivante. */
export type SaveMigration = (
  data: Record<string, unknown>,
) => Record<string, unknown>;

/**
 * Migrations vers la version suivante, indexées par version de départ.
 * `SAVE_MIGRATIONS[6]` transforme une save v6 en v7, etc.
 *
 * Règles :
 * - Chaque migration ne doit modifier QUE ce qui change à cette étape précise
 *   (nouveaux champs avec valeur par défaut, renommages, changements de forme…).
 * - Ne jamais supprimer une entrée existante : une vieille save doit toujours
 *   pouvoir remonter la chaîne jusqu'à `SAVE_VERSION`, même après plusieurs phases.
 * - Chaque nouvelle entrée doit être accompagnée d'un test dans
 *   `GameState.test.ts` prouvant qu'une save de la version précédente
 *   conserve sa progression après migration.
 *
 * v6 → v7 : introduction de la phase 2 (Terre). Les vieilles saves n'ont
 * aucun de ces champs ; on les injecte avec leurs valeurs par défaut neutres
 * (`createLandFields()`), sans toucher au reste de la progression.
 *
 * v7 → v8 : scinde l'ancien champ unique `matter` en `availableMatter`
 * (stock terrestre initial) et `acquiredMatter` (matière récoltée).
 */
export const SAVE_MIGRATIONS: Record<number, SaveMigration> = {
  6: (data) => ({
    ...data,
    ...createLandFields(),
    version: 7,
  }),
  7: (data) => {
    const legacyMatter =
      typeof data.matter === "number" ? data.matter : 0;
    const { matter: _removed, ...rest } = data;
    return {
      ...rest,
      availableMatter: Math.pow(10, 24) * 6000,
      // L'ancien `matter` représentait le stock récolté (toujours 0 en pratique).
      acquiredMatter: legacyMatter,
      version: 8,
    };
  },
};

/**
 * Applique séquentiellement les migrations connues jusqu'à `targetVersion`.
 * S'arrête dès qu'aucune migration n'est enregistrée pour la version courante
 * (fusion "au mieux" : le reste de la désérialisation se fait champ par champ,
 * voir `GameState.fromSavedData`). Ne lève jamais d'exception.
 */
export function applyMigrations(
  raw: Record<string, unknown>,
  migrations: Record<number, SaveMigration>,
  targetVersion: number,
): Record<string, unknown> {
  let data = raw;
  // Garde-fou anti-boucle infinie si une migration est mal câblée (ne fait pas
  // progresser `version`) : on ne fera jamais plus de sauts que de versions à parcourir.
  const maxSteps = Math.max(targetVersion, 1) + 1;

  for (let step = 0; step < maxSteps; step++) {
    const version = data.version;
    if (typeof version !== "number" || version >= targetVersion) break;
    const migrate = migrations[version];
    if (!migrate) break;
    data = migrate(data);
  }

  return data;
}
