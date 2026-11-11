# Nuki Town

*Anciennement « Neutron City ». Un jeu de l'équipe NukiTeam.*

Jeu éducatif pour les 8–12 ans : tu pilotes une centrale imaginaire qui fournit électricité et chaleur à ta ville ;
plus tu suis la demande, plus tu gagnes d'euros du jeu pour embellir la ville. Cassandra, ingénieure de la centrale,
t'accompagne. Tablette Android et PC Windows, hors ligne, sans compte.

**Pour commencer : `docs/STATUS.md`.** Cadrage : `docs/CADRAGE.md` ; décisions : `docs/DECISIONS.md` ; gestion de
configuration : `docs/CONFIGURATION.md` ; changements : `CHANGELOG.md`.

## Commandes (racine du dépôt, PowerShell : `npm.cmd`)
- `npm.cmd install` — dépendances
- `npm.cmd run dev` — jeu dans le navigateur, http://localhost:5180
- `npm.cmd test` — tests (Vitest)
- `npm.cmd run typecheck` — vérification TypeScript
- `npm.cmd run build` — version web (`apps/game/dist`)

## Organisation
- `packages/engine` — moteur : fonctions pures, déterministes, sans DOM ni horloge ni `Math.random()`
- `apps/game` — interface React (ville PixiJS à partir du lot L4)
- `content/` — contenu YAML (textes, journées, répliques, boutique, ville)
- `assets/` — images exportées de Figma, origine dans `assets/SOURCES.md`
- `docs/` — cadrage, décisions, statut, configuration
