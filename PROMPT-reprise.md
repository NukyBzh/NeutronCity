# Reprise de Neutron City — prompt pour une nouvelle session

*À coller tel quel au début d'une nouvelle session Claude Code ouverte dans le dossier `Neutron City`.*

---

Tu reprends le projet **Neutron City** : un jeu éducatif pour les enfants de 8 à 12 ans. Le joueur pilote une centrale
imaginaire qui fournit l'électricité et la chaleur d'une ville ; il gagne des euros de jeu en suivant la demande et les
dépense dans une boutique pour rendre les habitants heureux. Cassandra est la guide.

## 1. À lire d'abord, dans cet ordre
1. `docs/STATUS.md` — état d'avancement (à lire au début de chaque session).
2. `PROMPT-neutron-city.md` — mes règles de travail : travail par lots ; tu proposes, j'approuve, tu construis, tu
   vérifies (tests + contrôle visuel), tu fais un court rapport, puis tu t'arrêtes. Tu me demandes avant tout commit,
   toute installation, tout envoi sur GitHub et toute action irréversible. Je veux que tu fasses toi-même ce que tes
   outils permettent (GitHub, constructions, captures) plutôt que de me le renvoyer.
3. `CLAUDE.md`, `docs/DECISIONS.md` (D-01 à D-17), `docs/RETOURS.md` (retours de test R1-01 à R1-14),
   `docs/CONFIGURATION.md`, `CHANGELOG.md`.

## 2. Où on en est (2026-11-08, fin de session)
- Branche `main`, dernier commit `ed5aeab` (lot L4), poussé sur GitHub `NukyBzh/NeutronCity`. Version **0.6.0**.
- Lots faits depuis le premier essai sur tablette (retours R1) :
  - **L3.1 (v0.4.1, `a499231`)** : voitures hors de la rivière et sans recul, fontaine qui ne clignote plus, heure
    hh:mm, demande écrite en chiffres, vitesses ×1/×2/×4, Cassandra en bas qui montre les curseurs.
  - **L3.2 (v0.5.0, `1843ba6`)** : bande de ±7 % et malus de surproduction (D-15, choix confirmés : électricité
    seulement, −1 €/min, tirelire jamais sous 0 €), journées plus contrastées et rampe 15 %/h (D-16), objet acheté
    montré dans la ville par une flèche.
  - **L4 (v0.6.0, `ed5aeab`)** : ciel heure par heure avec soleil, lune, étoiles, nuages ; ombres, arbres, lumière
    du soir ; ville en couches (canvas fixes + petites couches animées) pour la fluidité sur tablette (D-17).
- **Étiquettes en attente** : v0.4.1 (`a499231`), v0.5.0 (`1843ba6`), v0.6.0 (`ed5aeab`). On les pose quand j'aurai
  validé après mon essai de l'APK sur la tablette ; puis compléter la colonne « Commit » de `docs/CONFIGURATION.md`.
- **Pas encore vérifié sur la vraie tablette** (Galaxy Tab A9+) : affichage, fluidité, malus, ciel.

## 3. Outils en place
- Tests : `npm.cmd test` (49 tests) ; types : `npm.cmd run typecheck` ; jeu : `npm.cmd run dev` (port 5180).
- **APK pour la tablette** : `npm.cmd run android` → `livrables/Neutron-City-<version>.apk` (release ARM 64 bits,
  clé de débogage Android ; notice `docs/tablette.md`). Avant chaque APK : passer la version partout
  (`package.json` ×4, `apps/desktop/src-tauri/tauri.conf.json`, `Cargo.toml`). Les APK ne vont jamais dans Git.
- **Version de test sur le Wi-Fi** : `npm.cmd run build`, puis dans `apps/game` :
  `npx.cmd vite preview --host 0.0.0.0 --port 4180 --strictPort` (adresse du PC le 2026-11-08 : 192.168.1.24).
- **Revoir un écran** : `?ecran=accueil|journees|jeu|bilan|boutique&journee=ete|printemps|hiver&heure=19&suivi=non
  &achats=parc,fontaine&nouveau=fontaine&graine=42&vitesse=20` (ne touche jamais la progression enregistrée).
- **Captures** : Edge sans fenêtre (`msedge.exe --headless=new --screenshot=… --window-size=1280,800
  --virtual-time-budget=6000 --force-prefers-reduced-motion`), à 1280 × 800 et 1920 × 1200. Le panneau navigateur de
  l'application est souvent masqué : ses captures ne sont pas fiables.
- **Mesures de fluidité** : `tools/mesures/` (images par seconde avec processeur ralenti, recul des voitures).
- Éditer les fichiers en gardant les fins de ligne : certains fichiers sont en CRLF (Git les normalise).

## 4. Ce qui reste à faire
1. **D'abord** : me demander mes retours sur l'APK 0.6.0 testé sur la tablette ; les noter dans `docs/RETOURS.md`
   (série R2), proposer les corrections, et poser les étiquettes v0.4.1 / v0.5.0 / v0.6.0 si je valide.
2. **R1-14** (dessins, en partie fait) : poursuivre selon mes retours (centrale, habitants, voitures), passe dessins
   D-09 après chaque lot.
3. **L5 — Cassandra et le son** : musique de fond « sympa, pas prise de tête » (R1-13) avec bouton pour couper le son —
   **me demander la source** (musique composée pour le projet ou morceau libre de droits) avant tout ; tutoriel de
   Cassandra ; pose dédiée « montre le curseur » si la pose « explique » ne suffit pas.
4. Suite de la feuille de route (`PROMPT-neutron-city.md`) : L6 boutique, L7 réglage des journées, L8 tablette
   (APK signé avec ma propre clé, installeur Windows), L9 essai avec des enfants.
5. Points ouverts : conditions d'usage des images de Cassandra générées par IA et nom « Neutron City » à vérifier
   avant toute diffusion publique ; import des dessins dans Figma quand la limite le permet.

Commence par lire `docs/STATUS.md`, résume-moi en quelques lignes où on en est, puis demande-moi mes retours sur
l'essai de l'APK 0.6.0.
