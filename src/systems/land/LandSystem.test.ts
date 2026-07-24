import { describe, expect, it } from "vitest";
import { GameState } from "../../state/GameState";
import { LandSystem } from "./LandSystem";

describe("LandSystem", () => {
  it("calcule le coût des fermes solaires selon la formule UP (10M, 686.85M, 2.12B…)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    const land = new LandSystem(state);

    expect(land.getNextSolarFarmCost()).toBe(10_000_000);

    state.solarFarms = 1;
    expect(land.getNextSolarFarmCost()).toBeCloseTo(686_852_349.15, 0);

    state.solarFarms = 2;
    expect(land.getNextSolarFarmCost()).toBeCloseTo(2_120_298_900.41, 0);

    state.solarFarms = 3;
    expect(land.getNextSolarFarmCost()).toBeCloseTo(4_717_661_495.33, 0);
  });

  it("produit 50 MW par ferme solaire", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.solarFarms = 3;
    const land = new LandSystem(state);

    expect(land.getPowerOutput()).toBe(150);
  });

  it("achète une ferme en dépensant des trombones au coût courant", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.clips = 10_000_000;
    const land = new LandSystem(state);

    expect(land.purchaseSolarFarm()).toBe(true);
    expect(state.solarFarms).toBe(1);
    expect(state.clips).toBe(0);
    expect(land.getNextSolarFarmCost()).toBeCloseTo(686_852_349.15, 0);
  });

  it("refuse l'achat sans Power Grid ou sans trombones suffisants", () => {
    const state = GameState.createInitial();
    const land = new LandSystem(state);
    state.clips = 10_000_000;
    expect(land.purchaseSolarFarm()).toBe(false);

    state.powerGridUnlocked = true;
    state.clips = 9_999_999;
    expect(land.purchaseSolarFarm()).toBe(false);
  });

  it("calcule le coût des Batteries selon la formule UP (1M, puis (n+1)^2.54 × 1e7)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    const land = new LandSystem(state);

    expect(land.getNextBatteryCost()).toBe(1_000_000);

    state.batteries = 1;
    expect(land.getNextBatteryCost()).toBeCloseTo(58_158_900.69, 0);

    state.batteries = 2;
    expect(land.getNextBatteryCost()).toBeCloseTo(162_887_585.96, 0);
  });

  it("achète une Batterie et augmente la capacité de stockage (10 000 MW·s/unité)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.clips = 1_000_000;
    const land = new LandSystem(state);

    expect(land.getBatteryCapacity()).toBe(0);
    expect(land.purchaseBattery()).toBe(true);
    expect(state.batteries).toBe(1);
    expect(state.clips).toBe(0);
    expect(land.getBatteryCapacity()).toBe(10_000);
  });

  it("récolte de la matière à pleine puissance quand l'électricité suffit (formule UP : harvesterRate × workFactor)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.harvesterDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.harvesterDrones = 10; // demande 10 MW < 50 MW dispo
    state.batteries = 1; // capacité 10 000 MW·s, largement suffisante
    const initialMatter = state.availableMatter;
    const land = new LandSystem(state);

    land.update(1000); // 1 seconde

    expect(land.getPowerRatio()).toBe(1);
    // sliderPos par défaut = 0 → workFactor = (200-0)/100 = 2.
    const expectedHarvested = 10 * 26_180_337 * 2;
    expect(state.acquiredMatter).toBeCloseTo(expectedHarvested, 0);
    expect(state.availableMatter).toBeCloseTo(initialMatter - expectedHarvested, 0);
    // Surplus de puissance (50 - 10 MW) stocké dans les batteries.
    expect(state.storedPower).toBeCloseTo(40, 5);
    expect(state.powMod).toBe(1);
  });

  it("ralentit la récolte quand la puissance ne suffit pas et que la batterie est vide", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.harvesterDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.harvesterDrones = 100; // demande 100 MW > 50 MW dispo → déficit 50 MW
    const land = new LandSystem(state);

    expect(land.getPowerRatio()).toBeCloseTo(0.5, 5);

    land.update(1000);

    expect(state.powMod).toBeCloseTo(0.5, 5);
    const expectedHarvested = 100 * 26_180_337 * 2 * 0.5;
    expect(state.acquiredMatter).toBeCloseTo(expectedHarvested, 0);
    expect(state.storedPower).toBe(0);
  });

  it("puise dans la batterie pour absorber un déficit ponctuel sans ralentir (fidèle à UP)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.harvesterDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.harvesterDrones = 60; // demande 60 MW → déficit 10 MW
    state.batteries = 1;
    state.storedPower = 5000; // largement de quoi couvrir le déficit
    const land = new LandSystem(state);

    land.update(1000); // déficit = 10 MW·s, entièrement couvert par la batterie

    expect(state.powMod).toBe(1);
    expect(state.storedPower).toBeCloseTo(4990, 5);
    const expectedHarvested = 60 * 26_180_337 * 2; // pleine performance
    expect(state.acquiredMatter).toBeCloseTo(expectedHarvested, 0);
  });

  it("ralentit partiellement quand la batterie ne couvre qu'une partie du déficit", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.harvesterDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.harvesterDrones = 60; // demande 60 MW → déficit 10 MW·s sur 1 s
    state.batteries = 1;
    state.storedPower = 5; // ne couvre qu'une fraction du déficit

    const land = new LandSystem(state);
    land.update(1000);

    expect(state.storedPower).toBe(0);
    // unmet = 10 - 5 = 5 MW·s sur une demande de 60 MW·s → powMod = 1 - 5/60.
    expect(state.powMod).toBeCloseTo(1 - 5 / 60, 5);
  });

  it("ne récolte rien tant que les Drones récolteurs ne sont pas débloqués", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.solarFarms = 1;
    state.harvesterDrones = 5;
    const land = new LandSystem(state);

    land.update(1000);

    expect(state.acquiredMatter).toBe(0);
  });

  it("calcule le coût des drones selon la formule UP (1M, 4.76M, 11.84M…)", () => {
    const state = GameState.createInitial();
    state.harvesterDronesUnlocked = true;
    state.wireDronesUnlocked = true;
    const land = new LandSystem(state);

    expect(land.getNextHarvesterDroneCost()).toBe(1_000_000);
    expect(land.getNextWireDroneCost()).toBe(1_000_000);

    state.harvesterDrones = 1;
    expect(land.getNextHarvesterDroneCost()).toBeCloseTo(4_756_828, 0);

    state.wireDrones = 2;
    expect(land.getNextWireDroneCost()).toBeCloseTo(11_844_666, 0);
  });

  it("achète un Drone récolteur ou fileur en dépensant des trombones", () => {
    const state = GameState.createInitial();
    state.harvesterDronesUnlocked = true;
    state.clips = 1_000_000;
    const land = new LandSystem(state);

    expect(land.purchaseHarvesterDrone()).toBe(true);
    expect(state.harvesterDrones).toBe(1);
    expect(state.clips).toBe(0);

    expect(land.purchaseWireDrone()).toBe(false); // pas débloqué
    state.wireDronesUnlocked = true;
    state.clips = 999_999;
    expect(land.purchaseWireDrone()).toBe(false); // pas assez de trombones
    state.clips = 1_000_000;
    expect(land.purchaseWireDrone()).toBe(true);
    expect(state.wireDrones).toBe(1);
  });

  it("convertit la matière acquise en fil via les Drones fileurs (formule UP : wireDroneRate × workFactor)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.wireDronesUnlocked = true;
    state.solarFarms = 1; // 50 MW
    state.wireDrones = 5; // demande 5 MW < 50 MW dispo
    state.acquiredMatter = 100_000_000_000; // large stock, non limitant
    const initialWire = state.wire;
    const land = new LandSystem(state);

    land.update(1000);

    const expectedConverted = 5 * 16_180_339 * 2;
    expect(state.wire).toBeCloseTo(initialWire + expectedConverted, 0);
    expect(state.acquiredMatter).toBeCloseTo(100_000_000_000 - expectedConverted, 0);
  });

  it("limite la conversion en fil à la matière acquise disponible", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.wireDronesUnlocked = true;
    state.solarFarms = 1;
    state.wireDrones = 5;
    state.acquiredMatter = 10; // très peu de stock
    const initialWire = state.wire;
    const land = new LandSystem(state);

    land.update(1000);

    expect(state.acquiredMatter).toBe(0);
    expect(state.wire).toBeCloseTo(initialWire + 10, 5);
  });

  it("calcule le coût des Usines selon la formule UP (multiplicateur décroissant puis plafonné)", () => {
    const state = GameState.createInitial();
    state.clipFactoriesUnlocked = true;
    state.clips = 100_000_000;
    const land = new LandSystem(state);

    expect(land.getNextClipFactoryCost()).toBe(100_000_000);

    // Achat n°1 (0 → 1 usine) : fcmod(1) = 11-1 = 10.
    expect(land.purchaseClipFactory()).toBe(true);
    expect(state.clipFactories).toBe(1);
    expect(land.getNextClipFactoryCost()).toBeCloseTo(1_000_000_000, 0);

    // Achat n°2 (1 → 2 usines) : fcmod(2) = 11-2 = 9.
    state.clips = land.getNextClipFactoryCost();
    expect(land.purchaseClipFactory()).toBe(true);
    expect(land.getNextClipFactoryCost()).toBeCloseTo(9_000_000_000, 0);
  });

  it("refuse l'achat d'une Usine sans déblocage ou sans trombones suffisants", () => {
    const state = GameState.createInitial();
    const land = new LandSystem(state);
    state.clips = 100_000_000;
    expect(land.purchaseClipFactory()).toBe(false);

    state.clipFactoriesUnlocked = true;
    state.clips = 99_999_999;
    expect(land.purchaseClipFactory()).toBe(false);
  });

  it("convertit le fil en trombones via les Usines (formule UP : factoryRate, sans facteur Travail/Réflexion)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.clipFactoriesUnlocked = true;
    state.solarFarms = 5; // 250 MW
    state.clipFactories = 1; // 200 MW, suffisamment alimentée
    state.wire = 10_000_000_000; // large stock, non limitant
    const initialClips = state.clips;
    const land = new LandSystem(state);

    land.update(1000);

    const expectedProduced = 1 * 1_000_000_000; // powMod=1, factoryEfficiencyBonus=1
    expect(state.clips).toBeCloseTo(initialClips + expectedProduced, 0);
    expect(state.wire).toBeCloseTo(10_000_000_000 - expectedProduced, 0);
  });

  it("limite la production des Usines au fil disponible", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.clipFactoriesUnlocked = true;
    state.solarFarms = 5;
    state.clipFactories = 1;
    state.wire = 10; // très peu de stock
    const initialClips = state.clips;
    const land = new LandSystem(state);

    land.update(1000);

    expect(state.wire).toBe(0);
    expect(state.clips).toBeCloseTo(initialClips + 10, 5);
  });

  it("ne produit rien tant que les Usines ne sont pas débloquées", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.solarFarms = 5;
    state.clipFactories = 1;
    state.wire = 1_000_000;
    const land = new LandSystem(state);

    land.update(1000);

    expect(state.wire).toBe(1_000_000);
  });

  it("les Usines à trombones comptent aussi dans la demande de puissance (200 MW/usine)", () => {
    const state = GameState.createInitial();
    state.powerGridUnlocked = true;
    state.solarFarms = 5; // 250 MW
    state.clipFactories = 1; // 200 MW
    const land = new LandSystem(state);

    expect(land.getPowerDemand()).toBe(200);
    expect(land.getPowerRatio()).toBe(1);
  });

  describe("Informatique en essaim", () => {
    function setupSwarmState() {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.swarmComputingUnlocked = true;
      state.harvesterDrones = 100;
      state.wireDrones = 100; // essaim de 200, ratio 1:1 (pas de désorganisation)
      state.solarFarms = 4; // 200 MW = demande exacte des 200 drones → powMod=1
      state.sliderPos = 100; // tout Réflexion, pour maximiser la génération de cadeaux
      return state;
    }

    it("calcule la taille de l'essaim comme la somme des drones", () => {
      const state = setupSwarmState();
      const land = new LandSystem(state);
      expect(land.getSwarmSize()).toBe(200);
    });

    it("génère des cadeaux de calcul au rythme log(taille) × sliderPos par seconde", () => {
      const state = setupSwarmState();
      const land = new LandSystem(state);

      land.update(250_000); // 250 s

      expect(state.powMod).toBe(1);
      expect(state.swarmGifts).toBe(2);
      expect(state.giftBits).toBeCloseTo(7457.93, 1);
    });

    it("ne génère aucun cadeau si l'essaim est trop petit (0 ou 1 drone)", () => {
      const state = setupSwarmState();
      state.harvesterDrones = 1;
      state.wireDrones = 0;
      state.solarFarms = 1;
      const land = new LandSystem(state);

      land.update(250_000);

      expect(state.swarmGifts).toBe(0);
      expect(state.giftBits).toBe(0);
    });

    it("l'essaim s'ennuie si plus aucune matière n'est disponible à récolter", () => {
      const state = setupSwarmState();
      state.availableMatter = 0;
      const land = new LandSystem(state);

      land.update(400_000); // 400 s → boredomLevel = min(30000, 100×400) = 30000

      expect(state.boredomActive).toBe(true);
      // Aucun cadeau tant que l'essaim est ennuyé.
      expect(state.swarmGifts).toBe(0);
    });

    it("distraire l'essaim (créativité) résout l'ennui", () => {
      const state = setupSwarmState();
      state.boredomActive = true;
      state.boredomLevel = 30_000;
      state.creativity = 10_000;
      const land = new LandSystem(state);

      expect(land.entertainSwarm()).toBe(true);
      expect(state.boredomActive).toBe(false);
      expect(state.boredomLevel).toBe(0);
      expect(state.creativity).toBe(0);
      expect(land.getEntertainSwarmCost()).toBe(20_000); // augmente de 10 000 à chaque usage
    });

    it("refuse de distraire l'essaim sans créativité suffisante", () => {
      const state = setupSwarmState();
      state.creativity = 9_999;
      const land = new LandSystem(state);
      expect(land.entertainSwarm()).toBe(false);
    });

    it("l'essaim se désorganise si le ratio récolteurs/fileurs dépasse 1,5", () => {
      const state = setupSwarmState();
      state.harvesterDrones = 1000;
      state.wireDrones = 1;
      state.solarFarms = 21; // 1050 MW ≥ 1001 MW demandés → powMod=1
      const land = new LandSystem(state);

      land.update(100_000); // 100 s → disorgCounter += min(ratio/100,1)×100 = 100

      expect(state.disorgActive).toBe(true);
      expect(state.swarmGifts).toBe(0);
    });

    it("synchroniser l'essaim (Yomi) résout la désorganisation", () => {
      const state = setupSwarmState();
      state.disorgActive = true;
      state.disorgCounter = 100;
      state.yomi = 5_000;
      const land = new LandSystem(state);

      expect(land.synchronizeSwarm()).toBe(true);
      expect(state.disorgActive).toBe(false);
      expect(state.disorgCounter).toBe(0);
      expect(state.yomi).toBe(0);
    });

    it("refuse de synchroniser l'essaim sans Yomi suffisant", () => {
      const state = setupSwarmState();
      state.yomi = 4_999;
      const land = new LandSystem(state);
      expect(land.synchronizeSwarm()).toBe(false);
    });

    it("positionne le curseur Travail/Réflexion, borné entre 0 et 100", () => {
      const state = setupSwarmState();
      const land = new LandSystem(state);

      land.setSliderPos(42);
      expect(state.sliderPos).toBe(42);

      land.setSliderPos(150);
      expect(state.sliderPos).toBe(100);

      land.setSliderPos(-10);
      expect(state.sliderPos).toBe(0);
    });

    it("ignore le curseur tant que l'Informatique en essaim n'est pas débloquée", () => {
      const state = GameState.createInitial();
      state.sliderPos = 0;
      const land = new LandSystem(state);

      land.setSliderPos(75);
      expect(state.sliderPos).toBe(0);
    });
  });

  describe("bonus d'efficacité (vol en essaim, usines)", () => {
    it("droneEfficiencyBonus multiplie linéairement la récolte et le filage", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.harvesterDronesUnlocked = true;
      state.solarFarms = 1; // 50 MW
      state.harvesterDrones = 10; // 10 MW < 50 MW dispo
      state.droneEfficiencyBonus = 100; // Anti-collision acquise
      const land = new LandSystem(state);

      land.update(1000);

      const expected = 10 * 26_180_337 * 2 * 100;
      expect(state.acquiredMatter).toBeCloseTo(expected, 0);
    });

    it("droneBoost>1 rend la récolte quadratique en nombre de drones (Cohésion adverse)", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.harvesterDronesUnlocked = true;
      state.solarFarms = 1; // 50 MW
      state.harvesterDrones = 10;
      state.droneBoost = 2; // Cohésion adverse acquise
      const land = new LandSystem(state);

      land.update(1000);

      // dbsth = droneBoost × harvesterDrones = 2×10 = 20 → mtr = 10×20×rate×2(workFactor)
      const expected = 10 * (2 * 10) * 26_180_337 * 2;
      expect(state.acquiredMatter).toBeCloseTo(expected, 0);
    });

    it("factoryEfficiencyBonus multiplie linéairement la production des Usines", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.clipFactoriesUnlocked = true;
      state.solarFarms = 5;
      state.clipFactories = 1;
      state.wire = 1_000_000_000_000;
      state.factoryEfficiencyBonus = 100; // Usines améliorées acquises
      const initialClips = state.clips;
      const land = new LandSystem(state);

      land.update(1000);

      const expected = 1 * 1_000_000_000 * 100;
      expect(state.clips).toBeCloseTo(initialClips + expected, 0);
    });

    it("factoryBoost>1 rend la production quadratique en nombre d'usines (auto-correctrice)", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.clipFactoriesUnlocked = true;
      state.solarFarms = 12; // 600 MW = demande exacte de 3 usines
      state.clipFactories = 3;
      state.wire = 1_000_000_000_000_000;
      state.factoryBoost = 1_000; // Chaîne auto-correctrice acquise
      const initialClips = state.clips;
      const land = new LandSystem(state);

      land.update(1000);

      // fbst = factoryBoost × clipFactories = 1000×3 = 3000 → 3×3000×rate
      const expected = 3 * (1_000 * 3) * 1_000_000_000;
      expect(state.clips).toBeCloseTo(initialClips + expected, 0);
    });
  });

  describe("Élan (momentum)", () => {
    it("augmente powMod de 0,01/s tant que l'alimentation est à 100 %", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.momentumUnlocked = true;
      state.solarFarms = 1; // 50 MW ≥ 0 MW demandés (aucun drone/usine)
      const land = new LandSystem(state);

      land.update(10_000); // 10 s

      expect(state.powMod).toBeCloseTo(1 + 0.01 * 10, 5);
    });

    it("continue de s'accumuler lorsqu'un déficit est entièrement comblé par la batterie", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.momentumUnlocked = true;
      state.solarFarms = 1; // 50 MW
      state.harvesterDrones = 60; // demande 60 MW, déficit 10 MW
      state.batteries = 1;
      state.storedPower = 5_000; // largement de quoi couvrir le déficit
      const land = new LandSystem(state);

      land.update(10_000); // 10 s

      expect(state.powMod).toBeCloseTo(1 + 0.01 * 10, 5);
    });

    it("ne s'accumule pas si l'alimentation est insuffisante", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.momentumUnlocked = true;
      state.solarFarms = 1; // 50 MW
      state.harvesterDrones = 100; // demande 100 MW, batterie vide
      const land = new LandSystem(state);

      land.update(10_000);

      expect(state.powMod).toBeCloseTo(0.5, 5);
    });

    it("n'a aucun effet tant que le projet Élan n'est pas acquis", () => {
      const state = GameState.createInitial();
      state.powerGridUnlocked = true;
      state.solarFarms = 1;
      const land = new LandSystem(state);

      land.update(10_000);

      expect(state.powMod).toBe(1);
    });
  });
});
