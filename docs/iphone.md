# Neutron City sur iPhone (version web installable)

*Lot L8.2, 2026-11-11, décision D-24. Un APK ne s'installe pas sur iPhone : on y joue avec la **version web
installable** (PWA), c'est-à-dire le même jeu, servi par un site et gardé ensuite sur le téléphone.*

## 1. Ce que fait la version web
- Une fois ajoutée à l'écran d'accueil, elle s'ouvre **en plein écran**, avec l'icône de la centrale, comme une application.
- **Hors ligne** : au premier lancement, tous les fichiers du jeu (images, sons, musique, environ 5 Mo) sont gardés
  sur le téléphone ; ensuite le jeu s'ouvre même en mode avion.
- **Paysage seulement** : iOS ne permet pas de bloquer l'écran d'une version web. Si l'enfant tient le téléphone
  droit, Cassandra lui demande de le tourner, et la journée se met en pause.
- **Progression** gardée sur le téléphone (euros, étoiles, achats), comme sur la tablette (D-14). Elle est perdue si
  on supprime l'icône ou si on efface les données de Safari.
- Les mises à jour arrivent seules : à l'ouverture suivante, avec le réseau, le jeu prend la nouvelle version.
- Marche aussi sur un téléphone Android (Chrome : menu ⋮ → « Ajouter à l'écran d'accueil » ou « Installer
  l'application »), en plus de l'APK.

## 2. Mettre le jeu en ligne (une fois, à faire avec l'accord de Yann)
La version web doit être servie en **HTTPS** pour s'installer. **Pas encore fait** : mettre le jeu en ligne revient à
le publier. Avant cela, il faut régler deux points ouverts (`docs/STATUS.md`) : les conditions d'usage des images
générées par IA et le nom « Neutron City ».
- Construire : `npm.cmd run build` → dossier `apps/game/dist` (contient `manifest.webmanifest` et `sw.js`).
- Héberger ce dossier sur un service gratuit en HTTPS (Netlify, Cloudflare Pages). GitHub Pages est payant pour un
  dépôt privé. Une adresse non référencée suffit pour un essai.

## 3. Installer sur l'iPhone
1. Ouvrir l'adresse du jeu dans **Safari** (pas Chrome : sur iPhone, seul Safari sait ajouter une version web à
   l'écran d'accueil sur les anciennes versions d'iOS).
2. Toucher **Partager** (le carré avec la flèche), puis **Sur l'écran d'accueil**, puis **Ajouter**.
3. Ouvrir le jeu depuis la nouvelle icône **Neutron City** et le laisser se charger une fois avec le réseau.
4. Tourner le téléphone à l'horizontale.

## 4. Essayer sur le PC
- `npm.cmd run build`, puis lancer l'aperçu (configuration `game-pwa-4181` de `.claude/launch.json`, ou dans
  `apps/game` : `npx.cmd vite preview --port 4181`), puis ouvrir http://localhost:4181.
- La mise en cache ne marche que sur `localhost` ou en HTTPS : par le Wi-Fi (`http://192.168…`), le jeu marche mais
  ne se garde pas hors ligne.
