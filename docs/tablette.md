# Nuki Town sur la tablette Android (APK de test)

*APK construit le 2026-11-08 depuis la version **0.6.0** (lot L4). Fichier : `livrables/Neutron-City-0.6.0.apk`
(non versionné). Recompiler : `npm.cmd run android` à la racine du dépôt.*

## 1. Ce que fait l'APK
- Installe l'application **Nuki Town**, anciennement Neutron City (identifiant gardé : `fr.neutroncity.jeu`, la mise à jour s'installe par-dessus), qui fonctionne entièrement **hors ligne**.
- **Paysage forcé et plein écran** : les barres d'Android sont masquées (un glissement depuis un bord les montre un
  instant) ; l'écran reste allumé pendant le jeu.
- Progression (euros, étoiles, achats) **gardée sur la tablette** ; « Nouveau joueur » sur l'accueil l'efface
  (décision D-14).
- APK optimisé (release) pour processeur ARM 64 bits, signé avec la **clé de débogage** d'Android : suffisant pour
  une installation à la main. La signature avec une clé à vous viendra au lot L8.

## 2. Installer l'APK sur la tablette (une fois)
1. Mettre l'APK sur la tablette, au choix :
   - **lien de l'essai** (L9.2c) : ouvrir dans Chrome https://stunning-haupia-9181a8.netlify.app/Nuki-Town-0.12.0.apk,
     puis « Télécharger quand même » si Chrome prévient ;
   - câble USB (dossier `Download`), ou envoi à soi-même (Google Drive, e-mail).
2. Sur la tablette, ouvrir **Mes fichiers** → `Téléchargements` → toucher le fichier APK.
3. Au message « installation d'applications inconnues bloquée », toucher **Paramètres** et autoriser
   **Mes fichiers**, puis revenir et toucher **Installer**.
4. Si Play Protect propose d'analyser l'appli (application absente du Play Store) : **Plus de détails** →
   **Installer sans analyser** (essayé sur la tablette virtuelle Android 17 le 2026-11-11).
5. L'icône **Nuki Town** (la centrale entourée de son orbite, avec Nuki) apparaît dans les applications. Vous pouvez ensuite retirer
   l'autorisation donnée à l'étape 3.

Mettre à jour : installer le nouvel APK **par-dessus** l'ancien ; la progression est conservée.
Désinstaller : appui long sur l'icône → **Désinstaller** (la progression est effacée).

## 3. Avant une séance de test avec des enfants
- [ ] Batterie > 80 %, **mode avion** et **Ne pas déranger** activés, luminosité au maximum.
- [ ] Lancer le jeu une fois et faire une journée d'été (5 minutes) pour vérifier que tout s’affiche et que la ville bouge sans à-coups.
- [ ] Entre deux enfants : accueil → **Nouveau joueur** → Effacer.
- [ ] À noter pendant le test : où l'enfant hésite, ce qu'il dit de Cassandra, s'il comprend les deux curseurs,
      s'il a envie d'acheter dans la boutique, si la ville bouge sans à-coups.
