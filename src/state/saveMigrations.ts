import {
  baFromJSON,
  BIG_AMOUNT_SAVE_KEYS,
  decodeBigAmountFields,
  encodeBigAmountFields,
} from "../util/BigAmount";
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
 *
 * v8 → v9 : renomme `powerBanked` en `storedPower` (mécanique de batterie
 * fidèle à UP, qui tamponne les déficits de puissance) et ajoute
 * `batteries`, `powMod` et `sliderPos`.
 *
 * v9 → v10 : ajoute `clipFactoryCost` (coût persisté de la prochaine Usine,
 * la formule UP n'étant pas une fonction pure du nombre d'usines).
 *
 * v10 → v11 : renomme `swarmCompute` en `swarmGifts` (fidèle à UP) et ajoute
 * les mécaniques d'ennui/désorganisation du swarm (`giftBits`,
 * `boredomLevel`, `boredomActive`, `entertainSwarmCost`, `disorgCounter`,
 * `disorgActive`).
 *
 * v11 → v12 : ajoute `droneBoost` et `factoryBoost` (Cohésion adverse /
 * Chaîne d'approvisionnement auto-correctrice), à 1 par défaut (inactifs).
 *
 * v12 → v13 : stocks / coûts astronomiques (`clips`, `unsold`, `wire`,
 * `availableMatter`, `acquiredMatter`, `clipFactoryCost`) passent en
 * bigint (sérialisés string) pour la précision phase 2.
 */
export const SAVE_MIGRATIONS: Record<number, SaveMigration> = {
  6: (data) => ({
    ...data,
    ...createLandFields(),
    version: 7,
  }),
  7: (data) => {
    const legacyMatter = baFromJSON(data.matter ?? 0);
    const { matter: _removed, ...rest } = data;
    return {
      ...rest,
      availableMatter: 6n * 10n ** 27n,
      // L'ancien `matter` représentait le stock récolté (toujours 0 en pratique).
      acquiredMatter: legacyMatter,
      version: 8,
    };
  },
  8: (data) => {
    const legacyStored =
      typeof data.powerBanked === "number" ? data.powerBanked : 0;
    const { powerBanked: _removed, ...rest } = data;
    return {
      ...rest,
      storedPower: legacyStored,
      batteries: 0,
      powMod: 0,
      sliderPos: 0,
      version: 9,
    };
  },
  9: (data) => ({
    ...data,
    clipFactoryCost: 100_000_000n,
    version: 10,
  }),
  10: (data) => {
    const legacyGifts =
      typeof data.swarmCompute === "number" ? data.swarmCompute : 0;
    const { swarmCompute: _removed, ...rest } = data;
    return {
      ...rest,
      swarmGifts: legacyGifts,
      giftBits: 0,
      boredomLevel: 0,
      boredomActive: false,
      entertainSwarmCost: 10_000,
      disorgCounter: 0,
      disorgActive: false,
      version: 11,
    };
  },
  11: (data) => ({
    ...data,
    droneBoost: 1,
    factoryBoost: 1,
    version: 12,
  }),
  12: (data) => {
    const converted: Record<string, unknown> = { ...data, version: 13 };
    for (const key of BIG_AMOUNT_SAVE_KEYS) {
      if (key in converted) {
        converted[key] = baFromJSON(converted[key]);
      }
    }
    return converted;
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

export { decodeBigAmountFields, encodeBigAmountFields };
