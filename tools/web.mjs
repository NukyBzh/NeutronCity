// Web version for Netlify (lots L9.1 and L9.2d, D-26): builds the game and prepares one complete upload, so that a new
// version never removes the testers' APK nor publishes the raw repository (docs/iphone.md §2).
//   livrables/web-<version>/site/          game + Nuki-Town-<version>.apk + _headers (APK served as a download)
//   livrables/web-<version>/netlify.toml   for a deploy from this folder (Claude, Netlify CLI): publishes site/ as is
//   livrables/Nuki-Town-web-<version>.zip  the content of site/, to drop on Netlify (Deploys → drag and drop)
// The APK comes from `npm.cmd run android` (livrables/Nuki-Town-<version>.apk); without it, the script stops.
// Uses the tar of Windows (zip format), nothing to install.
import { execFileSync, execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const livrables = join(root, 'livrables');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const apkName = `Nuki-Town-${version}.apk`;
const apk = join(livrables, apkName);
if (!existsSync(apk)) {
  console.error(`Missing ${apk}: run npm.cmd run android first (the site serves the APK to the Android testers).`);
  process.exit(1);
}

execSync('npm.cmd run build', { cwd: root, stdio: 'inherit' });
const dist = join(root, 'apps', 'game', 'dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error(`No index.html in ${dist}`);

const folder = join(livrables, `web-${version}`);
const site = join(folder, 'site');
rmSync(folder, { recursive: true, force: true });
cpSync(dist, site, { recursive: true });
cpSync(apk, join(site, apkName));
// _headers is read by Netlify for drag and drop and for deploys alike.
writeFileSync(join(site, '_headers'), [
  '/*.apk',
  '  Content-Type: application/vnd.android.package-archive',
  '  Content-Disposition: attachment',
  '',
].join('\n'));
writeFileSync(join(folder, 'netlify.toml'), [
  '# Deploy of this folder only (tools/web.mjs): the game is already built, Netlify publishes site/ as is.',
  '[build]',
  '  publish = "site"',
  '  command = ""',
  '',
].join('\n'));

const out = join(livrables, `Nuki-Town-web-${version}.zip`);
if (existsSync(out)) rmSync(out);
const tar = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe');
execFileSync(tar, ['-a', '-c', '-f', out, '-C', site, '.'], { stdio: 'inherit' });
console.log(`Web folder: ${folder}`);
console.log(`Web zip: ${out} (${(statSync(out).size / 1e6).toFixed(1)} MB, with ${apkName})`);
