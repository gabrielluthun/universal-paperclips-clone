# Fun project : Universal Paperclips (clone)

Jeu incrémental web inspiré d’[Universal Paperclips](https://www.decisionproblem.com/paperclips/), en français.
*Et aussi parce que le développeur aime beaucoup le jeu. Et les trombones aussi.*

## État du jeu
*en cours de développement*

**Phase 1 (business)** est jouable de bout en bout :

- production manuelle / auto / méga, fil, marché (prix, demande, marketing)
- confiance, processeurs, mémoire, ops, créativité
- plateau de projets
- modélisation stratégique (tournois → Yomi) et investissements
- calcul quantique (version simplifiée)
- fin de phase via *HypnoDrones,* puis *Libérer les HypnoDrones*

**Phase 2 (Terre)** est jouable :

- fondations Terre, réseau électrique (fermes solaires, batteries)
- drones récolteurs / fileurs, matière → fil → trombones
- usines à trombones et projets d’efficacité (drones, usines, élan)
- informatique en essaim (curseur travail / réflexion, cadeaux, ennui, désorganisation)
- fin de phase via *Exploration spatiale* (overlay teaser vers la phase 3)

**Phase 3 (espace)** : pas encore implémentée.

## Stack

- **Vite** + **TypeScript** (no UI framework)
- **Tailwind CSS v4** via PostCSS
- **Vitest** (happy-dom) pour les tests
- sauvegarde locale via `localStorage`

## Prérequis

- Node.js 20+ recommandé
- npm

## Installation

```bash
npm install
```

## Scripts

| Commande                | Description                     |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Serveur de développement (Vite) |
| `npm run build`         | `tsc` + build production        |
| `npm run preview`       | Prévisualiser le build          |
| `npm test`              | Tests unitaires                 |
| `npm run test:watch`    | Tests en mode watch             |
| `npm run test:coverage` | Couverture de code              |

## Jouer en local

```bash
npm run dev
```

Ouvrir l’URL affichée (souvent `http://localhost:5173`).

## Architecture

Architecture POO en **systèmes de jeu** (Game Loop + `GameSystem.update`) avec état partagé (`GameState`) :

```
src/
  main.ts                 bootstrap + CSS
  game/Game.ts            orchestrateur (tick, save, UI)
  state/                  GameState, SaveManager, fields/, migrations
  systems/
    core/                 GameSystem
    production/ market/ compute/
    invest/ quantum/ projects/
    strategic/            tournois + Yomi
    land/                 phase 2 (Terre) : énergie, drones, usines, essaim
  projects/               coûts, catalogues phase 1 et phase 2
  ui/
    Renderer.ts           orchestre le rendu
    panels/               un panneau UI par domaine
  util/                   NumberFormatter, BigAmount
  style.css               Tailwind + thème + grille 3 colonnes
```

## Déploiement

Déploiement effectué via GitHub Pages, jouable [ici](https://gabrielluthun.github.io/universal-paperclips-clone/).

## Licence

Projet personnel / fun project.
