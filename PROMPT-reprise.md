# Reprise de Nuki Town (anciennement Neutron City) — prompt pour une nouvelle session

*À coller tel quel au début d'une nouvelle session Claude Code ouverte dans le dossier `Neutron City`.*

---

Tu reprends le projet **Nuki Town** (un jeu NukiTeam ; dossier et dépôt gardent l'ancien nom « Neutron City ») : un jeu
éducatif pour les enfants de 8 à 12 ans. Le joueur pilote une centrale imaginaire qui fournit l'électricité et la
chaleur d'une ville ; il gagne des euros de jeu en suivant la demande et les dépense dans une boutique pour construire
la ville et rendre les habitants heureux. Cassandra est la guide.

## 1. À lire d'abord, dans cet ordre
1. `docs/STATUS.md` — état d'avancement (à lire au début de chaque session).
2. `PROMPT-neutron-city.md` — mes règles de travail : travail par lots ; tu proposes, j'approuve, tu construis, tu
   vérifies (tests + contrôle visuel), tu fais un court rapport, puis tu t'arrêtes. Tu me demandes avant tout commit,
   toute installation, tout envoi sur GitHub, toute mise en ligne et toute action irréversible. Je veux que tu fasses
   toi-même ce que tes outils permettent (GitHub, Netlify, constructions, captures) plutôt que de me le renvoyer.
3. `CLAUDE.md`, `docs/DECISIONS.md` (D-01 à D-29), `docs/RETOURS.md`, `docs/CONFIGURATION.md`, `CHANGELOG.md`,
   `docs/EQUILIBRAGE.md`, `docs/GEMINI.md` (prompts d'images), `assets/SOURCES.md`.

## 2. Où on en est (2026-11-20)
- Branche `main`, dernier commit `d98fb03`, poussé sur GitHub `NukyBzh/NeutronCity`. Version **0.13.0**.
- **En ligne** : https://stunning-haupia-9181a8.netlify.app (site Netlify `635fe9d9-5650-477a-af13-8ff0246a5c15`,
  équipe NukiTeam), avec l'APK des testeurs Android : `/Nuki-Town-0.13.0.apk`. APK aussi dans
  `livrables/Nuki-Town-0.13.0.apk`.
- Derniers lots (tous « en attente de validation », étiquettes v0.7.0 à v0.13.0 à poser quand je valide) :
  - **L9.2b–d** : version de l'accueil en bas à gauche (badge Netlify), export du journal par le menu de partage
    Android, garde-fou Netlify (`netlify.toml` fait échouer exprès un envoi du dépôt brut).
  - **L9.3 (D-28)** : réseau de chaleur en 1er bâtiment à 900 € + cadeau de bienvenue (printemps dès la 2e journée),
    son des euros une fois par heure, bouton « Jouer » et conditions de déblocage dans la boutique, bâtiment neuf
    dessiné à sa profondeur, oiseaux en bande, cochon tirelire, fond des écrans et campagne autour de la ville (images
    de Yann).
  - **L9.4 (D-29)** : l'enfant choisit où construire parmi 30 pelouses (`BUILD_LOTS`, `places`, `settle` dans
    `apps/game/src/play/iso/town.ts`), colonne `terrain` dans l'export du journal.
- **Pas encore vérifié sur une vraie tablette ni sur un vrai iPhone** depuis la 0.13.0.
- `docs/GEMINI.md` est modifié et non commité : c'est le travail d'une **autre session** (prompt du cochon tirelire,
  série 8). Ne pas l'écraser ; regarder où elle en est avant d'y ajouter des prompts.

## 3. Retours R2 (essai par le neveu de Yann, 9 ans) — décisions prises le 2026-11-16, rien n'est encore construit
Ces décisions ne sont encore écrites nulle part ailleurs : les reporter dans `docs/RETOURS.md` (série R2) et
`docs/DECISIONS.md` au premier lot.

| N° | Retour | Décision de Yann |
|---|---|---|
| 1 | La fête ne se voit pas | Une animation par événement : **fête** (feux d'artifice, guirlandes, habitants rassemblés sur la place, sons d'une foule qui crie « ouais » et de verres qui trinquent) ; **canicule** (filtre rouge-orangé sur la ville, air qui ondule) ; **vague de froid** (filtre bleu, givre sur le pourtour de l'écran) ; **redoux** (soleil, neige qui fond) ; **tempête** (pluie, nuages sombres, éclairs) ; **écureuil** (sur un pylône + **loupe ronde en bas à droite** qui le montre en gros) ; **pic de demande** (toutes les fenêtres s'allument) ; **calorifugeage** (ouvrier sur un tuyau). Images : **prompts Gemini** (guirlandes, foule, feux d'artifice, écureuil petit et grand, cadre de givre, ouvrier, éclair, nuages de tempête) ; pluie, ondulation et filtres en code. Sons : chercher des sons libres (CC0) et **me demander avant de télécharger** (nom, source, taille). |
| 2 | « ZzZ » la nuit | Validé : de 23 h à 5 h, petits « Z » qui montent et s'effacent au-dessus de quelques maisons et immeubles, dessinés en code ; rien si l'appareil demande moins d'animations. |
| 3 | Boutons + et − | Validé : un **+** au-dessus et un **−** sous chaque curseur, pas de **5 %**, **une seule fois par touche** (garder le doigt appuyé ne répète pas, il faut lever le doigt), grisés à 0 % et au maximum, 48 px au moins, curseurs gardés. |
| 4 | Voitures qui roulent sur les familles | Validé : trier voitures et piétons par profondeur (aujourd'hui dessinés dans l'ordre de la liste `TRAFFIC`), recaler chaque voiture au milieu de sa voie (une voie par sens), ajouter de la circulation dans les rues perpendiculaires, vérifier rue par rue sur captures agrandies. |
| 5 | Habitants qui entrent dans les bâtiments | Validé : certains habitants vont à la porte d'un bâtiment (épicerie, école, maison médicale, hôpital, piscine…), entrent, ressortent plus tard ; enfants à l'école le matin, retour à la maison le soir ; vers l'emplacement choisi par l'enfant. Il faut des **vues de dos** (marcher vers le haut = entrer) et un **2e pas** pour animer la marche. Prompts donnés : 68 à 76 (voir § 4). En attendant les vues de dos : fondu à la porte. |
| 6 | Nouveaux bâtiments | Validé : **petite maison** et **immeuble** achetables plusieurs fois (2 couleurs chacun, prix qui monte un peu à chaque achat), **mairie** (fête plus fréquente), **hôtel**, **boulangerie-pâtisserie** (retirer la boulangerie du décor, `asset_61`), **caserne de pompiers** (pannes plus courtes). Prompts donnés : 77 à 84 (fond **magenta**, socle d'herbe ou de trottoir). Prix et bonus selon la règle du n° 9. |
| 7 | Agrandir la ville | Validé : **3 quartiers à vendre** de 6 terrains, sur la campagne autour de la ville, panneau « À vendre », achetables **seulement quand la ville est remplie**. Prix réglés pour que l'enfant simulé mette **2, puis 3, puis 5 journées** d'une ville complète (≈ 9 800 €/journée avec 3 étoiles → ≈ 20 000 € pour le 1er) ; caler les 2e et 3e avec l'outil d'équilibrage. **À confirmer** : « ville remplie » = les 30 pelouses construites (option a, que Yann a semblé choisir : « what » = « A » probablement), remplies grâce aux maisons et immeubles du n° 6. |
| 8 | Sauvegarder la progression | **Annulé** (la progression reste enregistrée sur l'appareil). |
| 9 | Prix des bâtiments | Les bâtiments **qui aident coûtent 30 % de plus**, bonus inchangé : maison médicale 5 900 €, batterie 11 700 €, parc 6 200 €, isolation 11 700 €, solaire 14 000 €, hôpital 15 600 €, cuve 15 600 €. **À confirmer** : l'hôpital compte comme « bâtiment qui aide ». Relancer l'outil d'équilibrage (ville complète en 19 journées aujourd'hui, ~21–22 attendu). |
| 10 | Mieux voir la ville | Validé : **option A**, la ville entière en grand pendant la partie (deux tiers de l'écran), curseurs avec + et − sur le côté, courbes en petit, Cassandra en bulle. **D'abord une maquette en capture**, à valider avant de construire ; puis ergonomie revérifiée aux 8 formats. |

**Ordre des lots proposé (à confirmer avec Yann)** : L10.1 maquette du nouvel écran de jeu (10) → L10.2 petits
correctifs (3, 4, 2, 9) → L10.3 nouvel écran de jeu (10) → L10.4 événements visibles (1) → L10.5 habitants qui
entrent dans les bâtiments (5) → L10.6 nouveaux bâtiments (6) puis quartiers à vendre (7).

## 4. Images Gemini
- **Livrées par Yann le 2026-11-20** dans `assets/Jeu centrale – assets/` (JPG nommés `*.png.jpg`, fond vert) :
  `asset_68_habitant_adulte_dos`, `asset_69_habitant_enfant_dos`, `asset_70_habitants_famille_dos`,
  `asset_71_habitant_adulte_face_pas2`. À détourer (`tools/detourage/detoure.py`), réduire en WebP dans
  `assets/ville/` et noter dans `assets/SOURCES.md`.
- **Pas encore livrées** : 72 (adulte de dos, 2e pas), 73 et 74 (enfant de face et de dos, 2e pas), 75 et 76 (dame
  âgée, facultatif), 77 à 84 (nouveaux bâtiments), et celles des événements du n° 1 (prompts **pas encore écrits**).
- Les prompts 68 à 84 ont été donnés à Yann dans la conversation du 2026-11-16 mais ne sont pas encore dans
  `docs/GEMINI.md` : les y recopier (même format que les séries précédentes : style de
  `docs/gemini/reference-style-ville.jpg`, fond uni vert ou magenta, PNG 1024 × 1024, aucun texte).

## 5. Outils en place
- Tests : `npm.cmd test` (121 tests) ; types : `npm.cmd run typecheck` ; jeu : `npm.cmd run dev` (port 5180).
  Si le port 5180 est pris par une autre session (son serveur peut ne pas voir les nouveaux fichiers), lancer la
  configuration `game-5181` de `.claude/launch.json`.
- **Équilibrage** : `npx.cmd vitest run --config tools/equilibrage/vitest.config.ts` réécrit `docs/EQUILIBRAGE.md`.
- **Version** : la passer partout avant un livrable (`package.json` ×4, `apps/desktop/src-tauri/tauri.conf.json`,
  `Cargo.toml`, `Cargo.lock`, puis `npm.cmd install --package-lock-only --ignore-scripts`).
- **APK** : `npm.cmd run android` → `livrables/Nuki-Town-<version>.apk` (quelques minutes ; à lancer en arrière-plan).
- **Version web** : `npm.cmd run web` (il faut l'APK de la même version) → dossier `livrables/web-<version>/` (jeu +
  APK + `_headers`) et zip `livrables/Nuki-Town-web-<version>.zip`. **Mise en ligne** : outil Netlify
  `deploy-site` (site ci-dessus), puis lancer la commande `npx -y @netlify/mcp@latest …` qu'il donne **depuis le
  dossier `livrables/web-<version>/`**, jamais depuis le dépôt. Vérifier ensuite la page d'accueil et le lien de l'APK.
  La version web garde une copie hors ligne : le navigateur montre l'ancienne version au premier chargement, la
  nouvelle au suivant (`docs/iphone.md`).
- **Revoir un écran** : `?ecran=accueil|journees|jeu|bilan|boutique|journal&journee=ete|printemps|hiver&heure=19
  &suivi=non&achats=parc,fontaine&nouveau=fontaine&placer=ferme&cadeau=860&graine=42&vitesse=20` (ne touche jamais la
  progression enregistrée ; `placer` ouvre la boutique en mode « choisis l'endroit », `cadeau` montre le cadeau de
  bienvenue dans le bilan).
- **Captures** : Edge sans fenêtre (`msedge.exe --headless=new --screenshot=… --window-size=1280,800
  --virtual-time-budget=20000`) à 1280 × 800 et 1920 × 1200 ; **attention** : sans fenêtre, les canvas de la ville ne
  sont pas toujours peints et les animations ne bougent pas. Pour la ville, utiliser le navigateur intégré (taille
  émulée 1280 × 800 ou 1920 × 1200) et `javascript_tool` pour lire l'état.
- **Mesures de fluidité** : `tools/mesures/`.
- Éditer les fichiers en gardant les fins de ligne : certains fichiers sont en CRLF (Git les normalise).

## 6. Points ouverts
- Le dépôt GitHub apparaît **public** chez Netlify alors qu'il devait rester privé : à vérifier par Yann.
- Avant toute diffusion publique : conditions d'usage des images générées par IA (Cassandra, ville, logo) et nom
  « Nuki Town » (marque, autre jeu du même nom).
- Sur téléphone, les terrains à toucher dans la boutique sont petits (≈ 30 px) : à surveiller ; le nouvel écran de jeu
  (n° 10) devrait aider.
- Essai avec des enfants (L9.2, guide `docs/ESSAI-ENFANTS.md`) puis v1.0.0.

Commence par lire `docs/STATUS.md`, résume-moi en quelques lignes où on en est, puis demande-moi mes deux
confirmations en attente (n° 7 « ville remplie » = 30 pelouses ? n° 9 l'hôpital compte comme « bâtiment qui aide » ?)
et mon feu vert pour le premier lot (maquette du nouvel écran de jeu).
