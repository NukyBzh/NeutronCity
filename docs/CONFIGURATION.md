# Gestion de configuration — Neutron City

*Créé le 2026-11-08 (lot L0), sur le modèle de celui du projet NPP. Ce document fait foi pour les règles ; le journal des
versions (§4) est tenu à jour à chaque étiquette.*

## 1. Où vit la configuration
| Élément | Où | Versionné ? |
|---|---|---|
| Code, contenu (journées, boutique, répliques), documentation | dépôt Git local, copie sur GitHub (dépôt **privé** `https://github.com/NukyBzh/NeutronCity.git`, branche `main`) | oui |
| Images exportées de Figma | `assets/`, avec le lien Figma de chacune dans `assets/SOURCES.md` | oui |
| Fichiers sources des dessins | dans Figma (fichier du projet, lien dans `assets/SOURCES.md`) | **non** (restent dans Figma) |
| Livrables construits (installeur Windows, APK) | `apps/desktop/src-tauri/target/…`, `out/` | **non** : on les reconstruit depuis une étiquette (§5) |
| Réglages locaux (`.env*`, `*.local`, `.claude/settings.local.json`) | PC du porteur du projet | **non** |

Le dépôt GitHub est créé **vide** (sans README ni licence) par le porteur du projet sur github.com : l'outil `gh`
n'est pas installé (choix Q5 du 2026-11-08).

## 2. Règles
1. **Branche principale `main`.** Un commit = un lot (ou une étape de lot) **validé** par le porteur du projet ; pas de
   travail non validé sur `main`. Message en anglais : `<lot>: <ce qui change>` (ex. `L2: plant ramp and demand curves`),
   corps qui dit pourquoi, puis la ligne `Co-Authored-By` de l'assistant. Code repris du projet NPP : le dire dans le
   corps du commit (fichier d'origine et branche).
2. **Essais longs ou risqués** sur une branche `feature/<sujet>`, fusionnée dans `main` (`git merge --no-ff`)
   seulement après validation.
3. **Envoi sur GitHub après chaque commit validé** (`git push`).
4. **Jamais de réécriture de l'historique publié** : pas de `git push --force`, pas de `git rebase` ni
   `git commit --amend` sur un commit déjà envoyé. On corrige par un nouveau commit (ou `git revert`, §3).
5. **Étiquettes annotées** `vMAJEUR.MINEUR.CORRECTIF` sur le commit qui clôt un jalon, puis envoyées
   (`git push origin <étiquette>`). Une étiquette envoyée ne se déplace pas.
   - MINEUR + 1 : jalon validé (un lot de la feuille de route) ;
   - CORRECTIF + 1 : retouches validées sans nouveau jalon ;
   - MAJEUR = 0 tant que le jeu n'a pas été essayé par des enfants ; **v1.0.0** = première version jouée par des enfants.
6. **Numéro de version aligné partout**, à changer avant chaque étiquette : `package.json` (racine, `apps/*`,
   `packages/*`), `package-lock.json`, et à partir du lot L8 la configuration Tauri (`tauri.conf.json`, `Cargo.toml`,
   `Cargo.lock`, d'où l'APK tire sa version Android). Le jeu affiche le numéro de `apps/game/package.json` (écran
   d'accueil, plus tard « À propos »).
7. Chaque étiquette a sa ligne dans le journal (§4), dans `CHANGELOG.md` (en mots simples pour le joueur) et dans le
   tableau des jalons de `docs/STATUS.md`.
8. Avant chaque commit : `npm.cmd test` et `npm.cmd run typecheck` verts ; résultat cité dans le message.

## 3. Revenir en arrière
| Besoin | Commande (racine du dépôt) | Effet |
|---|---|---|
| Voir la liste des versions | `git tag -n1` | étiquettes et leur résumé |
| Voir ce qui a changé entre deux versions | `git log --oneline v0.1.0..v0.2.0` | commits entre les deux |
| Essayer une ancienne version sans rien casser | `git switch --detach v0.1.0`, puis `npm.cmd install` et `npm.cmd run dev` | le dossier passe en lecture de cette version ; revenir avec `git switch main` |
| Annuler un lot déjà commité et envoyé | `git revert <commit>`, puis `git push` | nouveau commit qui défait le lot, l'historique reste complet |
| Récupérer un fichier d'une ancienne version | `git restore --source v0.1.0 -- <chemin>` | le fichier redevient celui de la version ; à commiter si on le garde |
| Repartir d'une ancienne version | `git switch -c reprise-v0.1.0 v0.1.0` | branche de travail ; à discuter avant (règle 1) |
| Retrouver un état perdu en local | `git reflog` | historique des positions de `main` sur ce PC |

Avant tout retour en arrière : `git status` doit être propre (sinon `git stash`).

## 4. Journal des versions
| Version | Commit | Date | Contenu |
|---|---|---|---|
| v0.1.0 | `addec57` | 2026-11-08 | L0 : cadrage validé (D-01 à D-06), gestion de configuration, squelette (moteur + 1 test, écran d'accueil) |
| v0.2.0 | `a308ba0` | 2026-11-08 | L1 : style et icônes dans Figma (limite Starter atteinte), maquette cliquable de tous les écrans (D-07, D-08), passe dessins à chaque lot (D-09) |
| v0.2.1 | `bb9f3e2` | 2026-11-08 | Passe dessins L1 (D-09) : ville, centrale, habitants, véhicules, boutique plus réalistes ; répliques de Cassandra adaptées à la journée |
| v0.3.0 | `ce3068c` | 2026-11-08 | L2 : moteur déterministe (centrale, journées YAML, surprises à graine, argent, bilan, bonheur), interface branchée, D-10 à D-12 |
| v0.3.1 | `d3ac73a` | 2026-11-08 | Passe dessins L2 (D-09) : saisons ; 3 propositions de style et choix B isométrique (D-13) ; ville isométrique commencée (pas encore branchée) ; version de test servie sur le réseau local |
| v0.4.0 | `c421f2b` | 2026-11-08 | L3 : partie jouable, ville isométrique (D-13), progression enregistrée (D-14) |
| v0.4.1 | `a499231` | 2026-11-08 | L3.1 : corrections du test R1-01 à R1-07 ; chaîne APK (`npm.cmd run android`) |
| v0.5.0 | `1843ba6` | 2026-11-08 | L3.2 : bande ±7 % et malus (D-15), journées plus contrastées (D-16), objet acheté montré dans la ville |
| v0.6.0 | `ed5aeab` | 2026-11-08 | L4 : ciel heure par heure, ombres et lumière du soir, ville en couches pour la tablette (D-17) |

Un commit ne peut pas citer son propre identifiant : la colonne « Commit » de la dernière ligne se complète au commit
suivant (`git rev-list -n1 vX.Y.Z` le donne).

## 5. Reconstruire un livrable depuis une version
1. `git switch --detach vX.Y.Z`, puis `npm.cmd install`.
2. Livrable :
   - web : `npm.cmd run build` (`apps/game/dist`) ;
   - APK de test pour la tablette : `npm.cmd run android` → `livrables/Neutron-City-<version>.apk` (release ARM 64 bits,
     clé de débogage Android ; notice `docs/tablette.md`) ;
   - installeur Windows : commande ajoutée au lot L8 (chaîne Tauri reprise du projet NPP).
3. Noter dans le journal (§4) le livrable reconstruit et sa date si on le diffuse.
4. `git switch main` pour revenir.
