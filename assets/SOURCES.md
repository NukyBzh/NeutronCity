# Origine des images

*Toute image du dépôt a ici sa ligne : fichier, origine (lien Figma), date, remarque. Aucune image reprise d'une source
externe ; les images EDF/NUWARD du projet NPP ne sont pas utilisées.*

**Point ouvert** : conditions d'usage des images générées par IA à vérifier avant une diffusion publique (concerne
Cassandra).

## Cassandra (`cassandra/`)
Recopiées le 2026-11-08 depuis le projet NPP (branche `jeu-decouverte`, `docs/design/game/assets/img/`), fichiers non
modifiés. Illustration générée par IA (Gemini via Figma, 2026-10-29) pour le projet NPP, découpée en PNG transparents.
Son visage n'est pas redessiné.

| Fichier | Pose | Empreinte SHA-256 (début) |
|---|---|---|
| `cassandra-accueil.png` | accueil (salue) | `c30923e0cca3328f` |
| `cassandra-explique.png` | explique (montre du doigt) | `e4ca3d8acbd65341` |
| `cassandra-attention.png` | attention (main levée) | `54d6b7b4308c9526` |
| `cassandra-bravo.png` | bravo (bras levés) | `8872ee4bc44eadee` |
| `cassandra-reflechit.png` | réfléchit | `92e249ab91048258` |
| `cassandra-planche.png` | planche des 5 poses | `a462ee00e4eb4bf7` |

## Fichier Figma du projet
« Neutron City — dessins » : https://www.figma.com/design/K1BdqYcOLPZ4vCc7bomwdC (créé par Claude le 2026-11-08 dans les brouillons du compte Figma du porteur du projet, équipe « L'équipe de Yann M. »).

## Icônes (`icons/`) et dessins de la boutique (`shop/`)
Dessins vectoriels écrits à la main en SVG (aucune image externe, aucune IA), le 2026-11-08.
- 21 icônes dessinées dans Figma (page « 1 · Icônes ») et recopiées ici depuis le même tracé : `electricite`, `chaleur`,
  `tirelire`, `piece`, `pause`, `jouer`, `etoile`, `boutique`, `accueil`, `cadenas`, `bien`, `presque`, `loin`,
  `monter`, `baisser`, `centrale`, `matin`, `midi`, `soir`, `nuit`, `surprise`.
- 4 icônes et 5 dessins de boutique faits **hors Figma** (limite d'appels de l'offre Starter, D-08), à importer dans
  Figma plus tard : `froid`, `coeur`, `recommencer`, `sourire` ; `shop/fontaine`, `parc`, `piste`, `eclairage`, `ecole`.
- La ville de la maquette est dessinée directement dans le code (`apps/game/src/play/City.tsx`), en formes simples :
  remplacée par les dessins Figma avant le lot L4.
