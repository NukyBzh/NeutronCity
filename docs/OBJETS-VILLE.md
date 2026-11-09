# Objets de la ville et événements — synthèse (2026-11-08)

*Ce travail a été fait dans une conversation Claude (chat), en dehors des lots. Rien n'est encore branché dans le code.
Les deux fichiers JSON sont des **fichiers de conception** : ils ont été écrits sans connaître le moteur et ne suivent
pas son format (`content/*.yaml`). Pour les intégrer, il faudra d'abord prendre des décisions (§ 3), puis proposer un
lot, sans doute **L6 Boutique**.*

## 1. Ce qui a été fait
1. **Événements** : `avaries_evenements.json`, préparé par Yann avant cette conversation. Il contient 7 avaries
   (tempête, canicule, match à la télé, vague de froid, écureuil dans le transformateur, fuite de chaleur, échangeur
   entartré) et 3 bonus (nouveaux habitants, visite de classe, fête de la ville). Chaque événement a des modificateurs
   `{cible, operation, valeur}`.
2. **Objets à acheter** : 15 objets conçus selon le même schéma, puis revus du point de vue d'un enfant de 8 à 12 ans
   et de celui d'un développeur, et validés par Yann. Résultat : `objets_ville.json`.
3. **Dépôt sur Drive** : `objets_ville.json` est dans le dossier des assets
   (https://drive.google.com/drive/folders/1zQd_-mH37J1XOIxR450RZtvSLr5U2aFt) ; la taille a été vérifiée identique
   avant et après le dépôt (16 820 o).
4. **Prompts Gemini** : 23 images à générer, à partir de la trame utilisée pour les tuiles, avec PNG imposé (§ 6).

## 2. Fichiers déposés dans le dépôt (pas de commit)
| Emplacement | Contenu |
|---|---|
| `docs/OBJETS-VILLE.md` | ce document |
| `docs/conception/objets_ville.json` | les 15 objets (16 820 o, identique au fichier sur Drive) |
| `docs/conception/avaries_evenements.json` | les 10 événements (10 324 o, copie du fichier sur Drive) |

## 3. Écarts avec le moteur actuel — tranchés le 2026-11-09 (décision D-19)
*Réponses de Yann : E1, E2, E3, E6, E7 comme recommandé ; E4 phase découverte de 8 achats imposés ; E5 chaleur ouverte par
le réseau de chaleur ; E8 images Gemini dans le jeu (WebP). Détail : `docs/DECISIONS.md` D-19.*

Ces fichiers ont été conçus sans lire le dépôt. En le comparant avec `docs/DECISIONS.md` et `packages/engine`, voici
les écarts :

| # | Conception (JSON) | Jeu actuel | À décider |
|---|---|---|---|
| E1 | Gain proportionnel à la **demande brute** servie : 1 unité en zone verte = 1 pièce/min | Gain selon la **précision** (D-15) : 2 / 1 / 0 € par minute et par sortie, quel que soit le volume ; −1 €/min en cas de surproduction | Garder D-15 et convertir les effets des objets en bonus, ou passer à un gain proportionnel à la demande. Sans gain lié au volume, la boucle « acheter des bâtiments qui consomment, donc qui rapportent » ne marche pas |
| E2 | Les bâtiments **ajoutent** de la demande (+5 à +20 unités) | Demande en **% du cœur**, avec électricité + chaleur ≤ 100 % (D-01, D-16) | La ville grandit-elle plus que la centrale ? Options : centrale agrandie par paliers, ou demande exprimée en % et plafonnée |
| E3 | Prix de 30 à 150 pièces, effets sur la demande et le revenu | `content/shop/shop.yaml` : 5 objets de 1 000 à 5 000 €, qui donnent du **bonheur** (D-11) | Échelle des prix à convertir ; place du bonheur. Doublons : `parc` / `parc_arbore`, `ecole` |
| E4 | Tutoriel de 8 achats imposés, puis phase libre avec déblocage selon le nombre de bâtiments | Journées par saison (`content/days/`), boutique entre les journées | Le tutoriel se fait-il sur les premières journées ? |
| E5 | Le **réseau de chaleur** (objet 2) débloque la chaleur | La chaleur existe dès la première journée (printemps : de 6 à 28 %) | Garder une première journée sans chaleur, ou retirer cet effet |
| E6 | Journée de 4 min sur 24 h, saisons continues | Journée de 6 h à minuit, environ 5 min, une saison par journée | Recalculer les temps de retour sur investissement |
| E7 | 10 événements, ville en au moins 3 quartiers | Surprises du moteur : `peak`, `coldWave`, `mildSpell` ; quartiers à vérifier dans le moteur | Quels événements reprendre, et à quel lot |
| E8 | Prompts en **palette pastel** (trame de Yann) | D-13 : **couleurs vives**, contours foncés | Vérifier que les images Gemini restent cohérentes avec la ville dessinée |

### Intégration L6.1 (2026-11-09)
Valeurs du jeu : `content/shop/shop.yaml` (prix, bonheur, bonus par journée, effets en % du cœur). Simplifications
annoncées à Yann et acceptées avec le feu vert : batterie et cuve **lissent** la courbe (moins le soir, plus la nuit)
au lieu d'un vrai stock ; l'immunité de l'hôpital et l'effet de la maison médicale sur les avaries attendent les
événements (L7) ; **un seul exemplaire** de chaque bâtiment (pas de rachat à +15 %). Parc et école du jeu fusionnés avec
`parc_arbore` et `ecole` ; l'isolation utilise l'image du bonnet sur la cheminée.

### Intégration L6.2 (2026-11-09)
Chaque bâtiment à image a **son terrain** dans la ville (`PLOTS` dans `apps/game/src/play/iso/town.ts`), dans les rangées
visibles de la bande du jeu (i + j de 5 à 8) et dans la ville entière. Avant l'achat : **tuile d'herbe** (image Gemini
`asset_23_tuile_herbe`, enneigée en hiver), choix de Yann ; le reste de la ville garde ses immeubles dessinés. Après : la même image que la carte de la boutique, un peu plus
grande dans la ville entière ; arrivée animée et flèche jaune pour l'achat qui vient d'être fait. Le bonnet de
l'isolation se pose sur la cheminée de la maison des Lilas (achetée pendant la découverte, donc toujours là). Fontaine,
piste et lampadaires gardent leur dessin. L'ancienne école dessinée et les bancs du parc dessiné sont retirés : leurs
images les remplacent.

## 4. Les 15 objets (valeurs du JSON)
Hypothèses du JSON : 1 unité servie en zone verte = 1 pièce/min ; ville de départ = 100 unités d'électricité ;
« RSI » = minutes en zone verte pour rembourser l'objet.

| # | Objet | Catégorie | Phase / déblocage | Coût | RSI | Effet principal |
|---|---|---|---|---|---|---|
| 1 | Ferme moderne | activités | tutoriel 1 | 50 | 4 | élec +20 le jour, +6 la nuit |
| 2 | Réseau de chaleur | énergie | tutoriel 2 | 100 | 5 | active la jauge de chaleur, le curseur de partage et le bonus « double vert » |
| 3 | Maison des Lilas | logement | tutoriel 3 | 30 | 5 | élec 6 / 2 (courbe logement), chaleur 4 en hiver |
| 4 | Maison à la voiture électrique | logement | tutoriel 4 | 40 | 4 | comme la maison 3, plus +6 la nuit (recharge) |
| 5 | Épicerie | commerces et services | tutoriel 5 | 35 | 5 | élec 8 / 4 (frigos la nuit) |
| 6 | École | commerces et services | tutoriel 6 | 30 | 6 | élec 12 le jour, 0 la nuit, ×0,2 en été (vacances) |
| 7 | Usine de céréales | activités | tutoriel 7 | 120 | 6 | chaleur 15 toute l'année |
| 8 | Maison médicale | commerces et services | tutoriel 8 | 50 | 10 | événements négatifs ×0,8 |
| 9 | Batterie de quartier | énergie | libre, dès 8 bâtiments | 150 | 15 | stock de 20, puissance 10 ; revenu +10 |
| 10 | Parc arboré | nature et décor | libre, dès 8 | 60 | 15 | élec ×0,95 en été ; revenu +4 |
| 11 | Piscine municipale | loisirs | libre, dès 10 | 90 | 6 | chaleur 10 toute l'année |
| 12 | Isolation des maisons | énergie | libre, dès 12 | 100 | 17 | chaleur des logements ×0,75 en hiver ; revenu +6 |
| 13 | Panneaux solaires | énergie | libre, dès 12 | 80 | 18 | production locale de 10 le jour (×0,4 en hiver) ; revenu +12 le jour |
| 14 | Hôpital | commerces et services | libre, dès 14 | 150 | 7 | élec 15 jour et nuit ; jamais dans le noir (groupe de secours) |
| 15 | Cuve de chaleur | énergie | libre, dès 16 | 120 | 20 | stock de chaleur 30 ; revenu +6 |

## 5. Règles de conception retenues
- **Règle clé :** le gain se calcule sur la demande brute de la ville, sinon les objets d'aide (solaire, isolation)
  font perdre de l'argent et aucun enfant ne les achète.
- Les objets d'aide ont un revenu fixe affiché « +X » au-dessus du bâtiment, pour qu'ils aient un bénéfice visible.
- Dans le tutoriel, chaque objet est remboursé en 6 min au plus.
- Un seul format de consommation : `{cible, operation: add, valeur, profil: {jour, nuit, ete, hiver}}` ; le
  printemps et l'automne prennent la moyenne de l'été et de l'hiver ; les logements suivent la courbe « logement ».
- Seulement 3 nouvelles mécaniques : un stock (batterie et cuve), une immunité à la coupure (hôpital) et un poids des
  avaries (maison médicale).
- Liens avec les avaries : la canicule n'apparaît qu'avec la batterie (sa solution l'utilise) ; la vague de froid, la
  fuite de chaleur et l'échangeur entartré n'apparaissent qu'après l'achat du réseau de chaleur.
- Le lien entre la maison médicale et les pannes reste faible. Si un lien plus logique est souhaité, un « atelier de
  maintenance » qui raccourcit les avaries pourrait la remplacer.
- Les objets 3 à 7 se rachètent, avec un prix qui augmente de 15 % à chaque achat ; les objets d'aide sont limités à
  1 par quartier.

## 6. Images à générer avec Gemini (23 prompts)
- **Images existantes réutilisées :** `asset_13_usine_1`, `asset_14_hopital`, `asset_10_diesel_secours`,
  `asset_19_arbre`.
- **Numérotation :** elle suit les assets existants (01 à 24) et commence donc à 25. Il faudra mettre à jour les
  identifiants `visuel` du JSON (noms courts) ou renommer les fichiers.
- **Fond :** vert #00FF00, sauf pour les 5 objets qui contiennent beaucoup de vert (ferme, maison médicale, parc,
  serre, croix verte), qui ont un fond magenta.
- **Gemini et le format :** il a déjà livré du JPG malgré la demande. Vérifier l'extension, puis détourer avec
  `tools/detourage/detoure.py`.
- **Effets à faire en code** plutôt qu'en images (9) : vapeur, buée, fumée de démarrage, reflets de soleil, éclair de
  recharge, jauge de charge, flèches d'énergie, thermomètre de la cuve, bouffées de vapeur du réseau.
- **Variantes jour / nuit / coupure**, comme pour l'immeuble : ajouter à la fin du prompt « Même objet, même cadrage,
  de nuit, fenêtres éclairées en jaune chaud » (ou « fenêtres éteintes »).
- **Ambulance :** elle est demandée sans croix rouge, parce que cet emblème est protégé.
- Joindre `docs/gemini/reference-style-ville.jpg` comme image de référence à chaque génération.

### Bâtiments (11)

**asset_25_ferme_moderne.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une ferme moderne, grange rouge à toit gris, silo à grains gris, petite parcelle de blé doré devant. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_26_maison_lilas.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une maison individuelle à un étage, façade mauve lilas, toit de tuiles orange, cheminée en brique, porte jaune, de jour. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_27_maison_voiture_electrique.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une maison individuelle bleu ciel, toit gris ardoise, cheminée, petite allée avec une voiture électrique blanche branchée par un câble à une borne murale. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_28_epicerie.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une petite épicerie de quartier, auvent rayé rouge et blanc, caisses de fruits devant la vitrine, frigo vitré lumineux visible à l'intérieur. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_29_ecole.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une école primaire, bâtiment jaune à toit rouge, horloge ronde sans chiffres, cour vide avec un préau. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_30_maison_medicale.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un petit bâtiment médical blanc et bleu clair, grande porte vitrée, croix verte sur la façade, rampe d'accès. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_31_batterie_quartier.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un grand conteneur de batterie gris neutre avec bandes bleues, grilles d'aération, posé sur une dalle de béton. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_32_parc_arbore.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un petit parc carré de la taille d'une tuile, pelouse, trois arbres ronds, allée beige, banc en bois, petite fontaine. Métaux en gris neutre. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 90 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_33_piscine.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une piscine municipale extérieure, bassin turquoise, plongeoir, carrelage blanc, petit bâtiment de vestiaires orange. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_34_cuve_chaleur.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une grande cuve cylindrique verticale orange-rouge, escalier hélicoïdal, deux gros tuyaux rouges à la base. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_35_panneaux_solaires_toit.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une rangée de quatre panneaux solaires bleu foncé sur support incliné, seuls, sans maison, à poser sur un toit. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

### Petits objets et personnages (9)

**asset_36_serre_allumee.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une serre en verre à structure grise, rangées de plantes vertes, éclairage intérieur blanc-jaune lumineux. Sans sol ni socle sous l'objet. Métaux en gris neutre. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_37_tracteur_electrique.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un petit tracteur moderne bleu, sans pot d'échappement, grandes roues noires, cabine vitrée. Sans sol sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_38_tranchee_tuyaux.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine une seule tuile de route isométrique en losange (deux fois plus large que haute), route beige comme dans l'image, ouverte par une tranchée au centre, avec deux tuyaux rouges isolés au fond et trois plots de chantier orange. Épaisseur de socle visible sur les deux faces avant. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 90 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_39_tuyau_chaleur.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un segment droit de tuyau calorifugé rouge sur deux petits supports, aligné sur l'axe isométrique, traversant l'image d'un coin à l'autre, extrémités coupées net pour pouvoir se raccorder. Sans sol sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 90 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_40_tapis_sacs.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un court tapis roulant portant trois sacs de céréales beige ficelés. Sans sol sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_41_ambulance.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une ambulance blanche avec bandes bleues et gyrophare bleu, sans croix ni inscription. Sans sol sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_42_enfants_cour.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul petit groupe : quatre enfants stylisés qui jouent au ballon, vêtements de couleurs variées sans vert, à l'échelle des personnages de l'image. Sans sol sous les personnages. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_43_balancoire.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un portique de balançoire avec deux sièges rouges suspendus, sur un petit carré de sable beige. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_44_oiseaux.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul petit groupe : trois oiseaux en vol, ailes ouvertes, bleus et jaunes. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 50 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

### Icônes et décor (3)

**asset_45_panneau_vacances.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un panneau en bois sur un piquet, avec le dessin d'un soleil jaune et d'un parasol rouge et blanc. Sans sol sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 50 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_46_bonnet_laine_cheminee.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un bonnet de laine rouge et blanc à pompon, coiffant le haut d'une petite cheminée en brique. Sans sol sous l'objet. Métaux en gris neutre. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 50 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_47_croix_verte.png**

```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une enseigne lumineuse en forme de croix verte, vue en isométrique, fixée par un petit support. Métaux en gris neutre. Fond uni magenta #FF00FF. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 50 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

## 7. Suite proposée
1. Trancher les écarts E1 à E8 (nouvelles décisions D-xx).
2. Proposer le lot L6 Boutique sur cette base : conversion des objets au format `content/shop/shop.yaml` étendu, tests du moteur, puis contrôle visuel.
3. Générer les 23 images, les détourer, puis ajouter les lignes correspondantes dans `docs/GEMINI.md` (inventaire).
