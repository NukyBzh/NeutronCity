# Images générées avec Gemini — synthèse (2026-11-08)

*Travail commencé dans une conversation Claude (chat), hors lots. Depuis le lot L6.3 (D-20), toute la ville du jeu est
faite de ces images (`assets/ville/`, `assets/objets/`) ; les images manquantes sont au § 5.*

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

## 5. Série 3 : images manquantes de la ville (lot L6.3, 2026-11-09)
**Livrée par Yann le 2026-11-09 au soir** (17 JPG dans `assets/Jeu centrale – assets/`, dont deux familles), détourée
(fond vert, la tuile sur magenta) dans `assets/gemini/`, contrôle `docs/gemini/planche-assets-gemini-3.png`, intégrée au
jeu. Le fichier `image-1794257061550.jpg` du même dossier est l'image de référence de style (pas utilisée).
*Demande de Yann : toute la ville en images Gemini, aucun bâtiment, véhicule ou objet dessiné en SVG. La ville du lot L6.3
n'utilise que les images existantes ; ces 16 images apportent les voitures, les habitants, la fontaine, la piste cyclable
et plus de variété de bâtiments. Les livrer comme les séries 1 et 2 (même Drive) : Claude les détoure
(`tools/detourage/detoure.py`) et les intègre.*

Conseils : joindre `docs/gemini/reference-style-ville.jpg` à chaque prompt ; pour une voiture, générer d'abord la vue avant
puis demander « la même voiture vue de trois quarts arrière » dans la même conversation, pour garder la même voiture.
Les bâtiments n'ont pas besoin d'une version de nuit : le jeu les assombrit ; une version de nuit fenêtres allumées
(comme l'immeuble 11) peut être ajoutée plus tard.

**asset_48_voiture_rouge_avant.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une petite voiture citadine rouge vue de trois quarts avant, roulant vers le bas à droite de l'image, vitres turquoise, phares visibles. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_49_voiture_rouge_arriere.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : la même petite voiture citadine rouge vue de trois quarts arrière, s'éloignant vers le haut à gauche de l'image, feux arrière visibles. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_50_voiture_bleue_avant.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une petite voiture familiale bleue vue de trois quarts avant, roulant vers le bas à droite de l'image, vitres turquoise, phares visibles. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_51_voiture_bleue_arriere.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : la même petite voiture familiale bleue vue de trois quarts arrière, s'éloignant vers le haut à gauche de l'image, feux arrière visibles. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_52_bus_avant.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un petit bus de ville jaune et blanc vu de trois quarts avant, roulant vers le bas à droite de l'image, vitres turquoise. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 75 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_53_habitant_adulte.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un adulte qui marche, vu de trois quarts, pull vert, pantalon gris, petit sac, silhouette simple et souriante. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_54_habitant_enfant.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un enfant qui marche, vu de trois quarts, t-shirt orange, short bleu, casquette, silhouette simple et souriante. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_55_habitants_famille.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : deux adultes et un enfant qui marchent ensemble, vus de trois quarts, vêtements de couleurs vives différentes. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 75 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_56_fontaine.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une fontaine de place publique ronde en pierre claire, vasque à deux étages, jets d'eau turquoise, posée sur un petit socle pavé. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 75 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_57_tuile_piste_cyclable.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine une seule tuile de sol carrée vue en isométrique, avec la même épaisseur de socle que les autres tuiles : une route droite identique à la tuile route droite (chaussée beige, trottoirs gris clair), avec une piste cyclable verte le long d'un trottoir et un petit vélo blanc peint au sol. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), tuile centrée sur 90 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_58_immeuble_moderne.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un immeuble moderne de 7 étages, façade blanche et grandes baies vitrées turquoise, balcons, toit plat avec petits équipements, sur un socle trottoir gris très clair. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_59_immeuble_brique.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un immeuble de 5 étages en brique orangée, fenêtres blanches, toit plat avec cheminées, rez-de-chaussée avec vitrine, sur un socle trottoir gris très clair. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_60_tour_bureaux.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une tour de bureaux de 12 étages en verre bleu clair et cadres gris, sur un socle trottoir gris très clair. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 85 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_61_boulangerie.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un petit immeuble de 3 étages crème avec une boulangerie au rez-de-chaussée, auvent jaune, vitrine avec pains, sur un socle trottoir gris très clair. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_62_maison_jardin.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une maison individuelle blanche à toit rouge avec un petit jardin vert, une haie et un arbre, sur un socle trottoir gris très clair. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_63_immeuble_rose.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un immeuble de 4 étages rose pâle, toit en ardoise gris foncé avec lucarnes, balcons blancs, sur un socle trottoir gris très clair. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

## 6. Série 4 : bâtiment du réseau de chaleur (2026-11-10)
*Demande de Yann : la tuile avec un tuyau pour dire qu'on a un réseau de chaleur est moche ; il faut plutôt un bâtiment
collé à la centrale.* L'image remplacera `reseau-chaleur` dans la boutique et dans la ville ; Claude la place contre la
centrale (côté ville) au lieu du terrain actuel.
**Livrée par Yann le 2026-11-10** (fond magenta), détourée dans `assets/gemini/asset_64_reseau_chaleur.png`, intégrée :
`assets/objets/reseau-chaleur.webp`, terrain sur le béton de la centrale à côté du stock de combustible (case 1,9).

**asset_64_reseau_chaleur.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un seul objet : la station de chaleur d'une centrale, un bâtiment industriel bas et compact en briques rouge clair et bardage gris, toit plat avec une petite cheminée sans fumée, une grande porte de garage, et sur le côté droit trois gros tuyaux calorifugés orange qui sortent du mur, font un coude et partent vers le bas à droite de l'image, coupés net comme s'ils continuaient sous la ville. Un petit logo de flamme sans texte sur la façade. Posé sur un socle de béton gris clair en losange, sans herbe. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 75 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

## 7. Série 5 : image de fond de l'écran d'accueil (2026-11-11)
*Demande de Yann : rendre l'écran d'accueil (`docs/maquettes/1-accueil.png`) plus agréable avec une image de fond.
Disposition actuelle (`apps/game/src/app.css`, `.home`) : titre, sous-titre et boutons dans les 40 % gauche, à mi-hauteur ;
Cassandra en pied à droite (≈ 70-90 % de la largeur, presque toute la hauteur) ; sa bulle au centre-haut ; fond actuel
dégradé `--ciel` #BFE3FF → `--creme` #FFF6DC. Tablette 1920 × 1200 paysage.*

**fond_accueil.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise, contours nets, rendu « dessin animé » doux pour enfants de 8 à 12 ans), dessine une image de fond panoramique pour l'écran d'accueil d'un jeu vidéo. Les deux tiers supérieurs de l'image sont un ciel uni en dégradé vertical, bleu ciel #BFE3FF en haut vers crème #FFF6DC à l'horizon, avec seulement deux ou trois petits nuages blancs arrondis près des bords. Le tiers inférieur montre une petite ville vue en isométrique, en bande horizontale sur toute la largeur. Au centre de cette bande, une centrale nucléaire compacte au bord d'une rivière turquoise : bâtiment réacteur cylindrique en béton gris clair surmonté d'un dôme, salle des machines au bardage gris, une tour aéroréfrigérante en hyperboloïde avec un petit panache de vapeur blanc en nuages arrondis, une ligne de pylônes haute tension gris neutre qui part vers la ville. De part et d'autre : immeubles en pierre claire à toits d'ardoise, immeubles rose pâle et en brique orangée, maisons à toits rouges, un parc avec arbres verts arrondis, routes beiges avec trottoirs gris clair, quelques petites voitures rouges et bleues. Les bâtiments restent bas : aucun ne dépasse le tiers inférieur de l'image, pour qu'un titre, des boutons et un personnage puissent être posés devant sans gêne. Derrière la ville, des collines vertes pâles qui se fondent dans le ciel ; en bas, la ville se termine par une pelouse verte unie. Ambiance de matin de printemps, gaie et calme, contraste modéré, couleurs légèrement adoucies. Format paysage 16:10 (1920x1200), fichier .png obligatoire (pas de JPG). Aucun personnage, aucun texte, aucune lettre, aucun chiffre, aucun logo.
```
**Choix de Yann le 2026-11-11** : sa propre image `Image_d_accueil_1.jpg` (ville et centrale vues de haut, dossier
`assets/Jeu centrale – assets/`), préférée à `Image_d_accueil_2.jpg` après simulation ; ce prompt n'a pas servi.
Intégrée : `assets/fond-accueil.webp` (1312 × 816, 84 Ko) en fond de `.home` (`cover`, bas centré), titre et boutons sur
une carte blanche ; contrôle visuel à 1280 × 800 et 1920 × 1200.

## 8. Série 6 : icône et logo de Neutron City (2026-11-11)

Images à joindre : `NukiTeam - Identité/logo-officiel/png/nukiteam-symbole-1024.png` (pour Nuki) et
`apps/game/public/icons/icone-512.png` (icône actuelle, pour le style du jeu).

```
Tu es directeur artistique, spécialiste des logos et des icônes d'applications pour enfants.
Crée l'icône et le logo du jeu « Neutron City » : un jeu éducatif pour les 8–12 ans où l'on pilote
une petite centrale qui alimente une ville en électricité et en chaleur. Le jeu est signé par
l'équipe NukiTeam.

Image 1 jointe : le logo NukiTeam. Reprends EXACTEMENT son électron, la mascotte « Nuki » :
une bille ronde cyan #3DD6FF, contour bleu nuit #0B1B3F épais, reflet blanc ovale en haut à gauche,
deux petits yeux ronds bleu nuit avec un point blanc, une petite bouche ronde (air curieux),
un halo cyan doux autour. Ne change ni sa forme, ni sa couleur, ni son visage.
Image 2 jointe : l'icône actuelle du jeu, pour l'ambiance (ciel bleu clair, herbe verte, formes rondes).

Le principe : Nuki ORBITE autour d'un bâtiment. Une orbite elliptique cyan #3DD6FF, inclinée
d'environ -30°, cernée d'un fin liseré bleu nuit, passe DERRIÈRE le bâtiment en haut et DEVANT
lui en bas ; Nuki est posé sur l'orbite, en bas à gauche, et regarde le bâtiment.

Fais 3 propositions, côte à côte sur une seule planche, chacune avec un bâtiment différent :
1. Une maison : toit rouge-orangé #E07A1F, fenêtres jaunes allumées #FFD23F, petite cheminée qui fume.
2. Un petit immeuble de ville arrondi, fenêtres allumées, une petite éolienne ou un panneau sur le toit.
3. La centrale du jeu : un dôme arrondi blanc avec une fenêtre ronde jaune, et à côté une petite
   cheminée d'où sort un nuage blanc.

Pour chaque proposition, montre deux choses l'une sous l'autre :
- L'ICÔNE : un carré aux coins très arrondis (rayon = 25 % du côté), fond dégradé de bleu ciel
  #7CC8FF en haut vers bleu #1D47B8 en bas, une bande d'herbe verte #5BBF4A arrondie en bas,
  le bâtiment au centre, l'orbite et Nuki. Rien d'autre, pas de texte. Lisible à 48 px :
  formes très simples, gros contours bleu nuit #0B1B3F de même épaisseur partout.
- LE LOGO : l'icône à gauche et, à sa droite, « Neutron City » sur deux lignes, en sans-serif
  arrondie très grasse type Nunito Black : « Neutron » en bleu nuit #0B1B3F, « City » en bleu
  #1D47B8. Dessous, en petit, gris-bleu #3A4660 : « un jeu NukiTeam ».

Style : illustration vectorielle plate, formes géométriques rondes et nettes, contours bleu nuit,
couleurs vives et gaies, aucun effet 3D, aucune texture, aucune ombre portée. Fond de la planche
blanc uni, beaucoup d'air entre les propositions, format 16:9. Écris le texte exactement comme
indiqué, sans faute, sans autre texte. Numérote les propositions 1, 2, 3 sous chacune.
```

Relances utiles, une par message :
- « Garde la proposition 2. Montre seulement l'icône, en grand, carrée 1:1, sur fond blanc. »
- « Même icône, mais le bâtiment et Nuki remplissent mieux le carré : agrandis-les de 15 %. »
- « Même icône sans le fond ni les coins arrondis, seulement le bâtiment, l'orbite et Nuki, sur fond blanc uni. » (pour l'icône Android découpée en rond)
- « Même logo, version pour fond sombre : texte blanc et “City” cyan #3DD6FF, fond bleu nuit #0B1B3F. »
- « Rends Nuki plus grand, presque aussi haut que la porte, sans toucher au reste. »

## 9. Série 7 : logo « Nuki Town » (2026-11-11, remplace la série 6)

Yann veut renommer le jeu « Nuki Town » (renommage dans le jeu : lot à proposer). Images à joindre :
`assets/gemini/asset_01_reacteur.png` et `asset_03_tour_refroidissement_on.png` (style des bâtiments),
`NukiTeam - Identité/logo-officiel/png/nuki-clin-1024.png` (Nuki qui cligne de l'œil).

```
Tu es directeur artistique, spécialiste des logos de jeux vidéo pour enfants.
Crée le logo du jeu « Nuki Town » : un jeu éducatif pour les 8–12 ans où l'on pilote une petite
centrale nucléaire qui alimente une ville en électricité et en chaleur ; en suivant bien la demande
de la ville, on gagne des euros pour embellir la ville. Le jeu est créé par l'équipe NukiTeam.

Images jointes :
- images 1 et 2 : des bâtiments du jeu (réacteur, tour de refroidissement). Le dessin de la centrale
  doit être dans ce style : formes arrondies, aplats propres, ombrage doux, lumière venant d'en haut
  à gauche, béton gris clair, vitres turquoise ;
- image 3 : la mascotte « Nuki ». Reprends-la exactement : une bille ronde cyan #3DD6FF, contour
  bleu nuit épais, reflet blanc ovale en haut à gauche, halo cyan doux ; ici elle CLIGNE D'UN ŒIL
  (un œil rond, un œil fermé en arc) avec un grand sourire.

Composition du symbole :
- au centre, une centrale nucléaire stylisée et mignonne : un réacteur à dôme et une tour de
  refroidissement d'où sort un petit nuage de vapeur blanc tout rond, posés sur un socle d'herbe
  verte #2E9E5B ; vue de trois quarts, comme dans le jeu, mais simplifiée pour rester lisible
  quand le logo est petit ;
- une orbite elliptique épaisse, inclinée d'environ -25°, qui passe DERRIÈRE la centrale en haut et
  DEVANT elle en bas, avec un liseré bleu encre #1C2A4A ; elle va du jaune électricité #FFC83D
  d'un côté à l'orange chaleur #FF8A3D de l'autre ;
- sur l'orbite, à gauche : Nuki qui cligne de l'œil ;
- sur l'orbite, à droite, à l'opposé : une grosse pièce dorée #FFC83D, bord jaune foncé #7A5200,
  frappée d'un symbole euro « € » en relief.

Le nom « Nuki Town » sous le symbole (ou à sa droite), en sans-serif arrondie très grasse type
Nunito Black : « Nuki » en bleu #1D47B8, « Town » en orange #FF8A3D, avec un contour bleu encre
#1C2A4A, joyeux et bien lisible. Rien d'autre comme texte.

Palette du jeu, à respecter : bleu encre #1C2A4A, bleu #1D47B8, ciel #BFE3FF, crème #FFF6DC,
jaune électricité #FFC83D, orange chaleur #FF8A3D, vert #2E9E5B, rose tirelire #FF8FB1 en petite
touche, blanc.

Fais 3 propositions différentes sur une seule planche, côte à côte, numérotées 1, 2, 3 :
1. Symbole dans un médaillon rond bleu ciel #BFE3FF, nom en dessous en arc léger.
2. Symbole sans cadre, posé sur un petit îlot d'herbe, nom à droite sur une ligne.
3. Symbole dans un carré aux coins très arrondis (25 % du côté), fond dégradé ciel #BFE3FF vers
   bleu #1D47B8, utilisable comme icône d'application ; nom en dessous.

Style : illustration vectorielle propre, couleurs vives et gaies, contours bleu encre réguliers,
pas de texture, pas d'ombre portée sur le fond. Fond de la planche blanc uni, beaucoup d'air entre
les propositions, format 16:9, fichier PNG. Écris le texte exactement « Nuki Town », sans faute.
```

Relances utiles, une par message :
- « Garde la proposition 3. Montre-la seule, en grand, carrée 1:1, sans le nom : c'est l'icône. »
- « Même logo, mais Nuki et la pièce sont 20 % plus grands, le reste ne bouge pas. »
- « Même logo, version pour fond sombre : fond bleu encre #1C2A4A, “Nuki” en blanc. »
- « Simplifie la centrale : un seul dôme et une seule tour, moins de détails, pour qu'elle reste lisible à 48 px. »

**Résultat (2026-11-11)** : Yann a choisi une proposition et fourni la planche de ses éléments séparés, gardées dans
`assets/gemini/logo-nuki-town/` (`logo-choisi.jpg`, `elements.jpg`). Le logo a été redessiné en SVG par
`tools/branding/nuki-town.mjs` (D-27) ; c'est ce dessin vectoriel qui sert dans le jeu, pas l'image Gemini.
