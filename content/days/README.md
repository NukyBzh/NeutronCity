# Journées

Une journée se joue **de 6 h à minuit** (≈ 5 min). Format 1 (`packages/engine/src/day.ts`, `validateDay`) :

| Champ | Sens |
|---|---|
| `id` | nom du fichier sans `.yaml` ; textes `day.<id>.title` et `day.<id>.level` dans `content/i18n/fr.yaml` |
| `format` | `1` |
| `balance` | `balanced` : la demande reste toujours possible à suivre (seul cas en V1 ; `unbalanced` prévu plus tard) |
| `level` | 1 facile, 2 moyen, 3 difficile ; ordre d'ouverture des journées |
| `rampPctPerHour` | vitesse de la centrale, % du cœur par heure de jeu (10 par défaut, D-05) |
| `points` | demande de la ville `[heure, électricité %, chaleur %]`, en % du cœur (électricité : % de 100 MWe ; chaleur : % de 300 MWth ; D-01 : électricité + chaleur ≤ 100), interpolée entre les points, de 0 h à 24 h |
| `surprises` | surprises possibles (`peak`, `coldWave`, `mildSpell`) ; deux sont tirées d'une graine à chaque partie |
| `lines` | répliques de Cassandra à heure fixe : `hour`, `say` (identifiant dans `content/dialogues/fr.yaml`), `pose` |

Règle des journées équilibrées (vérifiée par `packages/engine/test/days.test.ts` avec 1 000 graines) : pente de la
courbe ≤ 4,5 %/h, surprises comprises ≤ 8 %/h (la centrale suit à 10 %/h), électricité + chaleur ≤ 100 % à toute
heure. Formes inspirées des courbes de consommation françaises (pic du matin, pic du soir), valeurs propres au jeu.
