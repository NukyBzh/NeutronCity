// Web version for Netlify (lot L9.1, D-26): builds the game and puts apps/game/dist in livrables/Neutron-City-web-<version>.zip,
// ready to drop on https://app.netlify.com/drop (docs/iphone.md §2). Uses the tar of Windows (zip format), nothing to install.
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
execSync('npm.cmd run build', { cwd: root, stdio: 'inherit' });
const dist = join(root, 'apps', 'game', 'dist');
const out = join(root, 'livrables', `Neutron-City-web-${version}.zip`);
mkdirSync(join(root, 'livrables'), { recursive: true });
if (existsSync(out)) rmSync(out);
const tar = join(process.env.SystemRoot ?? 'C:\Windows', 'System32', 'tar.exe');
execFileSync(tar, ['-a', '-c', '-f', out, '-C', dist, '.'], { stdio: 'inherit' });
console.log(`Web: ${out} (${(statSync(out).size / 1e6).toFixed(1)} MB)`);
