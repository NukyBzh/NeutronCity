/** Version of apps/game/package.json, injected by Vite (docs/CONFIGURATION.md §2, rule 6). */
declare const __APP_VERSION__: string;

/** Set by the Android app only (MainActivity.kt, lot L9.2c): opens the share sheet with a file written from `text`. */
interface Window {
  NukiAndroid?: { shareFile(name: string, text: string, mime: string, title: string): boolean };
}
