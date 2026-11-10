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

Ville complète en **19 journées**.

| Bâtiment | Acheté après la journée |
|---|---|
| ferme | 2 |
| reseau-chaleur | 3 |
| maison-lilas | 3 |
| maison-ve | 4 |
| epicerie | 5 |
| ecole | 6 |
| usine-cereales | 7 |
| maison-medicale | 8 |
| fontaine | 9 |
| parc | 9 |
| piste | 10 |
| piscine | 11 |
| eclairage | 12 |
| batterie | 14 |
| isolation | 15 |
| solaire | 16 |
| hopital | 18 |
| cuve | 19 |
