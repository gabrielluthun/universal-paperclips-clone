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
  /** Nombre de Batteries possédées (tampon d'énergie). */
  batteries: number;
  /** Énergie actuellement stockée dans les batteries (MW·s). */
  storedPower: number;
  /**
   * Performance courante des drones/usines (0 à 1, peut dépasser 1 avec
   * Élan). Persisté car Élan l'incrémente progressivement au fil du temps
   * tant que l'alimentation est à 100 %.
   */
  powMod: number;
  /**
   * Position du curseur Travail/Réflexion (0 = tout Travail, 100 = tout
   * Réflexion). Révélé par le projet Informatique en essaim ; en attendant,
   * reste à 0 (comme dans UP), ce qui correspond à un facteur de production
   * ×2 sur la récolte/le filage (formule UP : (200-sliderPos)/100).
   */
  sliderPos: number;

  // --- Drones & fil ---
  /**
   * Matière terrestre encore disponible à récolter (Available Matter).
   * Départ : 6 × 10^27 g (6 octillions), comme dans UP.
   */
  availableMatter: number;
  /** Matière déjà récoltée, prête à être convertie en fil (Acquired Matter). */
  acquiredMatter: number;
  harvesterDrones: number;
  wireDrones: number;
  /** Multiplicateur cumulatif d'efficacité des drones (vols en essaim). */
  droneEfficiencyBonus: number;

  // --- Usines ---
  clipFactories: number;
  /**
   * Coût (en trombones) de la prochaine Usine. Persisté car la formule UP
   * n'est pas une fonction pure du nombre d'usines : chaque achat multiplie
   * le coût courant par un facteur dépendant du palier atteint.
   */
  clipFactoryCost: number;
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
    batteries: 0,
    storedPower: 0,
    powMod: 0,
    sliderPos: 0,

    availableMatter: Math.pow(10, 24) * 6000,
    acquiredMatter: 0,
    harvesterDrones: 0,
    wireDrones: 0,
    droneEfficiencyBonus: 1,

    clipFactories: 0,
    clipFactoryCost: 100_000_000,
    factoryEfficiencyBonus: 1,

    swarmCompute: 0,

    phase2Complete: false,
    phase2EndAcknowledged: false,
  };
}
