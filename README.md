# Fun project : Universal Paperclips (clone)

Jeu incrémental web inspiré d’[Universal Paperclips](https://www.decisionproblem.com/paperclips/), en français. 
<small><i>Et aussi parce que le développeur aime beaucoup le jeu. Et les trombones aussi.</i></small>

**Phase 1 (business)** est jouable de bout en bout : production, marché, confiance / calcul, projets, bourse, quantique, puis *Libérer les HypnoDrones*. 
Les phases 2 (Terre) et 3 (espace) sont en cours de développement : un teaser s’affiche en fin de phase 1.

## Prérequis

- Node.js 20+ recommandé
- npm

## Installation

```bash
npm install
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Vite) |
| `npm run build` | Vérification TypeScript + build production |
| `npm run preview` | Prévisualiser le build |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |
| `npx vitest run --coverage` | Couverture de code |

## Jouer

```bash
npm run dev
```

Ouvrir l’URL affichée (souvent `http://localhost:5173`). 
La progression est sauvegardée automatiquement dans `localStorage`.

## Architecture

Architecture POO en **systèmes de jeu** (Game Loop + `GameSystem.update`) avec état partagé (`GameState`) :

```
src/
  main.ts                 bootstrap
  game/Game.ts            orchestrateur
  state/                  GameState, SaveManager
  systems/
    core/                 GameSystem
    production/ market/ compute/
    invest/ quantum/ projects/
  projects/               Project, coûts, catalogue phase 1
  ui/Renderer.ts
  util/NumberFormatter.ts
```

## Licence

Projet personnel / Fun project.
