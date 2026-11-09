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
