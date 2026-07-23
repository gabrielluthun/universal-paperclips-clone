/** Champs de la phase 2 (Terre) : grid électrique, drones, usines, informatique en essaim. */
export interface LandFields {
  // --- Déblocages (progression des projets phase 2) ---
  landFoundationUnlocked: boolean;
  powerGridUnlocked: boolean;
  nanoscaleWireUnlocked: boolean;
  harvesterDronesUnlocked: boolean;
  wireDronesUnlocked: boolean;
  clipFactoriesUnlocked: boolean;
  swarmComputingUnlocked: boolean;
  momentumUnlocked: boolean;

  // --- Énergie ---
  /** Nombre de Fermes solaires possédées. */
  solarFarms: number;
  /** Puissance générée au dernier tick (valeur d'affichage). */
  power: number;
  /** Énergie cumulée engrangée (batteries), compte vers le seuil d'Exploration spatiale. */
  powerBanked: number;

  // --- Drones & fil ---
  /** Matière première récoltée, en stock. */
  matter: number;
  harvesterDrones: number;
  wireDrones: number;
  /** Multiplicateur cumulatif d'efficacité des drones (vols en essaim). */
  droneEfficiencyBonus: number;

  // --- Usines ---
  clipFactories: number;
  /** Multiplicateur cumulatif d'efficacité des usines. */
  factoryEfficiencyBonus: number;

  // --- Informatique en essaim ---
  /** Capacité de calcul générée par le swarm (paie certains projets de phase 2). */
  swarmCompute: number;

  // --- Fin de phase ---
  phase2Complete: boolean;
  phase2EndAcknowledged: boolean;
}

export function createLandFields(): LandFields {
  return {
    landFoundationUnlocked: false,
    powerGridUnlocked: false,
    nanoscaleWireUnlocked: false,
    harvesterDronesUnlocked: false,
    wireDronesUnlocked: false,
    clipFactoriesUnlocked: false,
    swarmComputingUnlocked: false,
    momentumUnlocked: false,

    solarFarms: 0,
    power: 0,
    powerBanked: 0,

    matter: 0,
    harvesterDrones: 0,
    wireDrones: 0,
    droneEfficiencyBonus: 1,

    clipFactories: 0,
    factoryEfficiencyBonus: 1,

    swarmCompute: 0,

    phase2Complete: false,
    phase2EndAcknowledged: false,
  };
}
