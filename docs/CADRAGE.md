# Neutron City — cadrage (lot L0)

*Rédigé le 2026-11-08 à partir de `PROMPT-neutron-city.md` et du projet NPP (branche `jeu-decouverte` : `docs/game/cadrage.md`
§8 bis, `content/days/*.yaml`, `apps/web/src/game/day.ts`, `docs/CONFIGURATION.md`). **Validé par le porteur du
projet le 2026-11-08**, avec les recommandations des questions Q1 à Q6 (§12) : décisions D-02 à D-06 dans
`docs/DECISIONS.md`.*

## 1. Le jeu en quelques lignes
- **Public** : enfants de 8 à 12 ans, sans connaissance du nucléaire.
- **Idée** : tu pilotes la centrale imaginaire de Neutron City. Elle fabrique de l'**électricité** (lumière, écrans) et
  de la **chaleur** (chauffage des maisons). Une journée va de 6 h à minuit et se joue en ≈ 5 minutes. Plus ta
  production suit la demande de la ville, plus tu gagnes d'euros du jeu. Avec ces euros, tu embellis la ville (parc,
  école, fontaine…) et ses habitants deviennent plus heureux.
- **Guide** : Cassandra, ingénieure de la centrale (personnage repris du projet NPP, 5 poses).
- **Supports** : tablette Android (Galaxy Tab A9+, 1920 × 1200, paysage, tactile) et PC Windows (souris, ≥ 1280 × 800),
  hors ligne, sans compte ni donnée personnelle.

### Boucle de jeu
1. **Choisir une journée** (été, printemps, hiver ; débloquées dans l'ordre).
2. **Piloter** : deux gros curseurs (électricité jaune, chaleur orange) ; la centrale rejoint la consigne à vitesse
   limitée (rampe) ; la courbe de demande défile et la production se trace par-dessus ; la ville réagit.
3. **Bilan** : euros gagnés, 1 à 3 étoiles, un conseil de Cassandra.
4. **Boutique** : acheter des améliorations, qui apparaissent dans la ville et augmentent le bonheur.

## 2. La centrale (D-01, prise)
- Cœur `P` de 0 à 100 % ; `e` = part électrique (% de 100 MWe), `h` = part chaleur (% de 300 MWth), `P = e + h ≤ 100 %`.
- **Les curseurs respectent D-01** : un curseur ne peut pas dépasser ce que l'autre laisse libre. Quand le joueur
  bute, le curseur montre un petit cadenas et Cassandra dit « Le cœur est plein ! » (une fois). C'est la seule
  « leçon de physique » de la V1, et elle se voit.
- **Rampe proposée : 10 % par heure de jeu** pour chaque sortie (≈ 1 % toutes les 1,7 s réelles). Le prompt dit
  « quelques % par minute de jeu » : avec 18 h de jeu en 5 min, une minute de jeu dure 0,28 s, donc quelques % par
  minute de jeu rendraient la rampe invisible. 10 %/h oblige à anticiper un peu les montées du matin et du soir
  (question Q3).
- **Moteur pur et déterministe** (`packages/engine`) : pas fixe d'**une minute de jeu** (1 080 pas par journée) ;
  `pas(état, consignes, journée, surprises) → nouvel état` ; aucun `Math.random()`, aucune horloge ; la graine des
  surprises vient de l'interface. L'interface accumule le temps réel et appelle autant de pas que nécessaire (pause =
  plus d'appel). Pas de worker nécessaire (calcul minuscule, contrairement au moteur `pwr2loop` du projet NPP).
- Prévu pour plus tard sans rien casser : l'état de la centrale est un objet extensible (inertie thermique, incidents,
  plusieurs centrales = un tableau de centrales ; aujourd'hui une seule).

## 3. Les journées
- Format repris du projet NPP, en YAML (`content/days/<id>.yaml`) : `points: [heure, électricité %, chaleur %]`,
  interpolés linéairement ; `events` = répliques de Cassandra à heure fixe (par identifiant, voir §7) ; `outro`.
- **Différences** avec NPP : les % sont ceux de **cette** centrale (électricité en % de 100 MWe, chaleur en % de
  300 MWth, donc en part du cœur) ; pas de plancher à 50 % d'électricité (contrainte propre à `pwr2loop`) ; les textes
  ne sont pas dans la journée mais dans `content/dialogues/` (traduction future).
- Champs ajoutés pour l'avenir : `format: 1` et `balance: balanced`. Les journées déséquilibrées de la V2 auront
  `balance: unbalanced` et des champs en plus (prix d'achat/vente, demande impossible) : le moteur V1 refusera
  simplement ce qu'il ne connaît pas.
- **Test « journée équilibrée »** (pour chaque fichier, avec les surprises possibles à toutes les heures de départ) :
  `e + h ≤ 100 %` à chaque minute, `e, h ≥ 0`, et la pente de la demande ≤ 8 %/h (< rampe de 10 %/h, avec une marge).
  Conséquence : une surprise de +10 % monte en 1 h 15 au moins (dans NPP, en 15 min).
- **Trois journées V1** (formes inspirées des courbes de NPP, valeurs propres au jeu) :

  | Journée | Niveau | Électricité | Chaleur | Ce qu'on apprend |
  |---|---|---|---|---|
  | Journée d'été | Facile | 40 → 75 % (climatisation l'après-midi, petit pic à 20 h) | 0 | Suivre une courbe, la rampe |
  | Journée de printemps | Moyen | 40 → 65 % | 5 à 15 % matin et soir | Une 2ᵉ sortie qui va et vient |
  | Journée d'hiver | Difficile | 45 → 65 % | 20 à 35 %, pic du soir | Partager le cœur (D-01) |

- **Surprises** (2 par journée, graine) : pic de demande (match à la télé), vague de froid, redoux (chaleur seulement
  les jours de chauffage). Annoncées par Cassandra une heure avant, bande colorée **et hachurée** sur la courbe. La
  « turbine en révision » de NPP n'est pas reprise (c'est un incident : V2). La demande à venir est visible **3 h à
  l'avance**, comme dans NPP.

## 4. L'argent (D-02, proposée)
**Barème** : à chaque minute de jeu, pour chaque sortie demandée (électricité toujours, chaleur si sa demande > 0),
écart = |production − demande| en points de cœur :

| Écart | Jauge | Pictogramme | Euros par minute de jeu |
|---|---|---|---|
| ≤ 3 points | « Bien suivi » vert | ✓ (coche) | 2 € |
| ≤ 8 points | « Presque » orange | ～ (vague) | 1 € |
| > 8 points | « Trop loin » rouge | ✗ (croix) + flèche ↑ ou ↓ vers la demande | 0 € |

- **Pas de pénalité négative en V1** (recommandé, à confirmer : question Q2). Le rouge coûte déjà le gain.
- **Nombres entiers** : 2 160 € au plus par sortie et par journée (1 080 minutes × 2 €). Été ≤ 2 160 €, printemps et
  hiver ≤ 4 320 € : les journées difficiles rapportent plus, ce qui motive à progresser.
- **Étoiles** : 1 pour avoir fini la journée, 2 à partir de 50 % du maximum, 3 à partir de 80 %.
- **Affichage** : une pièce vole vers la tirelire toutes les 10 minutes de jeu gagnantes (≈ 3 s), la tirelire montre
  le total arrondi ; une jauge par curseur (couleur + pictogramme + mot).
- **Seuils à régler** au lot L7 sur de vraies parties (la rampe et les seuils se tiennent : à 10 %/h, l'écart dû à la
  rampe reste < 3 points si le joueur anticipe de 20 min).
- Tests (L2) : rejeu à graine fixe ⇒ même total à l'euro près ; un joueur « parfait » simulé obtient le maximum sur
  chaque journée équilibrée ; un joueur « immobile » obtient au moins 1 étoile mais pas 3.

**Bonheur** (proposition, à détailler au lot L2) : le bonheur de la ville (0–100) monte avec les améliorations
achetées (permanent, enregistré sur l'appareil) ; l'humeur du jour (habitants contents, ont froid, sont dans le noir)
est seulement montrée dans la ville et ne fait rien perdre. Score de la partie = bonheur de la ville + total des
euros gagnés depuis le début. Prix de départ de la boutique : fontaine 1 000 €, parc 1 500 €, piste cyclable 2 500 €,
éclairage 3 000 €, école 5 000 € (une bonne journée ≈ une petite amélioration ; réglage au lot L6).

## 5. La ville (D-03, proposée)
Trois façons de la montrer :

| | A. Vue de dessus 2D | B. Isométrique (2,5D) | **C. Vue de face en plans (« diorama »)** |
|---|---|---|---|
| Ciel du matin à la nuit | invisible | un peu | **très visible** |
| Fenêtres qui s'allument, fumées | peu lisibles | lisibles | **très lisibles** |
| Habitants, voitures, vélos | petites taches | bien | **bien (de profil, faciles à animer)** |
| Dessins à produire dans Figma | simples | **nombreux et délicats** (angles, ordre d'affichage) | simples (façades) |
| Ajouter un quartier | agrandir la carte | agrandir la carte | **défilement horizontal** |
| Effet « ma ville » | carte | **le plus joli** | rue vivante |

**Recommandation : C** (3 plans : collines et centrale au fond, rangée de bâtiments au milieu, rue animée devant ;
parallaxe légère). Les améliorations achetées occupent des **emplacements** prévus dans la rue. B est plus joli mais
double environ le travail de dessin et le risque de lenteur sur tablette. Le prompt citait A ou B : C est une 3ᵉ
voie, d'où la question Q1. Dans tous les cas, la ville est découpée en éléments réutilisables (bâtiment, emplacement,
personnage, véhicule) décrits dans un fichier de contenu (`content/city/`), pour ajouter des quartiers plus tard.

**Réactions de la ville** : électricité qui manque → des fenêtres s'éteignent par quartier (avec une icône ampoule
barrée, pas seulement l'ombre) ; chaleur qui manque → habitants avec écharpe et bulle « brrr » ❄ ; tout va bien →
habitants qui sourient, petits cœurs. Animations réduites si l'appareil le demande (`prefers-reduced-motion`).

## 6. Technique (D-04, proposée)
- **Même pile que NPP** : TypeScript, React 19, Vite, Vitest, Tauri 2 (bureau Windows + APK Android) ; outils déjà
  installés sur le PC (Node 24, npm 11, Rust/Cargo 1.98, chaîne Android de NPP). Script d'APK repris de
  `apps/desktop/tools/android-game.mjs` (autre identifiant d'application : `org.neutroncity.jeu` par exemple).
- **Ville : PixiJS 8** dans un canvas (WebGL ; sprites, planches de sprites, regroupement des dessins = fluide sur
  tablette). Monté directement dans un composant React (sans `@pixi/react`, une dépendance de moins). Alternative
  écartée : canvas 2D « à la main » (tout à refaire : sprites, chargement, mise à l'échelle), CSS/SVG (lent avec des
  dizaines d'éléments animés), Phaser (moteur de jeu complet, double emploi avec React).
- **Courbes** : un petit tracé SVG ou canvas maison (2 courbes, une bande « à venir ») plutôt que uPlot : plus facile à
  rendre très lisible pour un enfant.
- **Organisation** (monorepo npm workspaces) :
  - `packages/engine` — centrale, demande, surprises, euros, bonheur : fonctions pures, sans DOM, testées ;
  - `apps/game` — interface React + vue PixiJS de la ville ; `apps/desktop` — coquille Tauri (bureau + Android) ;
  - `content/days/`, `content/shop/`, `content/dialogues/`, `content/city/` — YAML validé par schéma (au démarrage et
    par test) ; `content/i18n/fr.yaml` pour les textes d'interface ;
  - `assets/` — exports Figma + `assets/SOURCES.md` ; `docs/` — cadrage, décisions, statut, configuration.
- **Textes** : jamais en dur dans le code ; chaque texte a un identifiant (`day.hiver.intro`, `tip.idle.elec`…) et une
  valeur `fr` ; `en` viendra plus tard sans changer le format.
- **Sauvegarde** : `localStorage` (même sous Tauri), objet versionné `{ version: 1, … }` pour pouvoir le migrer.
- **Tests** : moteur et économie sans écran (même graine ⇒ même résultat) ; chaque journée « équilibrée » ; contenu
  validé ; contrôle visuel à 1280 × 800 et 1920 × 1200 à chaque lot d'interface.
- **Installations à demander au moment voulu** : dépendances npm du squelette (L0, après accord), PixiJS (L4).

## 7. Cassandra
- Les 5 PNG transparents et la planche sont **recopiés** de `Projet NPP/docs/design/game/assets/img/` vers
  `assets/cassandra/` (au squelette, après accord) ; son visage n'est pas redessiné. Les décors `decor-*.jpg` de NPP ne
  sont pas repris.
- Répliques dans `content/dialogues/fr.yaml` : identifiant, pose, texte (≤ 15 mots si possible, tutoiement, un seul mot
  nouveau). L'identifiant servira de nom au fichier de voix (même principe que le lot G12 de NPP) : rien à refaire
  pour ajouter la voix.
- Rôles : accueil, explication en une ou deux phrases, annonce une heure avant un changement ou une surprise,
  félicitations, indice après ≈ 20 s sans action quand le joueur est dans le rouge ; avance automatique des bulles
  (temps de lecture, comme NPP G9) ; un même conseil pas répété avant 30 s.
- Style : les nouvelles images (ville, habitants) doivent s'accorder avec elle (contours nets, couleurs franches,
  bleu de sa tenue, rendu « dessin animé » doux).

## 8. Ergonomie
Règles du prompt reprises telles quelles (un écran = un objectif ; 3 zones : ville, courbe + tirelire, commandes ;
cibles ≥ 48 × 48 px ; texte ≥ 18 px ; contraste ≥ 4,5:1 ; icône **et** mot ; jamais la couleur seule ; l'élément
à toucher pulse ; ≤ 3 nombres à l'écran ; pause toujours accessible ; pas de chronomètre). Points d'attention :
- **Les 3 nombres du jeu** : électricité (% et MW comptent comme une seule valeur sur le curseur), chaleur, tirelire.
  L'heure se lit sur le ciel et une petite horloge à aiguilles (pas un nombre).
- **Jaune sur blanc** ne donne pas 4,5:1 : le jaune sert de fond de curseur, les textes restent foncés.
- **Enfant de 8 ans** : peu de lecture ; les bulles de Cassandra sont courtes et la voix (après V1) aidera.

## 9. Ce qui est repris du projet NPP, et ce qui ne l'est pas
| Repris | Pas repris |
|---|---|
| Principe de la journée libre (6 h → minuit, ≈ 5 min, courbe qui défile, 3 h visibles à l'avance) | Le moteur `pwr2loop` (45 MWe), le worker, le synoptique de la salle de commande |
| Format YAML des journées `[heure, élec %, chaleur %]`, interpolation | Plancher d'électricité à 50 % (propre à `pwr2loop`) ; textes dans les journées |
| Générateur `rng` à graine (mulberry32) et interpolation — copiés en citant `day.ts` dans le commit | Barème NPP (prix MWh, achat 180 €, pénalité négative) |
| Surprises : pic, vague de froid, redoux, annoncées 1 h avant | Turbine en révision (incident → V2) |
| Curseurs jaune/orange, % et MW côte à côte, l'élément attendu qui pulse, avance automatique | Cartes « Pourquoi ? », quiz, missions guidées m0–m6 |
| Cassandra : 5 poses, ton, identifiants de répliques | Décors `decor-*.jpg` ; images EDF/NUWARD |
| Gestion de configuration (`CONFIGURATION.md`), `.gitattributes`, `.editorconfig`, script APK | Branche `jeu-decouverte` à part (ici : `main` + branches `feature/*`) |
| Choix techniques (React, Vite, Vitest, Tauri 2) | uPlot (courbes maison plus lisibles) |

## 10. Risques
| Risque | Effet | Parade |
|---|---|---|
| **Volume de dessins** (ville, habitants animés, boutique) | L1 et L4 longs | Vue C (§5), style simple, liste fermée de dessins validée au L1 ; animations par mouvement de sprites plutôt que dessin image par image |
| **Images générées par IA** (Cassandra l'est déjà : Gemini via Figma) | Diffusion publique bloquée | Point ouvert à lever avant toute diffusion ; préférer des dessins vectoriels faits dans Figma pour le reste |
| Réglage rampe / seuils / courbes | Trop facile ou décourageant | Paramètres dans le contenu, joueurs simulés en test, réglage au L7, essai enfants au L9 |
| Lenteur sur tablette (WebView Android) | Saccades | PixiJS, planches de sprites, mesure des images/s dès L4, mode animations réduites |
| Lecture pour un enfant de 8 ans | Ne comprend pas seul | Bulles courtes, pictogrammes, voix prévue après V1 |
| GitHub sans outil `gh` | Dépôt distant à créer à la main | Le porteur crée le dépôt vide sur github.com (ou accepte l'installation de `gh`) |
| Accès Figma depuis Claude | L1 bloqué | Connecteur Figma à autoriser avant L1 (question Q6) |
| Nom « Neutron City » | Conflit possible avant diffusion | Nom de travail ; vérification avant toute publication |

## 11. Fin du lot L0 (proposition)
1. **L0a — ce document** relu et validé, questions tranchées, D-02 à D-04 passées « prises ».
2. **L0b — après accord** : `git init`, fichiers de configuration, `docs/CONFIGURATION.md`, `CHANGELOG.md`,
   squelette (moteur vide + 1 test, écran « Neutron City — version 0.1.0 » qui s'ouvre au navigateur), copie de
   Cassandra ; `npm install` (installation à autoriser) ; premier commit, envoi sur GitHub, étiquette `v0.1.0`.

## 12. Questions à trancher par le porteur du projet
| # | Question | Recommandation |
|---|---|---|
| Q1 | Vue de la ville (D-03) : A vue de dessus, B isométrique, ou C vue de face en plans ? | **C**, plus lisible et moins de dessins ; B si l'effet « ma ville » compte plus que le délai |
| Q2 | Barème D-02 (2 € / 1 € / 0 € par minute et par sortie, seuils 3 et 8 points) et **aucune pénalité négative** en V1 ? | **Oui** aux deux ; réglage fin des seuils au L7 |
| Q3 | Rampe de la centrale : 10 % par **heure** de jeu (le prompt dit « par minute de jeu », trop rapide pour être visible) ? | **10 %/h**, paramètre réglable dans le contenu |
| Q4 | Les 3 journées (été facile, printemps moyen, hiver difficile) et une **ville imaginaire** « Neutron City » (pas Saint-Brieuc) ? | **Oui** ; « Neutron City » reste un nom de travail |
| Q5 | Dépôt GitHub : nom `NukyBzh/NeutronCity`, privé ; tu le crées vide sur github.com, ou tu autorises l'installation de l'outil `gh` (absent du PC) ? | **Tu le crées sur github.com** (aucune installation) |
| Q6 | Figma : je crée un fichier « Neutron City — dessins » dans ton compte au L1 (connecteur Figma à autoriser), ou tu le crées et me donnes le lien ? | **Tu me donnes le lien** d'un fichier vide ; je dessine dedans au L1 |

## 13. Commandes proposées pour le dépôt (non exécutées)
Préalable : le dépôt **privé et vide** (sans README ni licence) `NukyBzh/NeutronCity` existe sur github.com.
À lancer au lot L0b, après ton accord, depuis `C:\Users\yannm\Documents\IA_Claude\Neutron City` :

```bash
git init -b main
# création de .gitignore, .gitattributes, .editorconfig, docs/CONFIGURATION.md, CHANGELOG.md et du squelette
git add .
git commit -m "L0: project framing, configuration management and skeleton"
git remote add origin https://github.com/NukyBzh/NeutronCity.git
git push -u origin main
git tag -a v0.1.0 -m "L0: framing validated, repository and skeleton"
git push origin v0.1.0
```

Variante si l'outil `gh` est installé et connecté : `gh repo create NukyBzh/NeutronCity --private --source . --remote origin`
remplace la création sur github.com et la ligne `git remote add`.

Contenu prévu des fichiers de configuration (repris de NPP et complété) :
- `.gitignore` : `node_modules/`, `dist/`, `apps/desktop/src-tauri/target/`, `apps/desktop/src-tauri/gen/`, `*.apk`,
  `*.aab`, `*.exe`, `*.msi`, `out/`, `.env*`, `*.local`, `.vite/`, `coverage/`, `Thumbs.db`, `.DS_Store` ;
- `.gitattributes` : `* text=auto eol=lf` ; `*.png *.jpg *.webp *.ogg *.ico *.ttf *.woff2 binary` ;
- `.editorconfig` : UTF-8, LF, 2 espaces, ligne finale, espaces de fin retirés.
