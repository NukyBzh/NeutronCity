# Équilibrage (lot L7.2, D-22)

Fichier écrit par `tools/equilibrage` (`npx.cmd vitest run --config tools/equilibrage/vitest.config.ts`) : 200 parties par journée et par joueur simulé.
Ne pas modifier à la main : relancer l'outil après chaque réglage.

Joueurs simulés (`packages/engine/src/balance.ts`) :
- **parfait** : regarde un quart d'heure à l'avance et agit tout de suite sur chaque événement ;
- **enfant** : regarde la demande toutes les 20 minutes, sans anticiper, règle les curseurs dessus et agit une demi-heure après le début d'un événement (imitation grossière, à vérifier avec les enfants au lot L9) ;
- **sans-réparer** : suit la demande comme le joueur parfait mais ne touche jamais la ville ;
- **inactif** : ne touche à rien.

Étoiles : 3 dès 75 % du maximum, 2 dès 45 %. « Part du maximum » : euros gagnés (récompenses à part) divisés par le maximum de la journée.

## Étoiles

| Joueur | Journée | 1 étoile | 2 étoiles | 3 étoiles | Part du maximum |
|---|---|---|---|---|---|
| parfait | ete | 0 % | 0 % | 100 % | 100 % |
| parfait | hiver | 0 % | 0 % | 100 % | 100 % |
| parfait | printemps | 0 % | 0 % | 100 % | 100 % |
| enfant | ete | 0 % | 0 % | 100 % | 84 % |
| enfant | hiver | 0 % | 0 % | 100 % | 96 % |
| enfant | printemps | 0 % | 0 % | 100 % | 94 % |
| sans-réparer | ete | 0 % | 44 % | 56 % | 83 % |
| sans-réparer | hiver | 6 % | 45 % | 49 % | 81 % |
| sans-réparer | printemps | 6 % | 45 % | 49 % | 81 % |
| inactif | ete | 100 % | 0 % | 0 % | 2 % |
| inactif | hiver | 100 % | 0 % | 0 % | 21 % |
| inactif | printemps | 100 % | 0 % | 0 % | 23 % |

## Événements

| Journée | Par jour | Part des journées où chacun arrive |
|---|---|---|
| ete | 2.34 | peak 52 %, heatwave 23 %, squirrel 44 %, newcomers 73 %, classVisit 28 %, party 15 % |
| hiver | 2.30 | peak 32 %, coldWave 22 %, mildSpell 9 %, storm 34 %, squirrel 29 %, heatLeak 18 %, scale 18 %, newcomers 43 %, classVisit 15 %, party 13 % |
| printemps | 2.30 | peak 32 %, coldWave 22 %, mildSpell 9 %, storm 34 %, squirrel 29 %, heatLeak 18 %, scale 18 %, newcomers 43 %, classVisit 15 %, party 13 % |

## Argent (joueur « enfant », journées dans l'ordre)

Les 24 bâtiments du magasin tous achetés au moins une fois après **26 journées**.
Les 30 terrains du départ pleins après la journée **29** : l'enfant achète alors le premier quartier à vendre.
Les 48 terrains des quartiers achetés tous bâtis après **48 journées**.

| Quartier à vendre | Prix | Acheté après la journée |
|---|---|---|
| 1er | 20 000 € | 29 |
| 2e | 30 000 € | 34 |
| 3e | 50 000 € | 42 |

| Bâtiment | Acheté après la journée |
|---|---|
| reseau-chaleur | 1 |
| ferme | 2 |
| maison-lilas | 2 |
| maison-ve | 3 |
| epicerie | 4 |
| ecole | 5 |
| usine-cereales | 6 |
| maison-medicale | 8 |
| fontaine | 8 |
| parc | 9 |
| piste | 10 |
| piscine | 11 |
| eclairage | 12 |
| batterie | 14 |
| isolation | 16 |
| solaire | 17 |
| hopital | 19 |
| cuve | 21 |
| petite-maison | 21 |
| petite-maison-2 | 21 |
| immeuble-neuf | 22 |
| petite-maison-3 | 22 |
| patisserie | 23 |
| immeuble-neuf-2 | 23 |
| mairie | 24 |
| hotel | 25 |
| caserne | 26 |
| petite-maison-4 | 26 |
| immeuble-neuf-3 | 27 |
| immeuble-neuf-4 | 27 |
| petite-maison-5 | 29 |
| immeuble-neuf-5 | 30 |
| petite-maison-6 | 30 |
| immeuble-neuf-6 | 31 |
| petite-maison-7 | 31 |
| immeuble-neuf-7 | 32 |
| petite-maison-8 | 35 |
| immeuble-neuf-8 | 35 |
| petite-maison-9 | 36 |
| petite-maison-10 | 36 |
| petite-maison-11 | 37 |
| immeuble-neuf-9 | 38 |
| petite-maison-12 | 42 |
| immeuble-neuf-10 | 44 |
| immeuble-neuf-11 | 45 |
| immeuble-neuf-12 | 46 |
| petite-maison-13 | 47 |
| petite-maison-14 | 48 |
