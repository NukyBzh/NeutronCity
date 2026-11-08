# Contenu du jeu

Tout le contenu est en YAML, validé par schéma au démarrage et par test. Aucun texte en dur dans le code.

| Dossier | Contenu | Lot |
|---|---|---|
| `i18n/` | textes de l'interface, un fichier par langue (`fr.yaml` ; `en.yaml` plus tard) | L0 |
| `days/` | journées : `[heure, électricité %, chaleur %]`, `format`, `balance` (`docs/CADRAGE.md` §3) | L2, L7 |
| `dialogues/` | répliques de Cassandra : identifiant (futur nom du fichier de voix), pose, texte | L5 |
| `shop/` | améliorations de la ville : prix, bonheur, emplacement | L6 |
| `city/` | éléments de la ville : bâtiments, emplacements, habitants, véhicules | L4 |
