/** Image URLs of the shared assets folder (icons and shop drawings: own SVG, Cassandra: PNG from the NPP project). */
const icons = import.meta.glob<string>('../../../assets/icons/*.svg', { eager: true, query: '?url', import: 'default' });
const shop = import.meta.glob<string>('../../../assets/shop/*.svg', { eager: true, query: '?url', import: 'default' });
/** Buildings of the shop (lot L6): Gemini images reduced to WebP (assets/SOURCES.md); the older ones keep their SVG. */
const objets = import.meta.glob<string>('../../../assets/objets/*.webp', { eager: true, query: '?url', import: 'default' });
const poses = import.meta.glob<string>('../../../assets/cassandra/cassandra-*.png', { eager: true, query: '?url', import: 'default' });

const byName = (files: Record<string, string>, prefix = ''): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.\w+$/, '').replace(prefix, ''), url]));

const ICONS = byName(icons);
const SHOP = byName(shop);
const OBJETS = byName(objets);
const POSES = byName(poses, 'cassandra-');

export type Pose = 'accueil' | 'explique' | 'attention' | 'bravo' | 'reflechit';

export const iconUrl = (name: string): string => ICONS[name] ?? '';
export const shopUrl = (name: string): string => OBJETS[name] ?? SHOP[name] ?? '';
export const poseUrl = (pose: Pose): string => POSES[pose] ?? '';
