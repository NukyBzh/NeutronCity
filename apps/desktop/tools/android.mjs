// Builds the tablet APK of Neutron City (Galaxy Tab A9+): optimised (release) build for 64-bit ARM, signed with the
// standard Android *debug* key (~/.android/debug.keystore, public password "android"): installable by hand for
// tests. The owner's own release key comes with lot L8. Same chain as the NPP project (apps/desktop/tools there).
// Usage (from the repo root): npm.cmd run android [-- <output folder>]  →  livrables/Neutron-City-<version>.apk
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const desktop = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(desktop, '../..');
const { version } = JSON.parse(readFileSync(join(desktop, 'package.json'), 'utf8'));
// Through the shell on Windows (npx and .bat need it), so every argument is quoted (the repo path has spaces).
const quote = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const run = (cmd, args, opts = {}) => {
  const win = process.platform === 'win32';
  const r = spawnSync(win ? quote(cmd) : cmd, win ? args.map(quote) : args, { stdio: 'inherit', shell: win, ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// 1. Build (release, arm64). The game's web build runs first (beforeBuildCommand in tauri.conf.json).
run('npx', ['tauri', 'android', 'build', '--apk', '--target', 'aarch64'], { cwd: desktop });

// 2. Newest unsigned release APK produced by Gradle.
const root = join(desktop, 'src-tauri/gen/android/app/build/outputs/apk');
const apks = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) walk(p);
  else if (f.endsWith('-release-unsigned.apk')) apks.push(p);
});
if (existsSync(root)) walk(root);
const unsigned = apks.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
if (!unsigned) { console.error('No unsigned release APK under', root); process.exit(1); }

// 3. Align and sign with the debug key.
const sdk = process.env.ANDROID_HOME;
const bt = join(sdk, 'build-tools', readdirSync(join(sdk, 'build-tools')).sort().pop());
const outDir = process.argv[2] || join(repo, 'livrables');
const out = join(outDir, `Neutron-City-${version}.apk`);
const aligned = out.replace('.apk', '-aligned.apk');
mkdirSync(dirname(out), { recursive: true });
run(join(bt, 'zipalign.exe'), ['-p', '-f', '4', unsigned, aligned]);
run(join(bt, 'apksigner.bat'), ['sign', '--ks', join(homedir(), '.android', 'debug.keystore'), '--ks-key-alias', 'androiddebugkey',
  '--ks-pass', 'pass:android', '--key-pass', 'pass:android', '--out', out, aligned]);
rmSync(aligned, { force: true });
rmSync(out + '.idsig', { force: true });
run(join(bt, 'apksigner.bat'), ['verify', out]);
console.log(`\nAPK: ${out} (${(statSync(out).size / 1e6).toFixed(1)} MB)`);
