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

## La ville (`ville/`) — 2026-11-09 (lot L6.3)
46 images WebP (320 px au plus pour les bâtiments, 256 px pour les tuiles, 160 px pour les véhicules ; 669 Ko en tout), réduites par Claude à partir
des PNG Gemini de `gemini/` (images IA, même point ouvert que Cassandra) : tuiles 23 à 27, immeuble 11 et 12 (jour, nuit,
neige, coupure), maisons 16, usines 13 (2 et 3), gare 15, centrale 01 à 10, arbre 19, lampadaire 20, panneau d'alerte 21,
enfants 42, balançoire 43, oiseaux 44 (lot L9.3 : planche découpée en 4 oiseaux tournés à gauche, deux paires ailes hautes / basses calées sur l'œil : `oiseau-bleu-haut`, `oiseau-bleu-bas`, `oiseau-jaune-haut`, `oiseau-jaune-bas`, 128 px) ; série 3 : voitures 48 à 51, bus 52, habitants 53 à 55, bâtiments 58 à 63 (noms courts : `immeuble-nuit` ← `asset_11_immeuble_nuit_allume`, etc.).

## Fond des autres écrans (`fond-jeu.webp`) et cochon tirelire (`icons/tirelire.webp`) — 2026-11-11 (lot L9.3)
Images fournies par Yann (images IA, même point ouvert que Cassandra) : `assets/Jeu centrale – assets/asset_66_fond.jpg`
réduite en WebP (qualité 82, 1312 × 816) ; `asset_65_cochon.jpg` détouré (fond vert, `tools/detourage/detoure.py`),
recadré et réduit à 256 px. L'image WebP remplace l'icône SVG du même nom partout (en-tête, boutique, bilan, tutoriel).

## Campagne autour de la ville (`ville/arriere-ville.webp`) — 2026-11-11 (lot L9.3)
Image fournie par Yann (`assets/Jeu centrale – assets/asset_67_arrière_ville.jpg`, image IA) : ciel au-dessus des
collines rendu transparent (le ciel du jeu passe derrière), WebP qualité 80, 1024 × 1024. Son losange vert foncé est
calé sous les terrains de la ville (`BACKDROP` dans `apps/game/src/play/iso/town.ts`).

## Fond de l'écran d'accueil (`fond-accueil.webp`) — 2026-11-11
Image fournie par Yann (`assets/Jeu centrale – assets/Image_d_accueil_1.jpg`), réduite en WebP (qualité 82, 1312 × 816).

## Bâtiments de la boutique (`objets/`) — 2026-11-09 (lot L6.1)
15 images WebP (384 px au plus depuis le lot L6.2, 351 Ko en tout), réduites par Claude à partir des PNG Gemini de `gemini/` (images IA,
même point ouvert que Cassandra avant diffusion) : ferme ← `asset_25_ferme_moderne`, reseau-chaleur ← `asset_64_reseau_chaleur` (station de chaleur collée à la centrale, 2026-11-10 ; avant : `asset_39_tuyau_chaleur`),
maison-lilas ← `asset_26`, maison-ve ← `asset_27`, epicerie ← `asset_28`, ecole ← `asset_29`, usine-cereales ← `asset_13_usine_1`,
maison-medicale ← `asset_30`, batterie ← `asset_31`, parc ← `asset_32_parc_arbore`, piscine ← `asset_33`,
isolation ← `asset_46_bonnet_laine_cheminee`, solaire ← `asset_35`, hopital ← `asset_14_hopital`, cuve ← `asset_34`.
Depuis le lot L6.3 : fontaine ← `asset_56_fontaine`, piste ← `asset_57_tuile_piste_cyclable`, eclairage ← `asset_20_lampadaire` (les SVG de `shop/` ne servent plus).

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

## Sons des événements (`audio/evenements/`) — 2026-11-21 (lot L10.4, R2-01)
Huit extraits **CC0** (domaine public, aucune citation obligatoire) pris sur **OpenGameArt**, choisis par Yann le
2026-11-21 parmi les paquets ci-dessous. Chaque extrait a été coupé, passé en **mono 16 000 ou 22 050 Hz, 16 bits**
et normalisé à 0,89 de crête ; les trois boucles (pluie, foule, vent) sont raccordées par un fondu enchaîné, donc
sans coupure audible. Format WAV comme la musique : l'Ogg des sources n'est pas lu partout (iPhone). 772 Ko en tout.

| Fichier | Rôle | Source (paquet d’origine) | Auteur | Licence | Extrait | Sortie | SHA-256 (début) |
|---|---|---|---|---|---|---|---|
| `pluie.wav` | pluie (boucle) | [30 CC0 SFX loops](https://opengameart.org/content/30-cc0-sfx-loops) | rubberduck | CC0 | sfx_loops.zip (3 526 706 o) → rain.ogg | 22 050 Hz, 3,59 s | `5eb76b5b06a6d9e2…` |
| `tonnerre.wav` | tonnerre | [100 CC0 SFX #2](https://opengameart.org/content/100-cc0-sfx-2) | rubberduck | CC0 | sfx_100_v2.zip (2 367 871 o) → sfx100v2_thunder_01.ogg | 16 000 Hz, 4,60 s | `5e6e81fff2053cf3…` |
| `verres.wav` | verres qui trinquent | [100 CC0 SFX #2](https://opengameart.org/content/100-cc0-sfx-2) | rubberduck | CC0 | sfx_100_v2.zip → sfx100v2_glass_04.ogg | 22 050 Hz, 0,23 s | `1230b1f29eb3029e…` |
| `feu-artifice-1.wav` | feu d’artifice 1 | [25 CC0 bang / firework SFX](https://opengameart.org/content/25-cc0-bang-firework-sfx) | rubberduck | CC0 | 25-CC0-bang-sfx.zip (1 390 498 o) → fw_02.ogg | 22 050 Hz, 1,11 s | `f8ba045041b21055…` |
| `feu-artifice-2.wav` | feu d’artifice 2 | [25 CC0 bang / firework SFX](https://opengameart.org/content/25-cc0-bang-firework-sfx) | rubberduck | CC0 | 25-CC0-bang-sfx.zip → fw_03.ogg | 22 050 Hz, 1,32 s | `6a391ae3cdd6ab42…` |
| `foule.wav` | foule de la fête (boucle) | [Crowd Shouting/Speaking Ambience](https://opengameart.org/content/crowd-shoutingspeaking-ambience) | StarNinjas | CC0 | crowd_shouting_0.ogg (335 526 o), extrait 2 s → 8,5 s | 16 000 Hz, 6,00 s | `c26ee2c4675bf137…` |
| `ouais.wav` | « ouais ! » | [Au yeah!](https://opengameart.org/content/au-yeah) | IgnasD | CC0 | auye.zip (43 869 o) → auye/Auye1.ogg | 16 000 Hz, 1,50 s | `2f955f1e1a22a007…` |
| `vent.wav` | vent de la vague de froid (boucle) | [wind whoosh loop](https://opengameart.org/content/wind-whoosh-loop) | SketchMan3 | CC0 | wind woosh loop.ogg (251 584 o) | 16 000 Hz, 4,00 s | `552683d904c406f8…` |

Les bruitages de l’interface (clic, pièce, alerte, petite musique du bilan) restent des notes calculées dans le code.

## Images des événements (`ville/`) — 2026-11-21 (lot L10.4, R2-01)
Neuf images fournies par Yann (Gemini, prompts de `docs/GEMINI-R2.md` § 3 ; mêmes conditions d'usage à vérifier que
Cassandra), détourées par Claude (`tools/detourage/detoure.py`) puis réduites en WebP : **410 Ko en tout**.
Le cadre de givre a été détouré à part : son bord est du givre et non du fond, donc le script, qui devine la couleur
du fond sur le bord de l'image, se trompait ; le magenta a été enlevé explicitement.

| Fichier | Image d’origine | Rôle dans le jeu | Fond | Taille |
|---|---|---|---|---|
| `ville/guirlandes.webp` | `asset_85_*.png.jpg` | guirlandes de la fête, au-dessus de la place | magenta | 15 Ko |
| `ville/foule-fete.webp` | `asset_86_*.png.jpg` | habitants rassemblés sur la place | vert | 51 Ko |
| `ville/feu-artifice.webp` | `asset_87_*.png.jpg` | gerbes dans le ciel (trois, l’une après l’autre) | magenta | 114 Ko |
| `ville/ecureuil.webp` | `asset_88_*.png.jpg` | écureuil assis sur le pylône du quartier coupé | vert | 12 Ko |
| `ville/ecureuil-gros.webp` | `asset_89_*.png.jpg` | le même en gros, dans la loupe en bas à droite | vert | 20 Ko |
| `ville/givre.webp` | `asset_90_*.png.jpg` | cadre de givre sur le pourtour (vague de froid) | magenta | 151 Ko |
| `ville/ouvrier.webp` | `asset_91_*.png.jpg` | ouvrier qui calorifuge le tuyau (après la vanne fermée) | vert | 20 Ko |
| `ville/eclair.webp` | `asset_92_*.png.jpg` | éclair de la tempête | magenta | 13 Ko |
| `ville/nuage-orage.webp` | `asset_93_*.png.jpg` | nuages sombres au-dessus de la ville (tempête) | magenta | 11 Ko |
| `ville/panneau-a-vendre.webp` | `asset_94_panneau_a_vendre.png.jpg` | panneau « À VENDRE » planté sur chaque quartier à vendre (lot L10.6b2) | vert | 10 Ko |

Pluie, air qui ondule, voiles de couleur, soleil du redoux et fenêtres allumées du pic restent faits en code
(`apps/game/src/play/iso/weather.ts`, `WeatherLayer.tsx`), sans image.

## Habitants (`ville/`) — 2026-11-21 (lot L10.5a, R2-05)
Images fournies par Yann (Gemini, prompts de `docs/GEMINI-R2.md` § 1), détourées et réduites à 96 px de haut
(128 pour une famille), comme les habitants déjà là. 20 Ko en tout.

| Fichier | Image d’origine | Rôle |
|---|---|---|
| `ville/habitant-adulte-dos.webp` | `asset_68_*.png.jpg` | adulte vu de dos (pour entrer dans un bâtiment, lot L10.5b) |
| `ville/habitant-enfant-dos.webp` | `asset_69_*.png.jpg` | enfant vu de dos (lot L10.5b) |
| `ville/famille-dos.webp` | `asset_70_*.png.jpg` | famille vue de dos (lot L10.5b) |
| `ville/dame-agee.webp` | `asset_75_*.png.jpg` | dame âgée avec son panier : nouvelle passante, rues 2 et 8 |
| `ville/dame-agee-dos.webp` | `asset_76_*.png.jpg` | la même de dos (lot L10.5b) |

**Non retenues** : les images 71 à 74 (« 2e pas » des personnages) montrent chaque fois **un autre**
**personnage** (vêtements, sac et style différents du 1er pas), et la 73 a un décor de ville entier en fond
au lieu d'un fond vert uni. Alterner les deux pas ferait changer de vêtements le passant deux fois par seconde :
elles ne sont pas dans le dépôt. La marche est donc animée en code (le passant monte et descend de 8 % de sa
hauteur à chaque pas). À regénérer si on veut de vraies jambes qui bougent (prompt corrigé dans
`docs/GEMINI-R2.md` § 1).

## Nouveaux bâtiments de la boutique (`objets/`) — 2026-11-21 (lot L10.6a, R2-06)
Huit images fournies par Yann (Gemini, prompts de `docs/GEMINI-R2.md` § 2 ; mêmes conditions d'usage à vérifier
que Cassandra), détourées (fond magenta) et réduites en WebP à 384 px : 158 Ko en tout.

| Fichier | Image d’origine | Rôle |
|---|---|---|
| `objets/petite-maison.webp` | `asset_77_*.png.jpg` | petite maison bleue (achetable plusieurs fois) |
| `objets/petite-maison-b.webp` | `asset_78_*.png.jpg` | la même en jaune : un exemplaire sur deux |
| `objets/immeuble-neuf.webp` | `asset_79_*.png.jpg` | immeuble neuf vert (achetable plusieurs fois) |
| `objets/immeuble-neuf-b.webp` | `asset_80_*.png.jpg` | le même en corail : un exemplaire sur deux |
| `objets/mairie.webp` | `asset_81_*.png.jpg` | la mairie : la fête de la ville bien plus souvent |
| `objets/hotel.webp` | `asset_82_*.png.jpg` | l'hôtel |
| `objets/patisserie.webp` | `asset_83_*.png.jpg` | boulangerie-pâtisserie (remplace celle du décor, `asset_61`) |
| `objets/caserne.webp` | `asset_84_*.png.jpg` | caserne de pompiers : pannes réparées deux fois plus vite |

La boulangerie du décor (`ville/boulangerie.webp`, `asset_61`) n'est plus dessinée dans la ville : seule celle de la
boutique reste (R2-06). Le fichier est gardé au cas où.
