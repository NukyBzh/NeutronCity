# Registre des sujets à traiter — Nuki Town

*Tout ce qui est repéré mais pas encore réglé : bogues, améliorations, vérifications et tâches en attente. Un sujet
par ligne, numéroté **S-xx** dans l'ordre où il est ouvert ; on ne renumérote jamais. À relire au début d'un lot et
avant chaque livrable.*

**Ce qui n'a pas sa place ici** : les retours d'essai (`docs/RETOURS.md`, séries R1 et R2), les décisions prises
(`docs/DECISIONS.md`, D-xx) et l'état d'avancement (`docs/STATUS.md`). Un retour d'essai qui n'est pas traité dans la
foulée devient un sujet ici, avec un renvoi vers son numéro R.

**Type** : *bogue* (ça ne marche pas comme prévu), *amélioration* (ça marche, ce serait mieux autrement),
*vérification* (à contrôler avant de diffuser), *tâche* (travail connu, à faire au bon moment).
**État** : *ouvert*, *en attente* (bloqué par quelqu'un ou quelque chose, dit par quoi), *fait le …* (on garde la
ligne, barrée mentalement, pour l'historique).

| N° | Ouvert le | Type | Sujet | Où | Qui | État |
|---|---|---|---|---|---|---|
| S-01 | 2026-11-21 | amélioration | **Les jambes des piétons ne bougent pas.** Les images du 2<sup>e</sup> pas (71 à 74) n'ont pas pu être générées : Gemini renvoie l'image d'origine inchangée, ou bien un autre personnage. En attendant, le piéton monte et descend de 8 % de sa hauteur à chaque pas (lot L10.5a), ce qui enlève l'impression de glisser. **Le code qui alterne les deux pas est déjà écrit et testé** : il suffira de déposer `habitant-adulte-2.webp` et `habitant-enfant-2.webp` dans `assets/ville/` et de les ajouter à `TOWN_IMAGES`. Autres pistes si Gemini n'y arrive pas : dessiner le 2<sup>e</sup> pas à la main par-dessus le 1<sup>er</sup>, ou déformer légèrement l'image en code (jambes étirées en alternance). | `docs/GEMINI-R2.md` § 1 | Yann (images) | en attente |
| S-02 | 2026-11-08 | vérification | **Conditions d'usage des images générées par IA** (Cassandra, la ville, les bâtiments, les événements) à vérifier avant toute diffusion publique. | `assets/SOURCES.md` | Yann | ouvert |
| S-03 | 2026-11-11 | vérification | **Le nom « Nuki Town » et le logo** : marque déposée, autre jeu du même nom ? À regarder avant diffusion. Le dépôt GitHub et le dossier du projet gardent l'ancien nom « Neutron City ». | D-27 | Yann | ouvert |
| S-04 | 2026-11-20 | vérification | **Le dépôt GitHub apparaît public chez Netlify** alors qu'il devait rester privé. | — | Yann | ouvert |
| S-05 | 2026-11-20 | tâche | **Étiquettes v0.7.0 à v0.14.0 à poser** sur les commits, quand Yann valide les versions correspondantes (colonne « Commit »). | `docs/CONFIGURATION.md` | Claude | ouvert |
| S-06 | 2026-11-20 | vérification | **Fluidité sur une vraie tablette** : jamais essayée depuis le nouvel écran de jeu (L10.3). 38 à 41 images/s mesurées au pire moment sur le PC, processeur ralenti 3 fois. | D-31 | Yann | ouvert |
| S-07 | 2026-11-21 | tâche | **Mesure de fluidité à refaire au calme** : celle du lot L10.5a a été faite pendant que Cyberpunk 2077 tournait (20 images/s au lieu de 63 le matin). La comparaison avec et sans l'animation a été faite dans les mêmes conditions et ne montre aucun écart, mais le chiffre absolu n'est pas exploitable. | `tools/mesures/fps.mjs` | Claude | ouvert |
| S-08 | 2026-11-11 | tâche | **Fusionner `docs/GEMINI-R2.md` dans `docs/GEMINI.md`** quand l'autre session (prompt du cochon tirelire, série 8) aura fini ses modifications non commitées. | `docs/GEMINI.md` | Claude | en attente |
| S-09 | 2026-11-21 | amélioration | **Les visites ne marchent que pour les bâtiments posés le long d'une rue** (rangées 1, 4 et 7 : 13 des 30 terrains). Ailleurs, l'habitant devrait traverser un autre terrain et serait dessiné par-dessus les maisons. Piste : autoriser aussi les terrains du fond quand le terrain devant est une pelouse libre (il suffit de le vérifier), ou découper la couche comme pour les voitures des rues perpendiculaires (D-31). | `town.ts`, `visitItems` | Claude | ouvert |
