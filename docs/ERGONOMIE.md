# Ergonomie (lot L8.3)

Fichier écrit par `tools/mesures/ergonomie.mjs` : boutons et textes plus petits que les cibles de D-23 (tablette ≥ 48 px et texte ≥ 18 px, 15 px sous 680 px de haut ; téléphone ≥ 44 px et ≥ 15 px), écran par écran, au format de chaque appareil.

## Tab A9+ / A11+ (1920 × 1200)

- **accueil** (1 rem = 30.0 px) : rien à signaler
- **journées** (1 rem = 30.0 px) : rien à signaler
- **jeu** (1 rem = 30.0 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 30.0 px) : rien à signaler
- **bilan** (1 rem = 30.0 px) : rien à signaler
- **boutique** (1 rem = 30.0 px) : rien à signaler

## Tab A7 (1334 × 800)

- **accueil** (1 rem = 20.0 px) : rien à signaler
- **journées** (1 rem = 20.0 px) : rien à signaler
- **jeu** (1 rem = 20.0 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 20.0 px) : rien à signaler
- **bilan** (1 rem = 20.0 px) : rien à signaler
- **boutique** (1 rem = 20.0 px) : rien à signaler

## Tab A6 10.1" (1280 × 800)

- **accueil** (1 rem = 20.0 px) : rien à signaler
- **journées** (1 rem = 20.0 px) : rien à signaler
- **jeu** (1 rem = 20.0 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 20.0 px) : rien à signaler
- **bilan** (1 rem = 20.0 px) : rien à signaler
- **boutique** (1 rem = 20.0 px) : rien à signaler

## Tab A 7" (960 × 600)

- **accueil** (1 rem = 15.0 px) : rien à signaler
- **journées** (1 rem = 15.0 px) : rien à signaler
- **jeu** (1 rem = 15.0 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 15.0 px) : rien à signaler
- **bilan** (1 rem = 15.0 px) : rien à signaler
- **boutique** (1 rem = 15.0 px) : rien à signaler

## Galaxy S23 Ultra (915 × 412)

- **accueil** (1 rem = 17.9 px) : rien à signaler
- **journées** (1 rem = 17.9 px) : rien à signaler
- **jeu** (1 rem = 17.9 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 17.9 px) : rien à signaler
- **bilan** (1 rem = 17.9 px) : rien à signaler
- **boutique** (1 rem = 17.9 px) : rien à signaler

## iPhone 11 (896 × 414)

- **accueil** (1 rem = 17.5 px) : rien à signaler
- **journées** (1 rem = 17.5 px) : rien à signaler
- **jeu** (1 rem = 17.5 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 17.5 px) : rien à signaler
- **bilan** (1 rem = 17.5 px) : rien à signaler
- **boutique** (1 rem = 17.5 px) : rien à signaler

## iPhone 14 (844 × 390)

- **accueil** (1 rem = 16.4 px) : rien à signaler
- **journées** (1 rem = 16.4 px) : rien à signaler
- **jeu** (1 rem = 16.4 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 16.4 px) : rien à signaler
- **bilan** (1 rem = 16.4 px) : rien à signaler
- **boutique** (1 rem = 16.4 px) : rien à signaler

## Galaxy S20 (800 × 360)

- **accueil** (1 rem = 15.5 px) : rien à signaler
- **journées** (1 rem = 15.5 px) : rien à signaler
- **jeu** (1 rem = 15.5 px) : rien à signaler
- **jeu (tutoriel)** (1 rem = 15.5 px) : rien à signaler
- **bilan** (1 rem = 15.5 px) : rien à signaler
- **boutique** (1 rem = 15.5 px) : rien à signaler

**Total : 0 points.**

## Fluidité (2026-11-11, lot L8.3)
Mesurée par `tools/mesures/fps.mjs` sur la version construite (`npm.cmd run build`, aperçu `game-pwa-4181`), processeur
ralenti 3 fois (proche d'une tablette d'entrée de gamme), Edge sans fenêtre et sans carte graphique (cas pessimiste),
journée d'hiver en ×4. Images par seconde sur 8 secondes ; objectif ≥ 30.

| Format | Crépuscule (17 h → 20 h) | Journée avec événement (11 h) |
|---|---|---|
| 1920 × 1200 | 44 (27 avant l'allègement) | 54 |
| 1280 × 800 | 47 (30 avant) | 56 |
| 960 × 600 | 47 (41 avant) | 56 |
| 844 × 390 | 50 (46 avant) | 58 |
| 800 × 360 | 51 (44 avant) | 57 |

Allègement : en ×4, la lumière de la ville ne change plus qu'une fois par heure de jeu (au lieu de toutes les 5 minutes),
donc la ville est repeinte 3 fois moins souvent au crépuscule.
