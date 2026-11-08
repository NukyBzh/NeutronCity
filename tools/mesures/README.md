# Mesures de fluidité (lot L4)

Scripts Node (≥ 22, WebSocket intégré) qui pilotent Edge sans fenêtre par le protocole DevTools. Le jeu doit être
servi (`npm.cmd run build` puis, dans `apps/game`, `npx.cmd vite preview --port 4180`).

1. Lancer Edge : `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --remote-debugging-port=9333 --window-size=1920,1200 --user-data-dir=<dossier temporaire> about:blank`
2. Images par seconde, processeur ralenti N fois (3 ≈ Galaxy Tab A9+, 6 = cas dur) :
   `node tools/mesures/fps.mjs 9333 "http://localhost:4180/?ecran=jeu&journee=hiver&heure=17&graine=3&vitesse=4" 3`
3. Les voitures n'avancent-elles que vers l'avant pendant les redessins (R1-02) ? `back` doit être vide :
   `PORT=9333 node tools/mesures/cars.mjs "http://localhost:4180/?ecran=jeu&journee=hiver&heure=17&graine=42&vitesse=6"`

Repères du 2026-11-08 (v0.6.0, ralenti 3 fois) : jour 85 à 150 images/s ; crépuscule d'hiver en ×4 ≈ 30 images/s.
