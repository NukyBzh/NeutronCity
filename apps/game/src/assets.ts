/** Image URLs of the shared assets folder (icons and shop drawings: own SVG, Cassandra: PNG from the NPP project). */
const icons = import.meta.glob<string>('../../../assets/icons/*.svg', { eager: true, query: '?url', import: 'default' });
const shop = import.meta.glob<string>('../../../assets/shop/*.svg', { eager: true, query: '?url', import: 'default' });
/** Buildings of the shop (lot L6): Gemini images reduced to WebP (assets/SOURCES.md); the older ones keep their SVG. */
const objets = import.meta.glob<string>('../../../assets/objets/*.webp', { eager: true, query: '?url', import: 'default' });
/** The town (lot L6.3): Gemini pictures reduced to WebP (assets/SOURCES.md). */
const ville = import.meta.glob<string>('../../../assets/ville/*.webp', { eager: true, query: '?url', import: 'default' });
const poses = import.meta.glob<string>('../../../assets/cassandra/cassandra-*.png', { eager: true, query: '?url', import: 'default' });

const byName = (files: Record<string, string>, prefix = ''): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.\w+$/, '').replace(prefix, ''), url]));

const ICONS = byName(icons);
const SHOP = byName(shop);
const OBJETS = byName(objets);
const VILLE = byName(ville);
const POSES = byName(poses, 'cassandra-');

export type Pose = 'accueil' | 'explique' | 'attention' | 'bravo' | 'reflechit';

export const iconUrl = (name: string): string => ICONS[name] ?? '';
export const shopUrl = (name: string): string => OBJETS[name] ?? SHOP[name] ?? '';
/** A picture of the town or of a shop building. */
export const townUrl = (name: string): string => VILLE[name] ?? OBJETS[name] ?? '';
export const poseUrl = (pose: Pose): string => POSES[pose] ?? '';
/** Background of the home screen (Yann's picture « Image_d_accueil_1 », reduced to WebP, 2026-11-11). */
export const HOME_BACKGROUND: string = (Object.values(import.meta.glob<string>('../../../assets/fond-accueil.webp', { eager: true, query: '?url', import: 'default' }))[0]) ?? '';
