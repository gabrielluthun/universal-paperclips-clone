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
 * Exemple (phase 2, à décommenter/adapter le jour venu) :
 * ```
 * 6: (data) => ({
 *   ...data,
 *   matterRemaining: 1_000_000,
 *   harvesterDrones: 0,
 *   wireDrones: 0,
 *   version: 7,
 * }),
 * ```
 */
export const SAVE_MIGRATIONS: Record<number, SaveMigration> = {};

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
