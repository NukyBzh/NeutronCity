# Nuki Town sur iPhone (version web installable)

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

## 2. Mettre le jeu en ligne sur Netlify (essai L9, D-26)
Mise en ligne **privée**, pour l'essai seulement : l'adresse n'est pas référencée, mais toute personne qui la connaît
peut jouer. La diffusion publique attend toujours les deux points ouverts de `docs/STATUS.md` (conditions d'usage des
images IA, nom « Nuki Town »).

**La première fois (Yann)**
1. Créer un compte gratuit sur https://app.netlify.com (avec une adresse e-mail ou GitHub).
2. Ouvrir https://app.netlify.com/drop.
3. Y glisser **le fichier `livrables/Nuki-Town-web-<version>.zip`** (ou le dossier `apps/game/dist`).
4. Netlify donne une adresse `https://<nom-au-hasard>.netlify.app`. On peut changer le nom dans *Site configuration →
   Change site name*, par exemple un nom qui ne dit rien du jeu.

**Pour une nouvelle version** (L9.2d)
1. Construire l'APK de la même version : `npm.cmd run android` (le site le sert aux testeurs Android,
   `/Nuki-Town-<version>.apk`, L9.2c).
2. Préparer l'envoi : `npm.cmd run web`. Il écrit **un envoi complet** : jeu + APK + règle qui fait télécharger l'APK,
   dans `livrables/Nuki-Town-web-<version>.zip` et dans le dossier `livrables/web-<version>/`. Sans l'APK, il s'arrête.
3. Mettre en ligne, au choix :
   - dans Netlify, ouvrir le site → *Deploys*, puis glisser le `.zip` dans la zone « Drag and drop » ;
   - ou demander à Claude de publier le dossier `livrables/web-<version>/`.
   L'adresse ne change pas. À la prochaine ouverture avec le réseau, l'iPhone prend la nouvelle version (§ 1).
4. Vérifier : l'accueil s'ouvre, et le lien de l'APK le télécharge.

**Ne jamais envoyer le dépôt lui-même** (dossier du projet, lien GitHub) : Netlify publierait la racine du projet, sans
`index.html`, et le jeu afficherait « Page not found » (arrivé le 2026-11-11). Le `netlify.toml` à la racine du dépôt
fait échouer exprès une telle construction : Netlify garde alors la version en ligne.

Le badge « Powered by Netlify » couvre le coin en bas à droite : rien d'utile ne doit y être (L9.2b).

## 3. Installer sur l'iPhone
1. Ouvrir l'adresse du jeu dans **Safari** (pas Chrome : sur iPhone, seul Safari sait ajouter une version web à
   l'écran d'accueil sur les anciennes versions d'iOS).
2. Toucher **Partager** (le carré avec la flèche), puis **Sur l'écran d'accueil**, puis **Ajouter**.
3. Ouvrir le jeu depuis la nouvelle icône **Nuki Town** et le laisser se charger une fois avec le réseau.
4. Tourner le téléphone à l'horizontale.

## 4. Essayer sur le PC
- `npm.cmd run build`, puis lancer l'aperçu (configuration `game-pwa-4181` de `.claude/launch.json`, ou dans
  `apps/game` : `npx.cmd vite preview --port 4181`), puis ouvrir http://localhost:4181.
- La mise en cache ne marche que sur `localhost` ou en HTTPS : par le Wi-Fi (`http://192.168…`), le jeu marche mais
  ne se garde pas hors ligne.
