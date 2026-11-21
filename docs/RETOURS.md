# Retours de test

## R1 — 2026-11-08 · porteur du projet · APK 0.4.0 sur Galaxy Tab A9+

Les retours sont numérotés R1-xx. Chacun a une cause (quand on la connaît) et un lot prévu. On les traite dans
l'ordre des lots, après feu vert du porteur du projet.

| N° | Retour | Cause ou piste | Lot prévu |
|---|---|---|---|
| R1-01 | Les voitures roulent dans la rivière. | Les voitures partent à gauche de la centrale (x = −12), la rivière est en x −10,5 à −1,5 : elles la traversent. Les faire partir après la centrale (route du bord de rivière). | **Fait v0.4.1** |
| R1-02 | Les voitures repartent en arrière. | La ville est redessinée toutes les 5 minutes de jeu (heure, ciel) : les éléments animés sont recréés, leur animation repart de zéro, la voiture « saute » en arrière. Correction : chaque animation reprend là où elle en était quand le dessin change (décalage `--phase`), et rien ne bouge quand le dessin est identique ; mesuré sans recul sur 30 redessins. | **Fait v0.4.1** |
| R1-03 | La fontaine achetée clignote. | Même cause que R1-02 : l'animation d'apparition (`pop`) rejoue à chaque redessin. Ne la jouer qu'une fois, juste après l'achat. | **Fait v0.4.1** |
| R1-04 | Heure au format hh:mm. | Horloge à aiguilles seule aujourd'hui. Ajouter « 14:35 » en chiffres à côté (ou à la place). | **Fait v0.4.1** |
| R1-05 | Écrire la valeur de la consommation cible en chiffres. | Afficher la demande en % (ou MW) à côté de chaque curseur et sur la courbe. | **Fait v0.4.1** |
| R1-06 | Pouvoir accélérer ×2, ×4. | Bouton de vitesse ×1 / ×2 / ×4 dans la barre du haut (le moteur sait déjà avancer plus vite). | **Fait v0.4.1** |
| R1-07 | Cassandra en haut à droite ; la vouloir en bas au centre, pointant le curseur à bouger. | Nouvelle place de Cassandra au-dessus des curseurs, bras tendu vers le curseur qui pulse. Une pose « montre du doigt » est à dessiner. | **Fait v0.4.1** (place et pose « explique », qui montre du doigt) |
| R1-08 | Boutique : on ne voit pas quel objet a été ajouté, ni où. | Après l'achat : la ville zoome ou se centre sur l'objet, qui s'illumine avec une flèche et son nom ; l'article passe à « Acheté ». | **Fait v0.5.0** : flèche jaune qui rebondit sur l'objet dans la ville, bandeau « Nouveau dans ta ville ! » qui dit où il est, carte de l'article entourée |
| R1-09 | Malus si le joueur produit trop d'électricité ; rester dans une bande de ±7 % autour de la courbe. | Change le barème D-02 (aucune pénalité en V1) : nouvelle décision D-15. À préciser : montant du malus, s'il vaut aussi pour la chaleur, si la tirelire peut descendre sous 0. | **Fait v0.5.0** (décision D-15, choix confirmés le 2026-11-08) |
| R1-10 | Les variations de consommation sur la journée sont faibles ; en vouloir de plus fortes. | Courbes plus creusées (nuit basse, pics marqués) ; demande de revoir D-12 (pente ≤ 4,5 %/h) et la rampe D-05 (10 %/h) pour que la journée reste faisable. | **Fait v0.5.0** (décision D-16) |
| R1-11 | Animation du coucher de soleil moche. | Dégradé du ciel calculé par mélange de couleurs. Refaire le ciel heure par heure (aube, jour, coucher orangé, nuit bleue). | **Fait v0.6.0** : ciel heure par heure (aube rose, jour, heure dorée, coucher orangé, crépuscule, nuit), soleil qui se couche derrière la ville, lumière chaude sur les façades |
| R1-12 | Améliorer le ciel ; la nuit, ajouter une lune. | Soleil qui se déplace, lune et étoiles la nuit, quelques nuages. | **Fait v0.6.0** : lune en croissant, étoiles qui scintillent, nuages teintés par la lumière |
| R1-13 | Musique de fond sympa, pas prise de tête. | Aucune musique aujourd'hui. Choix de la source à faire (musique composée pour le projet ou morceau libre de droits), bouton couper le son. | **Fait v0.7.0** : « Happy Clappy Loop » (CC0, choisie par Yann), plus douce la nuit, bruitages légers, bouton « Son » (D-18) |
| R1-14 | Dessins de qualité insuffisante. | Travail de dessin prévu (D-09). | **En partie v0.6.0** : ombres portées des immeubles, arbres avec volume, lumière du soir ; à poursuivre selon tes retours (centrale, habitants, voitures) |

### Lots proposés (à valider)
- **L3.1 — corrections du test (v0.4.1)** : R1-01 à R1-07. **Fait le 2026-11-08**, validé (étiquette v0.4.1).
- **L3.2 — règles et boutique (v0.5.0)** : R1-08 à R1-10, décisions D-15 (bande ±7 % et malus) et D-16 (journées plus contrastées). **Fait le 2026-11-08**, validé (étiquette v0.5.0).
- **L4 — ville animée et dessins** : R1-11, R1-12, R1-14 ; fluidité sur la tablette (D-17). **Fait le 2026-11-08**, validé (étiquette v0.6.0).
- **L5 — Cassandra et son (v0.7.0)** : musique (R1-13), tutoriel. **Fait le 2026-11-09**, en attente de validation. Pose « montre le curseur » : la pose « explique » est gardée (R1-07), à revoir selon tes retours.

## R2 — 2026-11-16 · neveu du porteur du projet (9 ans) · version 0.13.0

Notes de Yann pendant la partie ; décisions prises le 2026-11-16 et le 2026-11-20 (D-30). Les numéros R2-xx suivent
l'ordre des notes.

| N° | Retour | Cause ou piste | Décision et lot prévu |
|---|---|---|---|
| R2-01 | Pendant la fête de la ville, rien ne change dans la ville. | Seuls la panne, la fuite, les nouveaux habitants et la visite de classe se voient. | Une animation par événement : fête (feux d'artifice, guirlandes, foule sur la place, sons « ouais » et verres qui trinquent), canicule (filtre rouge-orangé, air qui ondule), vague de froid (filtre bleu, givre au bord de l'écran), redoux, tempête (pluie, nuages, éclairs), écureuil (sur un pylône, loupe en bas à droite), pic (fenêtres qui s'allument), calorifugeage (ouvrier). Images Gemini, sons libres validés avant téléchargement. **Fait v0.15.0** (L10.4) pour la canicule, le froid, le redoux, la tempête, le pic et les feux d'artifice ; sons CC0 en place, images 85 à 93 intégrées le 2026-11-21 |
| R2-02 | La nuit, des « ZzZ » au-dessus des immeubles. | — | De 23 h à 5 h, « Z » qui montent au-dessus de quelques maisons et immeubles. **Fait v0.14.0** (L10.2) |
| R2-03 | Boutons + et − en plus des curseurs. | — | + au-dessus, − sous chaque curseur, pas de 5 %, une seule fois par touche (pas de répétition au doigt appuyé). **Fait v0.14.0** (L10.2) : + et − empilés à gauche du rail pour qu'il garde sa hauteur |
| R2-04 | Les voitures ne roulent pas sur les routes ; une voiture passe sur une famille. | Voitures et piétons dessinés dans l'ordre de la liste, pas de la profondeur ; circulation dans un seul sens de rues. | Tri par profondeur, voitures au milieu de leur voie, circulation dans les rues perpendiculaires. **Fait v0.14.0** (L10.2) : les bâtiments devant une voiture de rue perpendiculaire la cachent (couche découpée) |
| R2-05 | Les habitants marchent en ligne droite sans entrer dans les bâtiments. | Une seule vue (3/4 avant) par personnage. | Habitants qui entrent et ressortent des bâtiments, école le matin, maison le soir ; vues de dos et 2e pas (Gemini 68 à 76). **Fait v0.15.0** : L10.5a (marche animée en code, dame âgée dans les rues ; images 71 à 74 à refaire, Gemini a changé de personnage, S-01) et L10.5b (visites des bâtiments, école le matin et le soir, D-33) |
| R2-06 | Plus de bâtiments dans la boutique : maisons, immeubles, mairie, hôtel. | — | Petite maison et immeuble achetables plusieurs fois, mairie, hôtel, boulangerie-pâtisserie, caserne (Gemini 77 à 84). **L10.6** |
| R2-07 | Agrandir la ville en achetant du terrain. | — | 3 quartiers de 6 terrains, à vendre quand les 30 pelouses sont construites ; prix pour 2, 3 puis 5 journées d'une ville complète. **L10.6** |
| R2-08 | Sauvegarder la progression. | Elle est déjà enregistrée sur l'appareil. | **Annulé** par Yann. |
| R2-09 | Revoir la valeur des bâtiments. | Tableau des prix donné le 2026-11-16. | Les bâtiments qui aident coûtent 30 % de plus (maison médicale, batterie, parc, isolation, solaire, hôpital, cuve), bonus inchangé. **Fait v0.14.0** (L10.2) : ville complète en 21 journées |
| R2-10 | On ne voit pas bien la ville ; voir la ville entière. | Pendant la partie, seule une bande de la ville est visible. | Ville entière en grand pendant la partie (option A), maquette d'abord. **Fait v0.14.0** (maquette L10.1 validée, écran L10.3) : boutons d'événement au-dessus de leur quartier, ergonomie sans défaut aux 8 formats |

### Lots proposés
- **L10.1** — maquette du nouvel écran de jeu (R2-10).
- **L10.2** — petits correctifs : R2-02, R2-03, R2-04, R2-09.
- **L10.3** — nouvel écran de jeu (R2-10), après validation de la maquette.
- **L10.4** — événements visibles (R2-01).
- **L10.5** — habitants qui entrent dans les bâtiments (R2-05).
- **L10.6** — nouveaux bâtiments puis quartiers à vendre (R2-06, R2-07).
