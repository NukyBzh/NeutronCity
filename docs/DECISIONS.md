# Décisions — Neutron City

*Une ligne par décision importante : numéro, date, choix, raison. Une décision ne s'efface pas : si elle change, une
nouvelle décision la remplace et le dit. Détail des propositions : `docs/CADRAGE.md`.*

| N° | Date | Choix | Raison |
|---|---|---|---|
| D-01 | 2026-11-08 | La centrale **partage** la puissance du cœur entre électricité et chaleur : `e` = part électrique (% de 100 MWe), `h` = part chaleur (% de 300 MWth), `P = e + h ≤ 100 %`. Ex. 70 MWe + 90 MWth = 70 % + 30 % = 100 %. | Comme la cogénération du projet NPP ; physiquement, 300 MWth de cœur donnent environ 100 MWe : on ne peut pas avoir les deux maximums en même temps. |
| D-02 | 2026-11-08 | Barème des euros : par minute de jeu et par sortie demandée, écart ≤ 3 points de cœur = 2 €, ≤ 8 points = 1 €, au-delà = 0 € ; **aucune pénalité négative** en V1. Étoiles : 1 pour une journée finie, 2 dès 50 % du maximum, 3 dès 80 % (CADRAGE §4). | Simple à comprendre, en nombres entiers (rejeu exact), ne décourage pas un enfant de 8 ans. Seuils réglables au lot L7. |
| D-03 | 2026-11-08 | Vue de la ville : **2D de face en plans superposés** (« diorama ») : fond (collines, centrale), rangée de bâtiments, rue animée ; améliorations sur des emplacements prévus (CADRAGE §5). | Ciel jour/nuit, fenêtres et fumées très lisibles ; dessins Figma plus simples ; nouveaux quartiers par défilement horizontal. |
| D-04 | 2026-11-08 | Pile : TypeScript, React, Vite, Vitest, Tauri 2 (bureau + Android) ; ville dans un canvas **PixiJS 8** monté sans `@pixi/react` ; courbes dessinées maison (CADRAGE §6). | Outils déjà installés et scripts d'APK du projet NPP ; PixiJS = sprites fluides sur tablette. |
| D-05 | 2026-11-08 | Rampe de la centrale : **10 % par heure de jeu** pour chaque sortie, paramètre réglable ; pente des demandes ≤ 8 %/h dans les journées équilibrées. | « Quelques % par minute de jeu » serait invisible (une minute de jeu ≈ 0,28 s) ; 10 %/h oblige à anticiper un peu. |
| D-06 | 2026-11-08 | Trois journées V1 : été (facile, électricité seule), printemps (moyen), hiver (difficile, partage du cœur) ; ville **imaginaire** « Neutron City » (nom de travail, à vérifier avant diffusion). | Progression du plus simple au plus dur ; pas de lieu réel. |
