// The game is the web build of apps/game shown in a window (PC) or full screen (Android); no native command.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running Nuki Town");
}
