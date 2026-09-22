# SABIR IAZZA — Portfolio V2 optimized

Portfolio web personnel — HTML / CSS / JavaScript.

## Optimisations appliquées
- Image de profil convertie en WebP et réduite (~172 Ko au lieu de ~572 Ko).
- `loading="lazy"` sur l'image secondaire et dimensions explicites pour limiter le CLS.
- Gestion robuste des modales : fermeture Escape, clic extérieur, retour du focus, piège de focus clavier et attributs ARIA.
- Menu mobile avec `aria-expanded` synchronisé.
- Gestion de secours si `IntersectionObserver` n'est pas disponible.
- Scroll optimisé avec `requestAnimationFrame` + listener passif.
- Échappement HTML renforcé pour les messages utilisateur de SabirGPT.
- Boutons avec `type="button"` quand nécessaire.
- Liens externes ouverts dans un nouvel onglet avec `noopener noreferrer`.
- Vérification des références locales et absence d'IDs HTML dupliqués.

## Tests effectués
- `node --check script.js` : OK
- Références locales : OK
- Serveur HTTP local + vérification des ressources principales : OK (HTTP 200)
- IDs HTML dupliqués : aucun

Note : un test Chromium headless a été tenté, mais le processus Chromium ne termine pas dans cet environnement ; ce point est donc explicitement non validé visuellement ici.
