# Prompt de lancement — jeu « Neutron City »

*À coller tel quel dans une nouvelle session Claude Code ouverte sur `C:\Users\yannm\Documents\IA_Claude\Neutron City`.
Les passages entre [crochets] sont des choix à confirmer ou à modifier avant de lancer.*

---

## Rôle et façon de travailler

Tu es le développeur principal d'un jeu éducatif pour enfants de **8 à 12 ans**, nom de travail **« Neutron City »**
[nom à confirmer]. Je suis le porteur du projet. Règles de travail, valables pour toute la durée du projet :

1. **On avance par lots.** Pour chaque lot : tu proposes ce que tu vas faire, j'approuve, tu réalises, tu vérifies
   (tests + contrôle visuel), tu me fais un court rapport, puis tu t'arrêtes. Aucun développement sans mon feu vert.
2. **Tu me demandes avant** tout commit, toute installation d'outil, tout envoi sur GitHub et toute action
   irréversible.
3. **Tu réfléchis à chaque étape en pensant aux versions suivantes** : chaque choix d'architecture doit laisser la place
   aux évolutions déjà prévues (feuille de route plus bas) sans les coder en avance. Si un choix ferme une porte, tu
   me le signales.
4. Les décisions importantes sont écrites dans `docs/DECISIONS.md` (numérotées D-01, D-02…, date, choix, raison).
   L'avancement est dans `docs/STATUS.md` (lots, jalons, points ouverts). Commence toujours une session en lisant
   `docs/STATUS.md`.
5. Langue : documentation et textes du jeu en français (anglais prévu plus tard, donc tous les textes dans des fichiers
   de contenu, jamais en dur dans le code) ; messages de commit en anglais.

## Le jeu en une phrase

Le joueur pilote une centrale nucléaire imaginaire qui alimente sa ville en **électricité** et en **chaleur** ; plus la
production suit fidèlement la demande de la ville, plus il gagne d'**euros du jeu**, qu'il dépense pour embellir la
ville et rendre ses habitants plus heureux. Cassandra, ingénieure de la centrale, l'accompagne.

## Principes de jeu (version 1)

### La centrale (modèle volontairement simple)
- Puissance du cœur `P` de 0 à 100 %. À 100 % : **100 MWe** au maximum en électricité, **300 MWth** au maximum en
  chaleur.
- **Décision D-01 (porteur du projet, 2026-11-08)** : la centrale **partage** sa puissance entre électricité et chaleur, comme la cogénération
  du projet NPP : si `e` = part électrique (% de 100 MWe) et `h` = part chaleur (% de 300 MWth), alors `e + h ≤ 100 %`
  et `P = e + h`. Exemple : 70 MWe + 90 MWth = 70 % + 30 % = 100 % du cœur.
  *(Physiquement, 300 MWth de cœur donnent environ 100 MWe : on ne peut pas avoir les deux maximums en même temps.)*
- La centrale **s'adapte à la consigne du joueur** avec une rampe simple (ex. quelques % par minute de jeu) : elle ne
  saute pas d'une valeur à l'autre, pour qu'il faille anticiper la courbe. Pas d'incident, pas d'arrêt automatique,
  pas de physique détaillée en version 1.
- Moteur **déterministe et sans interface** (pas de `Math.random()` ni d'horloge dans le moteur ; le hasard vient d'une
  graine passée par l'interface), pour pouvoir le tester sans écran et le faire évoluer (V2 : inertie thermique,
  incidents, plusieurs centrales).

### Le pilotage libre (repris du projet NPP)
Reprendre le principe de la « journée libre » du jeu « Pilote ta centrale » (projet
`C:\Users\yannm\Documents\IA_Claude\Projet NPP`, branche `jeu-decouverte` — lis `docs/game/cadrage.md` §8 bis
lot G11, `content/days/*.yaml` et `apps/web/src/game/day.ts`) :
- une journée de **6 h à minuit**, jouée en ≈ 5 minutes ;
- deux gros curseurs, « électricité » (jaune) et « chaleur » (orange), graduations lisibles, valeurs en **% et en MW**
  côte à côte ;
- la courbe de demande de la ville défile, la production de la centrale se trace par-dessus ; la demande à venir est
  visible un peu à l'avance pour pouvoir anticiper ;
- courbes de demande décrites dans des fichiers YAML (`[heure, électricité %, chaleur %]`, interpolées) ;
- quelques surprises tirées d'une graine (pic de demande, vague de froid…), annoncées par Cassandra.
On reprend **les idées et le format**, pas le moteur `pwr2loop` (45 MWe) : la centrale de ce jeu est différente.
Le code utile (générateur `rng` à graine, interpolation de courbe) peut être recopié en le citant dans le commit.

### L'argent
- **Le joueur ne gagne des euros qu'en suivant la demande** : à chaque pas de temps, l'écart entre production et demande
  donne des euros (écart faible = beaucoup, écart moyen = un peu, écart fort = rien). [Proposer un barème simple et
  testé, D-02 ; pas de pénalité négative en V1 pour ne pas décourager un enfant de 8 ans — à confirmer.]
- Affichage immédiat et visible : pièces qui volent vers la tirelire, jauge « bien suivi / presque / trop loin » en
  vert / orange / rouge **avec en plus un pictogramme** (pas seulement la couleur).
- Fin de journée : bilan (euros gagnés, étoiles, conseil de Cassandra).
- Les euros servent à **améliorer la ville** (boutique : parc, école, piste cyclable, éclairage, fontaine…), ce qui
  augmente le **bonheur des habitants** ; le bonheur et les euros font le score de la partie.

### Les scénarios de la V1
- **Uniquement des journées équilibrées** : la demande reste toujours dans ce que la centrale peut fournir
  (`e + h ≤ 100 %`, rampe atteignable). Un test automatique doit le vérifier pour chaque fichier de journée.
- 3 journées pour commencer, de la plus facile à la plus dure [ex. « Journée d'été » électricité seule, « Journée de
  printemps », « Journée d'hiver » électricité + chaleur].
- Les déséquilibres (demande impossible à suivre, achat/vente d'électricité, pannes) sont **prévus pour plus tard** :
  le format des journées doit pouvoir les accueillir sans tout changer.

### La ville animée
- Une vue de la ville, visible pendant le pilotage, avec des **animations** : habitants qui marchent, voitures, vélos,
  fenêtres qui s'allument le soir, fumée des cheminées ou radiateurs quand il fait froid, ciel qui passe du matin à la
  nuit.
- La ville **réagit au pilotage** : quartiers moins éclairés ou habitants qui ont froid si la production manque,
  habitants contents quand tout va bien. Les améliorations achetées apparaissent dans la ville.
- Vue de dessus en 2D ou 2,5D (isométrique) [à choisir au lot maquettes, D-03], découpée en éléments réutilisables
  (bâtiments, routes, personnages) pour ajouter des quartiers dans les versions suivantes.
- Fluide sur tablette (60 images/s visées, animations réduites si l'appareil le demande).

### Cassandra
- Personnage déjà créé avec Figma pour le projet NPP : 5 poses en PNG transparent (accueil, explique, attention, bravo,
  réfléchit) dans `C:\Users\yannm\Documents\IA_Claude\Projet NPP\docs\design\game\assets\img\` (planche :
  `cassandra-planche.png`). Les recopier dans le nouveau projet ; ne pas redessiner son visage.
- Rôle : accueille, explique en une ou deux phrases, prévient avant un changement de demande, félicite, donne un
  indice si le joueur ne fait rien pendant ≈ 20 s. Bulle de texte courte (≤ 15 mots si possible), tutoiement, un seul
  mot nouveau par bulle.
- Prévoir dès maintenant un identifiant par réplique (pour ajouter sa voix dans une version suivante, comme au lot G12
  du projet NPP).

### Les images (Figma)
- Toutes les nouvelles images (ville, bâtiments, habitants, centrale, icônes, boutique) sont créées dans **Figma**, dans
  un fichier dédié au projet, dans un style **adapté aux 8–12 ans** : formes rondes, couleurs vives mais douces,
  contours nets, lisibles en petit, cohérentes avec Cassandra.
- Export en SVG (décor, icônes) ou PNG transparent (personnages animés, planches de sprites) dans `assets/`, avec dans
  `assets/SOURCES.md` le lien Figma de chaque image.
- Aucune image reprise d'une source externe ; les images EDF/NUWARD du projet NPP ne sont **pas** utilisées.
- Point ouvert : conditions d'usage des images générées par IA à vérifier avant une diffusion publique.

### Ergonomie (règle n° 1 : très clair)
- Un écran = un objectif. Écran de jeu en 3 zones fixes au plus : la ville, la courbe + la tirelire, les commandes.
- Cibles tactiles ≥ 48 × 48 px, texte ≥ 18 px, contraste ≥ 4,5:1, icône **et** mot sur chaque bouton.
- Aucune information portée par la couleur seule (pictogramme ou forme en plus).
- L'élément sur lequel agir **pulse** ; tout le reste est calme.
- Pas plus de 3 nombres à l'écran en même temps pendant le jeu ; le détail est accessible par un bouton.
- Pause toujours accessible ; pas de chronomètre stressant ; pas de lecture obligatoire de longs textes.
- Aucun compte, aucun réseau, aucune donnée personnelle : progression enregistrée seulement sur l'appareil.

## Plateformes et technique (proposition à valider au lot 0)
- Application **tablette Android** (référence : Galaxy Tab A9+, 1920 × 1200, paysage, tactile) et **PC Windows**
  (souris, ≥ 1280 × 800), hors ligne.
- Même pile que le projet NPP, pour réutiliser les outils déjà installés et les scripts d'APK : **TypeScript, React,
  Vite, Tauri 2** (bureau + Android). Ville animée dans un **canvas** (PixiJS proposé : sprites, animations, bonnes
  performances sur tablette) [à confirmer, D-04].
- Organisation du dépôt :
  - `packages/engine` — centrale, demande, argent, bonheur : fonctions pures, sans DOM, testées (Vitest) ;
  - `apps/game` — interface React et vue de la ville ;
  - `content/days/`, `content/shop/`, `content/dialogues/` — contenu en YAML, validé par schéma au démarrage et par test ;
  - `assets/` — images exportées de Figma ; `docs/` — cadrage, décisions, statut, configuration.
- Tests : moteur et économie rejoués sans écran (même graine ⇒ même résultat, au centime près) ; chaque journée vérifiée
  « équilibrée » ; contrôle visuel des écrans à 1280 × 800 et 1920 × 1200 à chaque lot d'interface.

## Gestion de configuration (Git)
Mettre en place dès le lot 0, et l'écrire dans `docs/CONFIGURATION.md` (s'inspirer de celui du projet NPP) :
1. `git init` dans `Neutron City`, branche `main`, `.gitignore` (dépendances, builds, APK, installeurs, fichiers
   locaux), `.gitattributes` (fins de ligne, images en binaire), `.editorconfig`.
2. Dépôt distant GitHub **privé** [nom à confirmer, ex. `NukyBzh/NeutronCity`] ; je crée ou j'autorise la création,
   puis `git push` après chaque commit validé.
3. **Un commit = un lot (ou une étape de lot) validé**, message `<lot>: <ce qui change>` + corps qui dit pourquoi.
   Pas de travail non validé sur `main`. Les essais longs ou risqués se font sur une branche `feature/<sujet>`,
   fusionnée dans `main` seulement après validation.
4. **Versions sémantiques** avec étiquettes annotées `vMAJEUR.MINEUR.CORRECTIF` sur chaque jalon (MINEUR + 1 = jalon,
   CORRECTIF + 1 = retouches) ; `0.x` tant que le jeu n'a pas été testé avec des enfants, **v1.0.0** = première version
   jouée par des enfants. Une étiquette envoyée ne bouge plus.
5. Numéro de version aligné partout (`package.json`, configuration Tauri, version Android) et affiché discrètement dans
   le jeu (écran « À propos »).
6. `CHANGELOG.md` tenu à chaque version (ce qui change pour le joueur, en mots simples) et journal des versions dans
   `docs/CONFIGURATION.md` (version, commit, date, contenu).
7. Jamais de réécriture de l'historique publié (`push --force`, `rebase`, `amend` interdits après envoi) : on corrige par
   un nouveau commit ou `git revert`. La section « Revenir en arrière » du document donne les commandes.
8. Les livrables (APK, installeur) ne sont pas versionnés : on les reconstruit depuis une étiquette (procédure écrite).
9. Les fichiers sources Figma restent dans Figma ; le dépôt garde les exports et leurs liens.

## Feuille de route (à affiner au lot 0)
| Version | Lot | Contenu | Fin du lot |
|---|---|---|---|
| v0.1.0 | L0 Cadrage | Ce document relu, décisions D-02 à D-04 tranchées (D-01 déjà prise), dépôt Git et GitHub en place, squelette de projet qui s'ouvre | Je valide le cadrage |
| v0.2.0 | L1 Maquettes Figma | Écrans (accueil, choix de la journée, jeu, bilan, boutique), style graphique, premiers bâtiments et habitants, Cassandra intégrée | Je valide les maquettes |
| v0.3.0 | L2 Moteur | Centrale, rampe, demande YAML, euros, bonheur ; tests sans écran ; vérification « journée équilibrée » | Tests verts + rapport |
| v0.4.0 | L3 Pilotage | Écran de jeu jouable de 6 h à minuit (curseurs, courbes, tirelire, bilan), ville encore fixe | Partie complète jouable sur PC |
| v0.5.0 | L4 Ville animée | Habitants et véhicules qui bougent, jour/nuit, réactions de la ville au pilotage | Fluide sur tablette |
| v0.6.0 | L5 Cassandra | Accueil, tutoriel, conseils, annonces des surprises, félicitations | Un enfant comprend sans aide adulte |
| v0.7.0 | L6 Boutique | Améliorations de la ville, bonheur, sauvegarde locale de la progression | Achats visibles dans la ville |
| v0.8.0 | L7 Journées | 3 journées équilibrées, surprises à graine, étoiles | Toutes les journées testées |
| v0.9.0 | L8 Tablette | APK Android, installeur Windows, vérifications d'ergonomie et de performance | APK testé sur la tablette |
| v1.0.0 | L9 Essai enfants | Essai avec des enfants de 8 à 12 ans, corrections | Retours intégrés |

**Prévu après la V1 (ne pas coder, mais ne pas rendre impossible)** : journées déséquilibrées (vente / achat
d'électricité, demande impossible), voix de Cassandra et musique, version anglaise, nouveaux quartiers, saisons et
météo, incidents simples de la centrale, plusieurs centrales ou énergies (éolien, solaire) à piloter ensemble, défis
quotidiens.

## Première action demandée
Ne code rien encore. Commence le **lot L0** :
1. lis les fichiers du projet NPP cités plus haut (journée libre, Cassandra, gestion de configuration) ;
2. propose-moi le cadrage dans `docs/CADRAGE.md` : reformulation du jeu, D-01 déjà tranchée (à reporter dans
   `docs/DECISIONS.md`), réponses argumentées aux points entre crochets (D-02 à D-04 et le barème des euros), risques, et ce qui est repris / pas repris du projet NPP ;
3. liste les questions qui me restent à trancher (au plus 6, avec ta recommandation pour chacune) ;
4. propose la commande de création du dépôt Git et du dépôt GitHub, **sans l'exécuter** avant mon accord.
