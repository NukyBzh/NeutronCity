# Images Gemini des retours R2 (lots L10.4, L10.5 et L10.6)

*Prompts écrits le 2026-11-16 pour les retours R2-05 (habitants qui entrent dans les bâtiments) et R2-06 (nouveaux
bâtiments), le 2026-11-21 pour R2-01 (événements visibles, § 3). Fichier à part de `docs/GEMINI.md`, qu'une autre
session modifiait à ce moment-là ; à fusionner dans `docs/GEMINI.md` quand celle-ci aura fini.*

**Livrées par Yann les 2026-11-20 et 2026-11-21** dans `assets/Jeu centrale – assets/` : les 17 images, 68 à 84 (JPG
nommés `*.png.jpg`, sauf `asset_73_habitant_enfant_face_pas2.png.jpeg`). Pas encore détourées ni intégrées.

Conseils donnés à Yann : joindre `docs/gemini/reference-style-ville.jpg` à chaque prompt (et l'image d'origine du
personnage pour 68 à 74) ; générer les images d'un même personnage ou d'une même paire de couleurs dans la même
conversation. Habitants sur fond **vert** #00FF00 ; bâtiments sur fond **magenta** #FF00FF (leur socle d'herbe serait
confondu avec un fond vert au détourage).

## 1. Habitants : vues de dos et 2e pas (R2-05, lot L10.5)

Analyse : les habitants actuels n'ont qu'une vue de trois quarts avant (ils marchent vers le bas à gauche ; en miroir
vers le bas à droite). Entrer dans un bâtiment, c'est marcher vers le haut, donc **de dos** (vers le haut à gauche ;
en miroir vers le haut à droite). Le **2e pas** (l'autre jambe en avant), alterné avec le 1er, anime la marche.

| Image | Rôle | Joindre en 2e image |
|---|---|---|
| 68 adulte de dos | indispensable | `asset_53_habitant_adulte` |
| 69 enfant de dos | indispensable | `asset_54_habitant_enfant` |
| 70 famille de dos | indispensable | `asset_55_habitants_famille` |
| 71 adulte de face, 2e pas | recommandé | `asset_53` |
| 72 adulte de dos, 2e pas | recommandé | image 68 |
| 73 enfant de face, 2e pas | recommandé | `asset_54` |
| 74 enfant de dos, 2e pas | recommandé | image 69 |
| 75 dame âgée de face | facultatif | — |
| 76 dame âgée de dos | facultatif | image 75 |

**asset_68_habitant_adulte_dos.png**
```
Dans exactement le même style que la première image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : exactement le même adulte que la deuxième image jointe (pull vert, pantalon gris, petit sac), mais vu de trois quarts arrière, de dos, marchant en s'éloignant vers le haut à gauche de l'image. Même taille, mêmes proportions, mêmes couleurs. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_69_habitant_enfant_dos.png**
```
Dans exactement le même style que la première image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : exactement le même enfant que la deuxième image jointe (t-shirt orange, short bleu, casquette), mais vu de trois quarts arrière, de dos, marchant en s'éloignant vers le haut à gauche de l'image. Même taille, mêmes proportions, mêmes couleurs. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_70_habitants_famille_dos.png**
```
Dans exactement le même style que la première image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : exactement la même famille que la deuxième image jointe (deux adultes et un enfant, mêmes vêtements, mêmes couleurs), mais vue de trois quarts arrière, de dos, marchant ensemble en s'éloignant vers le haut à gauche de l'image, l'enfant tenant la main d'un adulte. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 75 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_71_habitant_adulte_face_pas2.png**
```
Dans exactement le même style que la première image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : exactement le même adulte que la deuxième image jointe, même vue de trois quarts avant, même direction de marche, mais au pas suivant de la marche : l'autre jambe en avant et l'autre bras en avant. Même taille, mêmes proportions, mêmes couleurs, même cadrage. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_72_habitant_adulte_dos_pas2.png**
```
Dans exactement le même style que la première image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : exactement le même adulte de dos que la deuxième image jointe, même vue de trois quarts arrière, même direction, mais au pas suivant de la marche : l'autre jambe en avant et l'autre bras en avant. Même taille, mêmes proportions, mêmes couleurs, même cadrage. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_73_habitant_enfant_face_pas2.png**
```
Dans exactement le même style que la première image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : exactement le même enfant que la deuxième image jointe, même vue de trois quarts avant, même direction de marche, mais au pas suivant de la marche : l'autre jambe en avant et l'autre bras en avant. Même taille, mêmes proportions, mêmes couleurs, même cadrage. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_74_habitant_enfant_dos_pas2.png**
```
Dans exactement le même style que la première image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : exactement le même enfant de dos que la deuxième image jointe, même vue de trois quarts arrière, même direction, mais au pas suivant de la marche : l'autre jambe en avant et l'autre bras en avant. Même taille, mêmes proportions, mêmes couleurs, même cadrage. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 60 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_75_habitante_agee_face.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une dame âgée souriante qui marche, vue de trois quarts avant, marchant vers le bas à gauche de l'image, cheveux blancs en chignon, gilet violet, jupe bleue, un sac de courses avec des légumes à la main. Silhouette simple. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_76_habitante_agee_dos.png**
```
Dans exactement le même style que la première image jointe, dessine un seul objet : exactement la même dame âgée que la deuxième image jointe (mêmes vêtements, même sac de courses), mais vue de trois quarts arrière, de dos, marchant en s'éloignant vers le haut à gauche de l'image. Même taille, mêmes proportions, mêmes couleurs. Sans sol ni socle sous l'objet. Fond uni vert #00FF00. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

## 2. Nouveaux bâtiments de la boutique (R2-06, lot L10.6)

Petite maison et immeuble s'achètent plusieurs fois : deux couleurs chacun, alternées par le jeu. La boulangerie de la
boutique (83) doit se distinguer de celle du décor (`asset_61`), qui sera retirée du décor.

**asset_77_maison_bleue.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un seul objet : une petite maison individuelle d'un étage, murs bleu clair, toit en tuiles gris ardoise, porte d'entrée blanche avec un petit perron, deux fenêtres à volets blancs, une cheminée, une boîte aux lettres et un petit massif de fleurs devant. Posée sur un socle d'herbe en losange avec une allée en pavés jusqu'à la porte. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_78_maison_jaune.png**
```
Dans exactement le même style que la première image jointe, dessine un seul objet : la même petite maison que la deuxième image jointe, même forme et même taille, mais avec des murs jaune pâle, un toit en tuiles rouge orangé, des volets vert sapin et une porte bleue. Posée sur le même socle d'herbe en losange avec son allée. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_79_immeuble_neuf_vert.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un seul objet : un immeuble d'habitation neuf de 5 étages, façade crème avec des balcons vert tilleul, grandes fenêtres, quelques plantes sur les balcons, toit plat végétalisé, porte d'entrée vitrée au rez-de-chaussée. Posé sur un socle de trottoir gris très clair en losange avec deux petits arbres. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_80_immeuble_neuf_corail.png**
```
Dans exactement le même style que la première image jointe, dessine un seul objet : le même immeuble que la deuxième image jointe, même forme et même taille, mais avec une façade blanche et des balcons corail, des stores jaunes à certaines fenêtres. Posé sur le même socle de trottoir avec ses deux petits arbres. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_81_mairie.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un seul objet : la mairie d'une petite ville, bâtiment classique de deux étages en pierre beige clair, toit en ardoise bleu-gris, un petit clocher au centre avec une horloge sans chiffres, un drapeau bleu, blanc, rouge au-dessus de l'entrée, un large escalier de trois marches et des colonnes blanches devant la porte, deux bacs à fleurs. Posé sur une petite place pavée en losange. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_82_hotel.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un seul objet : un hôtel accueillant de 4 étages, façade bleu marine et blanc, balcons avec des jardinières fleuries, une grande marquise rouge au-dessus de la porte tournante vitrée, une enseigne avec un pictogramme de lit et une étoile mais sans lettres, deux petits palmiers en pot de chaque côté de l'entrée, un tapis rouge. Posé sur un socle de trottoir gris très clair en losange. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_83_boulangerie_patisserie.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un seul objet : une boulangerie-pâtisserie de quartier d'un étage, façade rose framboise, grand store rayé rose et blanc, vitrine pleine de baguettes, croissants et gâteaux, une enseigne en forme de croissant doré sans lettres, une petite cheminée de four à pain qui fume légèrement, deux tables de terrasse avec des chaises devant. Posée sur un socle de trottoir gris très clair en losange. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 75 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_84_caserne_pompiers.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel, vitres turquoise), dessine un seul objet : une caserne de pompiers de petite ville, bâtiment de deux étages en briques rouges avec des bandes blanches, deux grandes portes de garage ouvertes dont une laisse voir le nez d'un camion de pompiers rouge, une petite tour de séchage des tuyaux sur le côté, un gyrophare sur le toit, un logo de flamme dans un écusson sans lettres. Posé sur un socle de béton gris clair en losange. Métaux en gris neutre. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

## 3. Événements visibles (R2-01, lot L10.4)

Prompts écrits le 2026-11-21. **Joindre `docs/gemini/reference-style-ville.jpg` à chaque prompt** (et l'image 88 en
deuxième image pour le 89). Fond **vert** #00FF00 quand l'objet n'a aucune partie verte (habitants, écureuil, ouvrier) ;
fond **magenta** #FF00FF pour les autres. Chaque prompt dit à Gemini de ne mettre aucune couleur identique au fond dans
l'objet : le détourage l'enlèverait aussi.

| Image | Rôle dans le jeu | Fond |
|---|---|---|
| 85 guirlandes | fête : tendues au-dessus de la place | magenta |
| 86 foule en fête | fête : habitants rassemblés sur la place | vert |
| 87 feux d'artifice | fête : gerbes dans le ciel, le soir | magenta |
| 88 écureuil | écureuil : assis sur le pylône du quartier coupé | vert |
| 89 écureuil en gros | écureuil : dans la loupe ronde, en bas à droite | vert |
| 90 cadre de givre | vague de froid : pourtour de l'écran | magenta |
| 91 ouvrier sur un tuyau | calorifugeage : après la vanne fermée (fuite) | vert |
| 92 éclair | tempête : un éclair qui descend du ciel | magenta |
| 93 nuages de tempête | tempête : nuages sombres au-dessus de la ville | magenta |

Faits **en code, sans image** : pluie, air qui ondule (canicule), filtres de couleur (canicule, vague de froid), soleil
qui perce et neige qui fond (redoux), fenêtres qui s'allument d'un coup (pic de demande), « ZzZ » (déjà fait en v0.14.0).

**Après le lot L10.4 (2026-11-21), seules 4 images restent à générer : 85, 86, 88 et 91** (et 89 si tu veux la loupe).
Le cadre de givre (90), l'éclair (92) et les nuages de tempête (93) sont finalement dessinés en code : c'est net à
toutes les tailles et ça ne coûte rien en fluidité ; leurs prompts restent ci-dessous au cas où tu préfères les images.
Les gerbes de feu d'artifice (87) sont dessinées en code en attendant l'image, qui sera plus jolie.

**asset_85_guirlandes_fete.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une guirlande de fête tendue en arc léger d'un bord de l'image à l'autre, une douzaine de petits fanions triangulaires en tissu jaune d'or, rouge, bleu ciel et blanc accrochés à une cordelette beige, et entre les fanions quelques petites ampoules rondes blanches allumées. Vue de face, comme tendue entre deux maisons. Aucune partie magenta ni rose dans l'objet. Sans sol ni socle sous l'objet. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 95 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_86_foule_fete.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un groupe de douze habitants serrés en demi-cercle, vus de trois quarts avant, qui font la fête : bras levés, deux qui applaudissent, deux qui lèvent un verre, un enfant assis sur les épaules d'un adulte. Silhouettes simples, mêmes proportions que les habitants de l'image jointe. Vêtements jaune, rouge, bleu, orange, violet et blanc ; aucun vêtement vert et aucune partie verte dans l'objet. Sans sol ni socle sous l'objet. Fond uni vert #00FF00, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 85 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_87_feux_artifice.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : une gerbe de feu d'artifice qui vient d'exploser, en étoile : des traînées lumineuses droites qui partent du centre, jaune d'or et blanches, avec quelques pointes bleu ciel et rouges, et de petites étincelles rondes au bout des traînées. Dessinée en aplats propres, sans dégradé flou, sans fumée. Aucune partie magenta ni rose dans l'objet. Sans sol ni socle sous l'objet. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 85 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_88_ecureuil.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un petit écureuil roux assis sur ses pattes arrière, vu de trois quarts avant, grosse queue touffue relevée derrière lui, oreilles pointues, qui tient une noisette entre ses pattes avant, l'air malicieux. Silhouette simple et gentille, pour un enfant de 8 ans. Aucune partie verte dans l'objet. Sans sol ni socle sous l'objet. Fond uni vert #00FF00, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 70 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_89_ecureuil_gros.png**
```
Dans exactement le même style que la première image jointe, dessine un seul objet : exactement le même écureuil que la deuxième image jointe (mêmes couleurs, même queue, même noisette), mais en gros plan, vu de plus près et de face trois quarts, la tête tournée vers le spectateur. Mêmes proportions, mêmes couleurs, tout l'animal dans l'image jusqu'au bas des pattes. Aucune partie verte dans l'objet. Sans sol ni socle sous l'objet. Fond uni vert #00FF00, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 85 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_90_cadre_givre.png**
```
Dans exactement le même style que l'image jointe (aplats propres, ombrage doux, palette pastel), dessine un cadre de givre sur le pourtour d'une image carrée : une bordure de cristaux de glace et de petites fougères de givre, blanches et bleu très clair, qui mord sur les quatre bords, épaisse d'environ 18 % du côté dans les quatre angles et plus fine au milieu de chaque côté, les pointes tournées vers l'intérieur. Le centre de l'image est entièrement vide : du fond et rien d'autre. Aucune partie magenta ni rose dans le givre. Fond uni magenta #FF00FF partout, y compris au centre et entre les cristaux, sans décor ni ombre portée. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), le cadre touche les quatre bords de l'image. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_91_ouvrier_tuyau.png**
```
Dans exactement le même style que l'image jointe (illustration vectorielle isométrique 2:1, aplats propres, ombrage doux, lumière haut-gauche, palette pastel), dessine un seul objet : un ouvrier agenouillé à côté d'un gros tuyau de chauffage gris clair posé sur deux supports bas, casque jaune, gilet orange vif, pantalon bleu, gants blancs, qui enroule des deux mains un manchon d'isolant beige autour du tuyau ; une petite caisse à outils rouge posée près de lui. Vu de trois quarts avant. Aucune partie verte dans l'objet. Sans sol ni socle sous l'objet. Fond uni vert #00FF00, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 80 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_92_eclair.png**
```
Dans exactement le même style que l'image jointe (aplats propres, palette pastel), dessine un seul objet : un éclair de foudre en zigzag qui descend du haut de l'image vers le bas en trois coudes nets, large en haut et pointu en bas, blanc au cœur et bordé de jaune pâle, avec deux petites ramifications sur le côté. Aplats propres, sans dégradé flou, sans nuage. Aucune partie magenta ni rose dans l'objet. Sans sol ni socle sous l'objet. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 90 % de la hauteur. Aucun texte, aucune lettre, aucun chiffre.
```

**asset_93_nuages_tempete.png**
```
Dans exactement le même style que l'image jointe (aplats propres, ombrage doux, palette pastel), dessine un seul objet : un amas de nuages d'orage, trois gros nuages ronds collés les uns aux autres, gris ardoise foncé sur le dessus et gris-bleu plus clair en dessous, bords arrondis nets en aplats, le bas du nuage bien horizontal. Sans pluie, sans éclair, sans dégradé flou. Aucune partie magenta ni rose dans l'objet. Sans sol ni socle sous l'objet. Fond uni magenta #FF00FF, sans décor ni ombre portée sur le fond. Format PNG carré 1024x1024, fichier .png obligatoire (pas de JPG), objet centré sur 95 % de la largeur. Aucun texte, aucune lettre, aucun chiffre.
```
