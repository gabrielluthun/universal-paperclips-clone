import type { CoreFields } from "./fields/coreFields";
import { createCoreFields } from "./fields/coreFields";
import type { ComputeFields } from "./fields/computeFields";
import { createComputeFields } from "./fields/computeFields";
import type { InvestmentFields } from "./fields/investmentFields";
import { createInvestmentFields } from "./fields/investmentFields";
import type { LandFields } from "./fields/landFields";
import { createLandFields } from "./fields/landFields";
import type { MarketFields } from "./fields/marketFields";
import { createMarketFields } from "./fields/marketFields";
import type { ProductionFields } from "./fields/productionFields";
import { createProductionFields } from "./fields/productionFields";
import type { QuantumFields } from "./fields/quantumFields";
import { createQuantumFields } from "./fields/quantumFields";
import type { StrategicFields } from "./fields/strategicFields";
import { createStrategicFields } from "./fields/strategicFields";
import { applyMigrations, SAVE_MIGRATIONS } from "./saveMigrations";

/**
 * 
 * Version de la sauvegarde. S'incrémente lorsque des modifications sont
 * apportées à la structure de l'état. Chaque bump DOIT être accompagné d'une
 * entrée dans `SAVE_MIGRATIONS` (voir `saveMigrations.ts`) pour que les
 * sauvegardes existantes conservent leur progression au lieu d'être perdues.
 */
export const SAVE_VERSION = 8;

/**
 * Fusion de déclarations : les champs de chaque domaine (`src/state/fields/`)
 * sont ajoutés au type `GameState` ici, sans dupliquer leur déclaration dans
 * la classe ci-dessous. Le runtime reste un objet plat classique — seule la
 * déclaration des champs est répartie par fichier.
 */
export interface GameState
  extends CoreFields,
    ProductionFields,
    MarketFields,
    ComputeFields,
    StrategicFields,
    InvestmentFields,
    QuantumFields,
    LandFields {}

/** État mutable de la partie — source de vérité pour tous les systèmes. */
export class GameState {
  version = SAVE_VERSION;

  private completedProjectIds: string[] = [];

  constructor() {
    Object.assign(
      this,
      createCoreFields(),
      createProductionFields(),
      createMarketFields(),
      createComputeFields(),
      createStrategicFields(),
      createInvestmentFields(),
      createQuantumFields(),
      createLandFields(),
    );
  }

  static createInitial(): GameState {
    return new GameState();
  }

  /**
   * Reconstruit un état depuis une sauvegarde JSON.
   *
   * Ne réinitialise JAMAIS une sauvegarde valide simplement parce que sa
   * version diffère : on fait remonter les données au mieux via
   * `SAVE_MIGRATIONS`, puis on fusionne champ par champ (fusion défensive).
   * Seules les données réellement illisibles (pas un objet, ou sans numéro
   * de version exploitable) donnent un état neuf.
   */
  static fromSavedData(raw: unknown): GameState {
    const state = GameState.createInitial();
    if (typeof raw !== "object" || raw === null) return state;
    if (typeof (raw as { version?: unknown }).version !== "number") {
      return state;
    }

    const migrated = applyMigrations(
      raw as Record<string, unknown>,
      SAVE_MIGRATIONS,
      SAVE_VERSION,
    ) as Partial<GameState> & {
      version?: number;
      completedProjects?: string[];
      completedProjectIds?: string[];
    };

    const {
      completedProjects: _legacy,
      completedProjectIds: _ids,
      ...rest
    } = migrated;
    Object.assign(state, rest);

    const savedIds = migrated.completedProjectIds ?? migrated.completedProjects;
    state.completedProjectIds = Array.isArray(savedIds) ? [...savedIds] : [];

    if (!Array.isArray(state.unlockedStrategyIds) || state.unlockedStrategyIds.length === 0) {
      state.unlockedStrategyIds = ["RANDOM"];
    }
    if (!Array.isArray(state.tourneyResults)) {
      state.tourneyResults = [];
    }

    state.version = SAVE_VERSION;
    return state;
  }

  toSavedData(): object {
    return {
      ...this,
      completedProjects: [...this.completedProjectIds],
      completedProjectIds: [...this.completedProjectIds],
    };
  }

  hasCompletedProject(id: string): boolean {
    return this.completedProjectIds.includes(id);
  }

  markProjectCompleted(id: string): void {
    if (!this.hasCompletedProject(id)) {
      this.completedProjectIds.push(id);
    }
  }

  /**
   * Remplace l'état vivant par une sauvegarde (même référence d'objet,
   * pour que les systèmes déjà construits restent valides).
   */
  adoptSavedData(raw: unknown): void {
    const loaded = GameState.fromSavedData(raw);
    const data = loaded.toSavedData() as Record<string, unknown>;
    const {
      completedProjects: _legacy,
      completedProjectIds: savedIds,
      ...rest
    } = data;
    Object.assign(this, rest);
    this.completedProjectIds = Array.isArray(savedIds)
      ? [...(savedIds as string[])]
      : [];
    this.version = SAVE_VERSION;
  }
}
