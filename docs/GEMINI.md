# Images générées avec Gemini — synthèse (2026-11-08)

*Travail fait dans une conversation Claude (chat), hors lots. Rien n'est encore branché dans le code : la ville reste
dessinée dans `apps/game/src/play/City.tsx` (D-13). Intégrer ces images serait un nouveau lot à proposer et valider.*

## 1. Ce qui a été fait
1. **Prompts Gemini** écrits pour 27 images (22 objets + 5 tuiles de sol), dans le style de l'image de référence
   `docs/gemini/reference-style-ville.jpg` (ville isométrique vectorielle). Prompts complets en § 4.
2. **Images générées par Yann** dans l'app Gemini (24 sur 27 + 6 variantes ajoutées par lui), livrées en **JPG**.
   Originaux : Drive https://drive.google.com/drive/folders/1zQd_-mH37J1XOIxR450RZtvSLr5U2aFt
3. **Détourage** des 30 JPG en **PNG transparents** recadrés → `assets/gemini/` (outil : `tools/detourage/detoure.py`).
   Contrôle visuel : `docs/gemini/planche-assets-gemini.png` (tous les PNG sur fond bleu).
4. Archive `assets_jeu_centrale_png.zip` (18 285 789 o) déposée par Yann sur le même Drive ; taille vérifiée identique.
5. **Deuxième série (2026-11-08, soir)** : 26 nouveaux JPG de Yann (tuiles 25 à 27 et objets 25 à 47 de
   `docs/OBJETS-VILLE.md`), dont 15 sur fond **vert** et 11 sur fond magenta. Script étendu au fond vert, 26 PNG
   ajoutés à `assets/gemini/` (56 au total). Contrôle visuel : `docs/gemini/planche-assets-gemini-2.png`.
6. **Copie locale du Drive** : `assets/Jeu centrale – assets/` (56 JPG, 30 PNG de l'archive, l'archive, 2 JSON ; 43 Mo).
   Les 30 PNG de l'archive sont identiques pixel pour pixel à ceux de `assets/gemini/` (seul l'encodage diffère :
   les empreintes du § 3 sont celles de l'archive). Les 2 JSON sont identiques à ceux de `docs/conception/`.

## 2. Fichiers (images sur le PC de Yann seulement)
*Choix de Yann (2026-11-08) : les images restent sur son PC, hors de Git (`.gitignore`), tant qu'on ne les utilise pas
dans le jeu. Elles sont restées dans le commit `6e74719` (historique), retirées au commit suivant. Pour les recréer :
originaux du Drive + `tools/detourage/detoure.py` (même résultat à chaque fois).*

| Emplacement | Contenu |
|---|---|
| `assets/gemini/*.png` | 56 PNG transparents, recadrés au plus près (marge 4 px), taille d'origine (≤ 1024 px) |
| `docs/gemini/reference-style-ville.jpg` | image de référence de style fournie par Yann (origine à préciser, **ne pas utiliser dans le jeu**) |
| `docs/gemini/planche-assets-gemini.png` | planche de contrôle (série 1, n° 01 à 24) |
| `docs/gemini/planche-assets-gemini-2.png` | planche de contrôle (série 2, n° 25 à 47) |
| `tools/detourage/detoure.py` | script de détourage (Python 3, Pillow, NumPy, SciPy) |
| `docs/GEMINI.md` | ce document |

Seuls les textes (ce document, `docs/OBJETS-VILLE.md`, `docs/conception/`) et le script sont dans Git.

## 3. Inventaire des images
| N° | Fichier | État | Remarque |
|---|---|---|---|
| 01 | `asset_01_reacteur.png` | détouré (`f6b73b67dd66ff25`) |  |
| 02 | `asset_02_salle_machines.png` | détouré (`501ed680218e2713`) |  |
| 03 | `asset_03_tour_refroidissement_on.png` | détouré (`f7960f7789bb984f`) |  |
| 04 | `asset_04_tour_refroidissement_off.png` | détouré (`15c1311cb68e20e0`) |  |
| 05 | `asset_05_poste_transformation.png` | détouré (`a8df421ca66c7f13`) | légère teinte lavande sur l'acier (vient de Gemini) |
| 06 | `asset_06_pylone_ht.png` | détouré (`dac05b7ce86ac85f`) | légère teinte lavande sur l'acier (vient de Gemini) |
| 07 | `asset_07_station_pompage.png` | détouré (`40d51dd48e41626a`) |  |
| 08 | `asset_08_salle_commande.png` | détouré (`0d2fd93317752890`) |  |
| 09 | `asset_09_batiment_combustible.png` | détouré (`e63606d43461d8e5`) |  |
| 10 | `asset_10_diesel_secours.png` | détouré (`f174dbcfad026577`) |  |
| 11 | `asset_11_immeuble_jour.png` | détouré (`6d2ff122dd85d6bf`) |  |
| 11 | `asset_11_immeuble_jour_neige.png` | détouré (`b4cf92401c563801`) |  |
| 11 | `asset_11_immeuble_nuit_allume.png` | détouré (`c6f224b55ef3a411`) |  |
| 11 | `asset_11_immeuble_nuit_allume_neige.png` | détouré (`52493762bbe5c735`) |  |
| 11 | `asset_11_immeuble_nuit_coupure_neige.png` | détouré (`a9030753368194af`) | numéroté 11 au lieu de 12 : à renommer pour la cohérence |
| 12 | `asset_12_immeuble_nuit_coupure.png` | détouré (`c8370aa3f6dc142a`) |  |
| 13 | `asset_13_usine_1.png` | détouré (`fe8b231d50b41449`) |  |
| 13 | `asset_13_usine_2.png` | détouré (`5f93c89e967922b0`) |  |
| 13 | `asset_13_usine_3.png` | détouré (`d26cb76f4dca7431`) |  |
| 14 | `asset_14_hopital.png` | détouré (`562781d300d3f20a`) |  |
| 15 | `asset_15_gare.png` | détouré (`91edfc1377691459`) |  |
| 16 | `asset_16_maisons.png` | détouré (`0162f1681464707b`) |  |
| 17 | `asset_17_camion_maintenance.png` | détouré (`cc18537ddb0cab4e`) |  |
| 18 | `asset_18_camion_citerne.png` | détouré (`6a901815f4b63077`) |  |
| 19 | `asset_19_arbre.png` | détouré (`f0b09e26dea58a77`) |  |
| 20 | `asset_20_lampadaire.png` | détouré (`857680de4e6e042f`) |  |
| 21 | `asset_21_panneau_alerte.png` | détouré (`9617bcf5daaae0ef`) |  |
| 22 | `asset_22_fumee_incident.png` | détouré (`8039bcdcdd4976e2`) |  |
| 23 | `asset_23_tuile_herbe.png` | détouré (`59fdbe8687b6e4a5`) |  |
| 24 | `asset_24_tuile_route_droite.png` | détouré (`83296988a0721065`) |  |
| 25 | `asset_25_tuile_route_carrefour.png` | détouré (`4f09ee4965a33258`) | fond magenta ; tuile |
| 26 | `asset_26_tuile_riviere.png` | détouré (`59792329b73dca23`) | fond magenta ; tuile |
| 27 | `asset_27_tuile_beton.png` | détouré (`2b0a84569057667f`) | fond magenta ; tuile |
| 25 | `asset_25_ferme_moderne.png` | détouré (`82720dd1ffdcf119`) | fond magenta |
| 26 | `asset_26_maison_lilas.png` | détouré (`7dd574acfd0c2c71`) | fond vert |
| 27 | `asset_27_maison_voiture_electrique.png` | détouré (`425211dcb7dedfea`) | fond vert |
| 28 | `asset_28_epicerie.png` | détouré (`eec5e0ca47722480`) | fond vert |
| 29 | `asset_29_ecole.png` | détouré (`5a06a0a1b6925025`) | fond vert |
| 30 | `asset_30_maison_medicale.png` | détouré (`564e0dc5112c271c`) | fond magenta |
| 31 | `asset_31_batterie_quartier.png` | détouré (`a1ebc11f86a72014`) | fond vert |
| 32 | `asset_32_parc_arbore.png` | détouré (`933278b6a4a8ae0f`) | fond magenta |
| 33 | `asset_33_piscine.png` | détouré (`e8c467997c06db03`) | fond magenta |
| 34 | `asset_34_cuve_chaleur.png` | détouré (`b43b921ff1c4e1bb`) | fond vert |
| 35 | `asset_35_panneaux_solaires_toit.png` | détouré (`3cea4aac5d9793b3`) | fond vert |
| 36 | `asset_36_serre_allumee.png` | détouré (`1e55ff85a6f62020`) | fond magenta |
| 37 | `asset_37_tracteur_electrique.png` | détouré (`74c17205e174b0f6`) | fond vert ; vitres de la cabine teintées vert (dessin de Gemini) |
| 38 | `asset_38_tranchee_tuyaux.png` | détouré (`3c053c048dd5910d`) | fond vert |
| 39 | `asset_39_tuyau_chaleur.png` | détouré (`c0d48f5b2a6e9c5b`) | fond vert |
| 40 | `asset_40_tapis_sacs.png` | détouré (`20b82a6f05a1c582`) | fond vert |
| 41 | `asset_41_ambulance.png` | détouré (`5b8444e011a89c03`) | fond vert |
| 42 | `asset_42_enfants_cour.png` | détouré (`433c2347bb3b40d2`) | fond vert |
| 43 | `asset_43_balancoire.png` | détouré (`bf5dc498722fa173`) | fond vert ; chaînes très fines : léger reste de vert au maillon, invisible à taille de jeu |
| 44 | `asset_44_oiseaux.png` | détouré (`e0f92b75dab8389e`) | fond vert |
| 45 | `asset_45_panneau_vacances.png` | détouré (`79ffc3867dcf498c`) | fond vert |
| 46 | `asset_46_bonnet_laine_cheminee.png` | détouré (`7351f3bc62b32174`) | fond vert |
| 47 | `asset_47_croix_verte.png` | détouré (`939668ed6fbf4220`) | fond magenta |

Variantes ajoutées par Yann hors liste : `asset_11_immeuble_jour`, `_jour_neige`, `_nuit_allume_neige`,
`_nuit_coupure_neige`, et trois usines `asset_13_usine_1/2/3`. Les empreintes (SHA-256, début) concernent les PNG.
**Numéros en double** : 25, 26 et 27 servent à la fois aux tuiles (§ 4) et aux objets de `docs/OBJETS-VILLE.md`
(ferme, maison lilas, maison à voiture électrique). Les noms de fichiers restent distincts ; renuméroter si besoin.

## 4. Prompts Gemini (à coller tels quels, image de référence jointe)
Règle de nommage : `asset_XX_nom` sans accents ni espaces. Un objet par image.

**Améliorations pour les prochaines générations** (retour d'expérience) :
- Ajouter « fichier PNG » : Gemini a rendu du JPG, ce qui complique le détourage.
- Le fond magenta a teinté l'acier (pylône, poste). Pour les objets métalliques, ajouter « acier gris neutre, sans reflet
  rose », ou remplacer le fond par un vert pur #00FF00 si l'objet ne contient pas de vert.
- Le magenta rendu varie d'une image à l'autre (de #FF00FF à rose-violet) : le script le détecte image par image.

### Objets

**01 — reacteur**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un bâtiment réacteur de centrale nucléaire : grand cylindre en béton gris clair surmonté d'un dôme, posé sur un socle gris très clair. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**02 — salle_machines**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine la salle des machines d'une centrale nucléaire : long bâtiment industriel rectangulaire, bardage métallique gris, toit plat avec quelques équipements, rangée de fenêtres hautes. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**03 — tour_refroidissement_on**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une tour aéroréfrigérante de centrale nucléaire en forme d'hyperboloïde en béton gris clair, avec un panache de vapeur blanc stylisé en nuages arrondis au sommet. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la hauteur. Aucun texte ni logo.
```
**04 — tour_refroidissement_off**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une tour aéroréfrigérante de centrale nucléaire en forme d'hyperboloïde en béton gris clair, sans aucune vapeur (tour à l'arrêt). Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la hauteur. Aucun texte ni logo.
```
**05 — poste_transformation**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un poste de transformation électrique : trois gros transformateurs gris avec isolateurs blancs, portiques métalliques, le tout sur une dalle grise entourée d'une clôture grillagée. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**06 — pylone_ht**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un pylône électrique haute tension en treillis métallique gris, avec isolateurs et courts tronçons de câbles. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la hauteur. Aucun texte ni logo.
```
**07 — station_pompage**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une station de pompage en bord de rivière : bâtiment en béton gris avec grilles de prise d'eau plongeant dans une petite portion d'eau turquoise, gros tuyaux sortant vers l'arrière. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**08 — salle_commande**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine le bâtiment de la salle de commande d'une centrale : bâtiment moderne de deux étages, larges baies vitrées turquoise, toit plat avec antennes, entrée sur un socle gris clair. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**09 — batiment_combustible**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine le bâtiment d'entreposage du combustible d'une centrale nucléaire : bâtiment rectangulaire massif en béton gris clair, peu de fenêtres, grande porte de manutention, pont roulant visible sur le toit. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**10 — diesel_secours**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine le bâtiment du groupe électrogène diesel de secours d'une centrale : petit bâtiment en béton gris, deux cheminées d'échappement métalliques, grilles de ventilation, porte. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**11 — immeuble_nuit_allume**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un immeuble haussmannien de 6 étages en pierre claire, toit en ardoise gris foncé avec lucarnes et cheminées, balcons en fer forgé, vue de nuit : toutes les fenêtres éclairées en jaune chaud, façade dans des tons légèrement assombris bleutés. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la hauteur. Aucun texte ni logo.
```
**12 — immeuble_nuit_coupure**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un immeuble haussmannien de 6 étages en pierre claire, toit en ardoise gris foncé avec lucarnes et cheminées, balcons en fer forgé, vue de nuit pendant une coupure de courant : toutes les fenêtres éteintes, gris foncé bleuté, façade dans des tons assombris bleutés. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la hauteur. Aucun texte ni logo.
```
**13 — usine**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une usine : bâtiment en brique rouge sombre, quatre cheminées, deux silos gris clair à côté, hangar à toit en sheds gris. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**14 — hopital**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un hôpital : bâtiment blanc et gris clair de 5 étages, nombreuses fenêtres turquoise, grande croix rouge sur le toit, auvent d'entrée des urgences. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**15 — gare**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une petite gare : bâtiment voyageurs gris clair avec verrière, un quai couvert et une voie avec un train gris à bande orange et portes rouges. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**16 — maisons**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un petit pâté de quatre maisons individuelles mitoyennes de 2 étages, façades crème, rose pâle et brique, toits rouges et ardoise, deux petits arbres verts arrondis, sur un socle trottoir gris très clair. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la largeur. Aucun texte ni logo.
```
**17 — camion_maintenance**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un camion de maintenance blanc avec une bande orange, gyrophare sur le toit, caisse arrière fermée. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 70 % de la largeur. Aucun texte ni logo.
```
**18 — camion_citerne**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un camion-citerne : cabine blanche, citerne cylindrique gris clair. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 70 % de la largeur. Aucun texte ni logo.
```
**19 — arbre**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un arbre isolé : feuillage vert arrondi en forme de goutte, deux tons de vert, tronc brun fin. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 70 % de la hauteur. Aucun texte ni logo.
```
**20 — lampadaire**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un lampadaire urbain gris foncé, élégant, avec la lampe allumée en jaune chaud et un léger halo lumineux autour. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 80 % de la hauteur. Aucun texte ni logo.
```
**21 — panneau_alerte**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un panneau d'alerte triangulaire jaune avec bord noir et un point d'exclamation noir, monté sur un petit poteau gris, vu en isométrique. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 70 % de la hauteur. Aucun texte ni logo.
```
**22 — fumee_incident**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un panache de fumée grise stylisé, composé de nuages arrondis empilés, plus foncés en bas et plus clairs en haut, s'élevant verticalement. Un seul objet, centré, entièrement visible. Fond uni magenta #FF00FF, sans sol ni décor ni ombre portée sur le fond. Format carré 1024x1024, objet sur 70 % de la hauteur. Aucun texte ni logo.
```

### Tuiles de sol (losange 2:1)

**23 — tuile_herbe** (fait)
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une seule tuile de sol isométrique en forme de losange (deux fois plus large que haute) : pelouse verte unie comme les espaces verts de l'image, avec une fine bordure trottoir gris très clair. Tuile vue de dessus en isométrique, épaisseur de socle visible sur les deux faces avant. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, tuile sur 90 % de la largeur. Aucun texte ni objet dessus.
```
**24 — tuile_route_droite** (fait)
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une seule tuile de sol isométrique en forme de losange (deux fois plus large que haute) : route droite beige comme les routes de l'image, traversant la tuile d'un coin à l'autre, avec trottoirs gris très clair des deux côtés. Aucun véhicule. Tuile vue de dessus en isométrique, épaisseur de socle visible sur les deux faces avant. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, tuile sur 90 % de la largeur. Aucun texte ni objet dessus.
```
**25 — tuile_route_carrefour** (À FAIRE)
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une seule tuile de sol isométrique en forme de losange (deux fois plus large que haute) : carrefour en croix de deux routes beiges comme celles de l'image, passages piétons blancs, trottoirs gris très clair aux quatre angles. Aucun véhicule. Tuile vue de dessus en isométrique, épaisseur de socle visible sur les deux faces avant. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, tuile sur 90 % de la largeur. Aucun texte ni objet dessus.
```
**26 — tuile_riviere** (À FAIRE)
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une seule tuile de sol isométrique en forme de losange (deux fois plus large que haute) : rivière turquoise claire avec petits traits blancs de courant comme la rivière de l'image, traversant la tuile d'un coin à l'autre, berges beiges des deux côtés. Aucun bateau. Tuile vue de dessus en isométrique, épaisseur de socle visible sur les deux faces avant. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, tuile sur 90 % de la largeur. Aucun texte ni objet dessus.
```
**27 — tuile_beton** (À FAIRE)
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine une seule tuile de sol isométrique en forme de losange (deux fois plus large que haute) : dalle de béton gris clair industrielle avec joints de dilatation fins et marquages au sol jaunes discrets. Tuile vue de dessus en isométrique, épaisseur de socle visible sur les deux faces avant. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, tuile sur 90 % de la largeur. Aucun texte ni objet dessus.
```

## 5. Détourage — méthode (`tools/detourage/detoure.py`)
1. Couleur de fond estimée sur le pourtour de chaque image (médiane d'une bande de 6 px).
2. Fond retiré : zone proche de cette couleur reliée aux bords, plus tout pixel de la couleur du fond où qu'il soit
   (trous fermés : treillis du pylône, grillage, dessous des camions).
3. Bords adoucis (transparence progressive) et suppression de la teinte résiduelle (« despill »).
4. Recadrage au plus près, export PNG.

Fond magenta ou vert détecté tout seul. **Fond vert** (série 2) : à l'intérieur de l'objet, seul le vert très saturé
(écart G − max(R, B) > 85) est retiré, et la teinte n'est corrigée que dans une bande de 3 px au bord ; les plantes de
la serre et les pelouses (écart < 85) restent intactes. La méthode magenta est inchangée (PNG de la série 1 reproduits
à l'identique).

Utilisation : `python detoure.py <dossier_jpg> <dossier_png> [fichiers.jpg …]` (sans liste : tous les JPG).

## 6. Suite proposée
- **Décider de l'usage** de ces images (lot à proposer) : remplacer tout ou partie de la ville dessinée en code (D-13),
  ou ne s'en servir que comme modèles. Points à trancher : cohérence de style avec le reste, poids (≈ 18 Mo, à réduire
  en WebP et à la taille d'affichage pour la tablette), conditions d'usage des images IA (point ouvert de `assets/SOURCES.md`).
- **Autres images utiles** si le lot est retenu : variantes de nuit des bâtiments de la centrale, effets canicule et
  crue, personnages (opérateur, technicien), écran titre.
- **Outil de travail** : poursuivre le développement dans Claude Code (sessions cloud ou Projets Claude Code, utilisables
  depuis le téléphone quand le PC est éteint), avec le dépôt GitHub `NukyBzh/NeutronCity` ; garder le chat pour les prompts.
