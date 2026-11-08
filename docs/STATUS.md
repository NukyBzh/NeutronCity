# Neutron City — état d'avancement

*À lire au début de chaque session. Règles de travail : `PROMPT-neutron-city.md` (lots validés un par un, accord
avant tout commit, installation, envoi sur GitHub ou action irréversible).*

## Jalons
| Version | Lot | État |
|---|---|---|
| v0.1.0 | L0 Cadrage | **Fait** le 2026-11-08 : cadrage validé (D-01 à D-06), dépôt `NukyBzh/NeutronCity` (privé), squelette ; commit `addec57`, étiquette v0.1.0 |
| v0.2.0 | L1 Maquettes | **Fait** le 2026-11-08 : page Style et 21 icônes dans Figma (limite Starter atteinte ensuite) ; maquette cliquable validée (D-08) : accueil, journées, jeu, pause, bilan, boutique ; captures dans `docs/maquettes/`. Passe dessins (D-09) faite, en attente de validation → v0.2.1 |
| v0.3.0 | L2 Moteur | **Fait** le 2026-11-08 : moteur, 3 journées et boutique en YAML, interface branchée (D-10 à D-12) ; commit `ce3068c`. Passe dessins des saisons faite (v0.3.1). Style de la ville choisi le 2026-11-08 : **B isométrique pour enfants** (D-13, remplace D-03) ; intégrée en v0.4.0 |
| v0.4.0 | L3 Pilotage | **Fait** le 2026-11-08, validé, commit `c421f2b`, étiquette v0.4.0 : journée jouable de 6 h à minuit sur PC et tablette (navigateur), ville isométrique (D-13) en bandeau dans le jeu et entière dans la boutique et le bilan, progression enregistrée (D-14) |
| v0.4.1 | L3.1 Corrections du test R1 | **Fait** le 2026-11-08, commit `a499231` (étiquette après essai sur la tablette) : R1-01 à R1-07 (voitures, fontaine, heure hh:mm, demande en chiffres, vitesses ×1/×2/×4, place de Cassandra) ; APK `livrables/Neutron-City-0.4.1.apk` |
| v0.5.0 | L3.2 Règles et boutique (R1) | **Fait** le 2026-11-08, en attente de validation : bande ±7 % et malus de surproduction (D-15, choix confirmés), journées plus contrastées et rampe 15 %/h (D-16), objet acheté montré dans la ville (R1-08) ; APK `livrables/Neutron-City-0.5.0.apk`. L4 à L9 décalés d’une version mineure |
| v0.6.0 | L4 Ville animée et ciel | **Fait** le 2026-11-08, en attente de validation : ciel heure par heure, soleil, lune, étoiles, nuages (R1-11, R1-12) ; ombres, arbres, lumière du soir (R1-14 en partie) ; ville en couches pour la tablette (D-17) ; APK `livrables/Neutron-City-0.6.0.apk` |
| v0.6.0 | L5 Cassandra | À faire |
| v0.7.0 | L6 Boutique | À faire |
| v0.8.0 | L7 Journées | À faire |
| v0.9.0 | L8 Tablette | À faire |
| v1.0.0 | L9 Essai enfants | À faire |

## Documents
- `docs/CADRAGE.md` — cadrage validé.
- `docs/DECISIONS.md` — décisions D-01 à D-17.
- `docs/RETOURS.md` — retours de test (R1 : premier essai sur la tablette).
- `docs/tablette.md` — installer l’APK sur la Galaxy Tab A9+.
- `docs/CONFIGURATION.md` — règles Git, retour en arrière, journal des versions.
- `CHANGELOG.md` — changements pour le joueur.

## À faire après chaque lot (D-09)
- Passe « dessins » : rendre plus réalistes les dessins utilisés par le lot qui vient de se terminer. Passe L1 faite le 2026-11-08 (ville, centrale, habitants, véhicules, boutique ; icônes gardées simples, ce sont des pictogrammes). Passe L2 faite le 2026-11-08 : la ville prend la saison de la journée.

## Revoir la maquette
- `npm.cmd run dev`, puis http://localhost:5180 ; réglages d'adresse : `?vitesse=20` (journée en 15 s), `?ecran=jeu&journee=ete&heure=19&suivi=non&achats=parc,fontaine&nouveau=fontaine` (écran, journée, heure de départ, joueur qui ne bouge pas, achats) ; `&graine=42` pour rejouer les mêmes surprises. Captures : Edge sans fenêtre (`msedge --headless=new --screenshot`).

## Version de test (2026-11-08)
- **Retours du premier test sur la tablette** (R1, 14 points) : `docs/RETOURS.md`, avec les lots proposés L3.1, L3.2, L4, L5 (à valider).
- **APK pour la Galaxy Tab A9+** (2026-11-08) : `npm.cmd run android` → `livrables/Neutron-City-<version>.apk` ; installation et conseils de test : `docs/tablette.md`.
- Par le Wi-Fi : `npm.cmd run build` puis, dans `apps/game` : `npx.cmd vite preview --host 0.0.0.0 --port 4180` ; sur le même Wi-Fi : http://<adresse du PC>:4180 (192.168.1.24 le 2026-11-08). Progression enregistrée sur l'appareil (D-14) ; « Nouveau joueur » sur l'accueil entre deux enfants. Retours du test avec les enfants à intégrer.

## Points ouverts
- Fichier Figma créé le 2026-11-08 : https://www.figma.com/design/K1BdqYcOLPZ4vCc7bomwdC (lien dans `assets/SOURCES.md`).
- Conditions d'usage des images générées par IA (dont Cassandra) à vérifier avant une diffusion publique.
- Nom « Neutron City » : nom de travail, à vérifier avant diffusion.
