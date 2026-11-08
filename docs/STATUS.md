# Neutron City — état d'avancement

*À lire au début de chaque session. Règles de travail : `PROMPT-neutron-city.md` (lots validés un par un, accord
avant tout commit, installation, envoi sur GitHub ou action irréversible).*

## Jalons
| Version | Lot | État |
|---|---|---|
| v0.1.0 | L0 Cadrage | **Fait** le 2026-11-08 : cadrage validé (D-01 à D-06), dépôt `NukyBzh/NeutronCity` (privé), squelette ; commit `addec57`, étiquette v0.1.0 |
| v0.2.0 | L1 Maquettes | **Fait** le 2026-11-08 : page Style et 21 icônes dans Figma (limite Starter atteinte ensuite) ; maquette cliquable validée (D-08) : accueil, journées, jeu, pause, bilan, boutique ; captures dans `docs/maquettes/`. Passe dessins (D-09) faite, en attente de validation → v0.2.1 |
| v0.3.0 | L2 Moteur | À faire |
| v0.4.0 | L3 Pilotage | À faire |
| v0.5.0 | L4 Ville animée | À faire |
| v0.6.0 | L5 Cassandra | À faire |
| v0.7.0 | L6 Boutique | À faire |
| v0.8.0 | L7 Journées | À faire |
| v0.9.0 | L8 Tablette | À faire |
| v1.0.0 | L9 Essai enfants | À faire |

## Documents
- `docs/CADRAGE.md` — cadrage validé.
- `docs/DECISIONS.md` — décisions D-01 à D-09.
- `docs/CONFIGURATION.md` — règles Git, retour en arrière, journal des versions.
- `CHANGELOG.md` — changements pour le joueur.

## À faire après chaque lot (D-09)
- Passe « dessins » : rendre plus réalistes les dessins utilisés par le lot qui vient de se terminer. Passe L1 faite le 2026-11-08 (ville, centrale, habitants, véhicules, boutique ; icônes gardées simples, ce sont des pictogrammes).

## Revoir la maquette
- `npm.cmd run dev`, puis http://localhost:5180 ; réglages d'adresse : `?vitesse=20` (journée en 15 s), `?ecran=jeu&journee=ete&heure=19&suivi=non&achats=parc,fontaine` (écran, journée, heure de départ, joueur qui ne bouge pas, achats). Captures : Edge sans fenêtre (`msedge --headless=new --screenshot`).

## Points ouverts
- Fichier Figma créé le 2026-11-08 : https://www.figma.com/design/K1BdqYcOLPZ4vCc7bomwdC (lien dans `assets/SOURCES.md`).
- Conditions d'usage des images générées par IA (dont Cassandra) à vérifier avant une diffusion publique.
- Nom « Neutron City » : nom de travail, à vérifier avant diffusion.
