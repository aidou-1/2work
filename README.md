# 2 WORK

Application web d'échauffement, de séances et de retour au calme (made by Aidou).

- `index.html` : l'application complète.
- `videos/` : une vidéo par exercice (`<identifiant>.mp4`). Les exercices sans vidéo affichent leur dessin.
- `fonts/` : polices Barlow et Barlow Condensed (licence SIL OFL, voir `fonts/OFL.txt`), hébergées avec l'appli pour n'appeler aucun service externe.

Données : tout reste dans le stockage local du téléphone (aucun compte, aucun serveur, aucun traceur). Voir « Réglages → Confidentialité » dans l'appli.
- `manifest.webmanifest`, `sw.js`, `icons/` : appli installable sur l'écran d'accueil et utilisable hors ligne. **À chaque mise en ligne, change le numéro de version `V` en haut de `sw.js`** pour que les téléphones reçoivent la nouvelle version.
