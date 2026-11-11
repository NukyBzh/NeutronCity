# Journal des changements — Neutron City

*Ce qui change pour le joueur, en mots simples. Une section par version (voir `docs/CONFIGURATION.md` §4).*

## v0.10.0 (en cours) — 2026-11-11 (lot L8.1 : tablettes et téléphones, à valider)
- Le jeu s'adapte aux téléphones tenus à l'horizontale (iPhone 11 et 14, Galaxy S20 et S23 Ultra) : tout est environ 1,6 fois plus grand qu'avant, les boutons font au moins 44 px et le texte au moins 15 px.
- Sur téléphone, l'écran de jeu met la ville et les courbes à gauche et les deux curseurs à droite, sur toute la hauteur ; Cassandra parle depuis le coin de la ville.
- Sur téléphone, la boutique montre ses bâtiments sur 3 colonnes qu'on fait défiler ; le bilan met la ville, le résultat et le conseil de Cassandra côte à côte.
- Le jeu laisse libres l'encoche de l'iPhone et le trou de caméra des Samsung.
- Sur les petites tablettes (Galaxy Tab A 7 pouces), aucun texte n'est plus petit que 15 px.
- La fenêtre de pause passe toujours devant Cassandra.

## v0.9.1 — 2026-11-10 (lot L7.2 : l'équilibrage, à valider)
- Les événements arrivent plus ou moins souvent, comme prévu dans le fichier de Yann : la tempête, le match et l'écureuil souvent, la fête de la ville rarement. Une journée en a 2 ou 3.
- Une panne coûte cher : tant que tu n'as pas envoyé le camion ou fait sortir l'écureuil, la ville gagne 3 fois moins. Si tu aides tout de suite, tu ne perds rien.
- 3 étoiles dès 75 % du maximum, 2 étoiles dès 45 %.
- Les bâtiments coûtent 3 fois plus cher et rapportent 3 fois moins chaque jour : il faut une vingtaine de journées pour construire toute la ville.
- L'écran d'accueil a une image de fond : la ville et sa centrale vues de haut.
- Le réseau de chaleur est maintenant une station de chaleur en briques, collée à la centrale, avec ses gros tuyaux orange qui partent vers la ville.

## v0.9.0 — 2026-11-09 (lot L7.1 : les événements, à valider)
- Chaque journée a 2 ou 3 événements, un à la fois : match à la télé, canicule, vague de froid, redoux, tempête, écureuil dans le transformateur, fuite de chaleur, échangeur entartré, nouveaux habitants, visite de classe, fête de la ville.
- Cassandra annonce certains événements une heure avant ; d'autres arrivent d'un coup. La première fois, elle explique ce qui se passe.
- Pour certains, tu agis en touchant la ville : envoyer le camion de réparation, faire sortir l'écureuil, appuyer longtemps sur la vanne, nettoyer l'échangeur en 5 touchers, accueillir une famille (+150 €).
- Une tempête ou un écureuil éteint un quartier : il gagne moins tant qu'il n'est pas réparé. La canicule oblige la centrale à produire moins ; la fête de la ville fait gagner double ; la visite de classe rapporte 100 € si tu restes « bien suivi » une heure.
- L'hôpital protège son quartier, la maison médicale rend les pannes moins fortes, la batterie aide pendant la canicule.
- Le bonus de la ville dépend des étoiles : en entier avec 3 étoiles, la moitié avec 2, rien avec 1.

## v0.8.2 — 2026-11-09 (lot L6.3 : la ville en images, à valider)
- Toute la ville est faite avec les mêmes images que la boutique : un damier de tuiles (herbe, routes, carrefours, rivière, béton) avec la centrale, des immeubles de toutes sortes (haussmannien, moderne, brique, rose, tour de bureaux, boulangerie), des maisons, les usines, la gare, les arbres et une aire de jeux.
- Des voitures, un bus et des habitants circulent dans les rues.
- La nuit, les fenêtres des immeubles s'allument ; en hiver, ils sont enneigés ; dans un quartier sans électricité, ils s'éteignent et un panneau d'alerte apparaît.
- Les lampadaires achetés sont posés aux carrefours ; des oiseaux traversent le ciel le jour.
- La fontaine a sa place dans la ville ; la piste cyclable verte longe les grandes rues ; les cartes de la boutique montrent les nouvelles images (fontaine, piste, lampadaire).

## v0.8.1 — 2026-11-09 (lot L6.2 : les bâtiments dans la ville, à valider)
- Chaque bâtiment de la boutique a son terrain dans la ville : une tuile d'herbe tant qu'il n'est pas acheté (enneigée en hiver).
- Quand tu l'achètes, le bâtiment arrive sur son terrain avec la même image que dans la boutique ; une flèche jaune le montre.
- Les bâtiments se voient aussi pendant la journée, dans la bande de la ville ; le soir et la nuit, ils prennent la lumière comme le reste de la ville.
- L'isolation pose un bonnet de laine sur la cheminée de la maison des Lilas.
- Les images de la boutique sont plus nettes.
- Correction : dans l'application Android, le décor de la ville (immeubles, routes) pouvait ne pas s'afficher depuis la v0.6.0 ; il s'affiche de nouveau.

## v0.8.0 — 2026-11-09 (lot L6.1 : la boutique de la ville, à valider)
- La boutique propose 18 bâtiments : ferme, réseau de chaleur, maisons, épicerie, école, usine, maison médicale, puis batterie, parc, fontaine, piste cyclable, piscine, lampadaires, maisons isolées, panneaux solaires, hôpital, cuve de chaleur.
- Au début, c'est la découverte : un seul bâtiment à la fois, que Cassandra présente. Après les 8 premiers, tu choisis ; les autres s'ouvrent quand la ville grandit (8, 10, 12, 14, 16 bâtiments).
- Chaque bâtiment rapporte des euros à la fin de chaque journée (« Ta ville rapporte… » au bilan) et rend les habitants plus heureux.
- Les bâtiments changent un peu la demande : la ferme veut de l'électricité le jour, la voiture électrique la nuit, les panneaux solaires en demandent moins… La courbe en pointillés en tient compte.
- Le printemps et l'hiver s'ouvrent quand tu achètes le réseau de chaleur.
- Chaque carte de la boutique montre l'image du bâtiment, ce qu'il change et ce qu'il rapporte.

## v0.7.0 — 2026-11-09 (lot L5 : Cassandra et le son)
- À la première partie, Cassandra montre le jeu pas à pas, le temps arrêté : la ville, la demande en pointillés, le curseur jaune (à toi de le bouger !), la centrale qui suit doucement, la tirelire. Bouton « Passer » pour sauter l'aide.
- « Revoir l'aide » sur l'accueil relance le tutoriel ; « Nouveau joueur » le remontre aussi.
- Une musique de fond joyeuse au piano, en boucle, plus douce la nuit.
- Petits bruitages : clic des boutons, pièces qui tombent dans la tirelire, alerte avant une surprise, petite musique au bilan.
- Bouton « Son » (sur l'accueil et dans la pause) pour couper ou remettre la musique et les bruitages ; la tablette s'en souvient.

## v0.6.0 — 2026-11-08 (lot L4 : la ville vivante)
- Le ciel change avec l'heure : aube rose, plein jour, heure dorée, coucher de soleil orangé, puis la nuit.
- Le soleil traverse le ciel et se couche derrière la ville ; la nuit, la lune et les étoiles apparaissent ; des nuages passent doucement.
- Au coucher du soleil, une lumière chaude éclaire les façades ; les immeubles font des ombres sur le sol ; les arbres ont du volume.
- La ville est plus fluide sur la tablette, surtout quand le temps va vite (×2, ×4).

## v0.5.0 — 2026-11-08 (lot L3.2 : règles et boutique)
- Une bande verte autour des pointillés montre la « zone qui rapporte » : reste à ±7 % de la demande pour gagner des euros.
- Produire trop d'électricité coûte 1 € par minute : l'électricité en trop est perdue. Des pièces rouges sortent de la tirelire et Cassandra te prévient. La tirelire ne descend jamais sous 0 €.
- La demande varie beaucoup plus dans la journée (nuit basse, pics marqués) ; la centrale suit plus vite (15 % par heure).
- Dans la boutique, après un achat, une flèche jaune montre l'objet dans la ville et un bandeau dit où il est.
- La tirelire est maintenant en haut de l'écran de jeu, à côté des boutons de vitesse.

## v0.4.1 — 2026-11-08 (lot L3.1 : corrections après le premier test sur la tablette)
- Les voitures ne roulent plus dans la rivière : elles partent après la centrale et avancent toujours, sans revenir en arrière.
- La fontaine (et les autres achats) ne clignotent plus : ils n'apparaissent avec une petite animation qu'au moment de l'achat.
- L'heure s'affiche aussi en chiffres (14:35), à côté de l'horloge.
- Au-dessus de chaque curseur, la ville dit ce qu'elle veut en chiffres (« La ville veut 64 % »), et un trait en pointillés montre ce niveau sur le curseur.
- Boutons ×1, ×2, ×4 en haut à droite pour faire passer le temps plus vite.
- Cassandra se tient en bas, entre les courbes et les curseurs, et montre du doigt les curseurs ; ses bulles apparaissent au-dessus d'elle.
- Le jeu existe en application Android pour la tablette : un fichier APK à installer à la main, qui marche hors ligne, en paysage et plein écran.

## v0.4.0 — 2026-11-08 (lot L3 : le pilotage)
- La ville est maintenant dessinée en isométrique : pendant la partie, on voit la rivière, la centrale, la conduite de chaleur et la ligne électrique qui partent vers les rues ; dans la boutique et à la fin de la journée, on voit toute la ville, de jour ou de nuit, avec ses achats.
- Les voitures roulent dans les rues, les habitants se promènent, la neige tombe en hiver.
- Ta partie est gardée sur l'appareil : euros, étoiles et achats restent quand on recharge. La tirelire commence à 0 € : il faut jouer pour acheter.
- Bouton « Nouveau joueur » sur l'accueil pour recommencer à zéro.

## v0.3.1 — 2026-11-08 (retouches : les saisons)
- Nouveau style choisi pour la ville : isométrique, couleurs vives et contours foncés, voitures sur roues (bientôt dans le jeu).
- La ville change avec la journée : en été, collines dorées et climatiseurs aux fenêtres ; au printemps, arbres en fleurs et jardinières ; en hiver, neige qui tombe, toits et trottoirs blancs, arbres sans feuilles et habitants en bonnet et écharpe.

## v0.3.0 — 2026-11-08 (lot L2 : le moteur)
- Les trois journées sont jouables : été (facile), printemps (moyen) et hiver (difficile, il faut partager le cœur entre électricité et chaleur). Une journée s'ouvre quand on a fini la précédente.
- À chaque partie, deux surprises différentes : un grand match à la télé, une vague de froid ou un redoux. Cassandra les annonce une heure avant.
- À la fin de la journée, Cassandra donne un conseil adapté : penser au pic du soir, au chauffage, ou regarder la demande à venir.
- Le bonheur de la ville monte avec chaque achat de la boutique et ne baisse jamais.

## v0.2.1 — 2026-11-08 (retouches : dessins plus réalistes)
- La ville est redessinée : vraie centrale (tour de refroidissement avec sa vapeur, bâtiment du réacteur, salle des machines), ligne électrique et conduite de chaleur jusqu'aux maisons, maisons à tuiles, immeuble en briques avec balcons, boulangerie, tour moderne.
- Les habitants marchent vraiment (jambes et bras), la voiture et le vélo sont plus détaillés, les nuages passent, la nuit tombe doucement et les fenêtres s'allument.
- Les dessins de la boutique sont plus beaux ; les lampadaires éclairent le trottoir la nuit et la piste cyclable longe la route.
- Cassandra ne parle plus de chauffage ni de surprise pendant la journée d'été.

## v0.2.0 — 2026-11-08 (lot L1 : maquettes)
- On peut déjà essayer le jeu en maquette : choisir une journée (été ou printemps), piloter l'électricité et la chaleur avec deux gros curseurs, suivre la courbe de la ville, gagner des euros, voir le bilan et acheter des améliorations dans la boutique.
- Cassandra parle pendant la partie : elle explique, prévient des surprises, aide si tu bloques et te félicite.
- La ville vit : le ciel passe du matin à la nuit, les fenêtres s'allument, les habitants se promènent, et la ville réagit quand l'électricité ou la chaleur manque.
- Les dessins sont encore simples : ils seront rendus plus réalistes.

## v0.1.0 — 2026-11-08 (lot L0 : cadrage)
- Le projet démarre : idée du jeu, règles et choix principaux écrits (`docs/CADRAGE.md`, `docs/DECISIONS.md`).
- Un premier écran s'ouvre : « Neutron City », avec Cassandra qui dit bonjour. On ne peut pas encore jouer.
