/**
 * Balance report (lot L7.2, D-22): plays every day with the simulated players and writes docs/EQUILIBRAGE.md.
 * Run: npx.cmd vitest run --config tools/equilibrage/vitest.config.ts
 */
import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { BOTS, CHILD, SURPRISE_KINDS, campaign, measureDay, type BotName } from '../../packages/engine/src/index';
import { DAYS, OFFER, SHOP } from '../../packages/engine/test/content';

const SEEDS = 200;
/** The ground of the drawing (apps/game/src/play/iso/town.ts): 30 lots, and 6 more for each quarter for sale. */
const LOTS = { start: 30, perQuarter: 6, offer: OFFER };
const RANKS = ['1er', '2e', '3e'];
const pct = (x: number): string => `${Math.round(x * 100)} %`;
/** 20000 euros written as the game writes them: 20 000 €. */
const euros = (n: number): string => {
  const d = String(n);
  let out = '';
  for (let i = 0; i < d.length; i++) out += (i > 0 && (d.length - i) % 3 === 0 ? ' ' : '') + d[i];
  return `${out} €`;
};

it('writes the balance report', () => {
  const out: string[] = [
    '# Équilibrage (lot L7.2, D-22)', '',
    `Fichier écrit par \`tools/equilibrage\` (\`npx.cmd vitest run --config tools/equilibrage/vitest.config.ts\`) : ${SEEDS} parties par journée et par joueur simulé.`,
    "Ne pas modifier à la main : relancer l'outil après chaque réglage.", '',
    "Joueurs simulés (`packages/engine/src/balance.ts`) :",
    "- **parfait** : regarde un quart d'heure à l'avance et agit tout de suite sur chaque événement ;",
    "- **enfant** : regarde la demande toutes les 20 minutes, sans anticiper, règle les curseurs dessus et agit une demi-heure après le début d'un événement (imitation grossière, à vérifier avec les enfants au lot L9) ;",
    '- **sans-réparer** : suit la demande comme le joueur parfait mais ne touche jamais la ville ;',
    '- **inactif** : ne touche à rien.', '',
    'Étoiles : 3 dès 75 % du maximum, 2 dès 45 %. « Part du maximum » : euros gagnés (récompenses à part) divisés par le maximum de la journée.', '',
  ];
  out.push('## Étoiles', '', '| Joueur | Journée | 1 étoile | 2 étoiles | 3 étoiles | Part du maximum |', '|---|---|---|---|---|---|');
  const kinds: string[] = [];
  for (const name of Object.keys(BOTS) as BotName[]) {
    for (const day of DAYS) {
      const m = measureDay(day, BOTS[name], SEEDS);
      out.push(`| ${name} | ${day.id} | ${pct(m.stars[1])} | ${pct(m.stars[2])} | ${pct(m.stars[3])} | ${pct(m.ratio)} |`);
      if (name === 'parfait') kinds.push(`| ${day.id} | ${m.events.toFixed(2)} | ${SURPRISE_KINDS.filter((k) => m.kinds[k]).map((k) => `${k} ${pct(m.kinds[k]!)}`).join(', ')} |`);
    }
  }
  out.push('', '## Événements', '', '| Journée | Par jour | Part des journées où chacun arrive |', '|---|---|---|', ...kinds);
  // Lot L10.6c: the child goes on playing until the three quarters for sale are bought and all 48 lots are built on.
  const c = campaign(DAYS, SHOP, CHILD, 150, () => null, LOTS);
  out.push('', '## Argent (joueur « enfant », journées dans l\'ordre)', '',
    `Les ${SHOP.length} bâtiments du magasin tous achetés au moins une fois après **${c.complete ?? 'plus de 150'} journées**.`,
    `Les ${LOTS.start} terrains du départ pleins après la journée **${c.quarters[0]?.day ?? '— jamais'}** : l'enfant achète alors le premier quartier à vendre.`,
    `Les ${LOTS.start + LOTS.perQuarter * c.quarters.length} terrains des quartiers achetés tous bâtis après **${c.full ?? 'plus de 150'} journées**.`, '',
    '| Quartier à vendre | Prix | Acheté après la journée |', '|---|---|---|',
    ...c.quarters.map((q, i) => `| ${RANKS[i] ?? i + 1} | ${euros(q.price)} | ${q.day} |`), '',
    '| Bâtiment | Acheté après la journée |', '|---|---|', ...c.bought.map((b) => `| ${b.id} | ${b.day} |`), '');
  writeFileSync('docs/EQUILIBRAGE.md', out.join('\n'));
  console.log(out.join('\n'));
});
