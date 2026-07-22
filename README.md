# Fun project : Universal Paperclips (clone)

Jeu incrémental web inspiré d’[Universal Paperclips](https://www.decisionproblem.com/paperclips/), en français.
*Et aussi parce que le développeur aime beaucoup le jeu. Et les trombones aussi.*

## État du jeu

**Phase 1 (business)** est jouable de bout en bout :

- production manuelle / auto / méga, fil, marché (prix, demande, marketing)
- confiance, processeurs, mémoire, ops, créativité
- plateau de projets 
- modélisation stratégique (tournois → Yomi) et investissements
- calcul quantique (version simplifiée)
- fin de phase via *HypnoDrones,* puis *Libérer les HypnoDrones*

**Phases 2 (Terre) et 3 (espace)** : pas encore implémentées. Un teaser s’affiche après la fin de la phase 1.

## Stack

- **Vite** + **TypeScript** (sans framework UI, inutile ici)
- **Tailwind CSS v4** via PostCSS
- **Vitest** (happy-dom) pour les tests
- sauvegarde locale (`localStorage`)



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
  state/                  GameState, SaveManager
  systems/
    core/                 GameSystem
    production/ market/ compute/
    invest/ quantum/ projects/
    strategic/            tournois + Yomi
  projects/               coûts, projets configurables, catalogue phase 1
  ui/
    Renderer.ts           orchestre le rendu
    panels/               un panneau UI par domaine
  util/NumberFormatter.ts
  style.css               Tailwind + thème
```

## Déploiement (GitHub Pages — **Deploy from a branch**)

GitHub Pages **ne compile pas** TypeScript ni Tailwind. Il faut publier le **build**, pas `src/`.

1. En local : `npm run build` → génère le dossier `docs/`
2. Commit et push `docs/`
3. Settings → Pages → **Deploy from a branch** → branche `develop` (ou `main`) → dossier **`/docs`**

URL typique : `https://<user>.github.io/universal-paperclips-clone/`

`base: "./"` garantit que CSS/JS se chargent sous ce sous-chemin.


## Licence

Projet personnel / fun project.