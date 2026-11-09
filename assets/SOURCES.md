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
- La ville est dessinée directement dans le code (`apps/game/src/play/City.tsx` et `play/city/`) ; passe « plus réaliste »
  (D-09) le 2026-11-08 : centrale, bâtiments, rue, habitants, véhicules. Dessins de la boutique refaits le même jour. Saisons (neige, fleurs, climatiseurs, arbres nus) ajoutées le 2026-11-08 (passe L2).
  À reprendre dans Figma quand la limite le permettra.

## Bâtiments de la boutique (`objets/`) — 2026-11-09 (lot L6.1)
15 images WebP (384 px au plus depuis le lot L6.2, 351 Ko en tout), réduites par Claude à partir des PNG Gemini de `gemini/` (images IA,
même point ouvert que Cassandra avant diffusion) : ferme ← `asset_25_ferme_moderne`, reseau-chaleur ← `asset_39_tuyau_chaleur`,
maison-lilas ← `asset_26`, maison-ve ← `asset_27`, epicerie ← `asset_28`, ecole ← `asset_29`, usine-cereales ← `asset_13_usine_1`,
maison-medicale ← `asset_30`, batterie ← `asset_31`, parc ← `asset_32_parc_arbore`, piscine ← `asset_33`,
isolation ← `asset_46_bonnet_laine_cheminee`, solaire ← `asset_35`, hopital ← `asset_14_hopital`, cuve ← `asset_34`.
Fontaine, piste cyclable et lampadaires gardent leur dessin SVG (`shop/`).

## Musique (`audio/`) — 2026-11-09
- `musique-happy-clappy-loop.wav` : « Happy Clappy Loop » de **OwlishMedia**, licence **CC0** (domaine public, aucune
  citation obligatoire), https://opengameart.org/content/happy-clappy-loop ; fichier d'origine `HappyClappyLoop.wav`
  (6 162 894 o, WAV stéréo 44,1 kHz, empreinte SHA-256 `1ca66b4e4d41e14a…`). Choisie par Yann parmi 3 morceaux CC0.
  Allégée par Claude (mono, 32 kHz, 16 bits, 1,1 Mo ; boucle de 17,4 s gardée sans coupure ; SHA-256 `f2ad60897d9547e2…`).
- Les bruitages (clic, pièce, alerte, petite musique du bilan) sont des notes calculées dans le code
  (`apps/game/src/sound.ts`) : aucun fichier, aucune source externe.

## Images Gemini (`gemini/`) — 2026-11-08
56 PNG transparents (30 le 2026-11-08 après-midi, 26 le soir) générés par Yann avec l'app Gemini (IA) à partir des prompts de `docs/GEMINI.md`, livrés en JPG
puis détourés par Claude (`tools/detourage/detoure.py`). Liste, empreintes et remarques : `docs/GEMINI.md` § 3.
Copie locale des originaux du Drive : `Jeu centrale – assets/`. **Pas encore utilisés dans le jeu ; gardés sur le PC de Yann, hors de Git pour le moment.** Même point ouvert que Cassandra : conditions d'usage des images IA avant diffusion.
Image de référence de style `docs/gemini/reference-style-ville.jpg` : fournie par Yann, origine à préciser, **ne pas
utiliser dans le jeu**.
