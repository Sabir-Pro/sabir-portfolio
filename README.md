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


## Checklist qualité 2026
- RGPD / confidentialité + CGU publiées dans `confidentialite.html` et `cgu.html`.
- Bannière de choix des statistiques ; Vercel Web Analytics ne se charge qu'après activation.
- SabirGPT appelle `/api/chat` côté serveur : aucune clé OpenAI dans le front-end.
- Protection anti-spam : honeypot côté formulaire + limitation basique des requêtes côté fonction.
- HTTPS : Vercel force déjà HTTPS sur ses domaines ; HSTS est également envoyé par `vercel.json`.
- SEO : meta title/description, canonical, Open Graph, favicon, `sitemap.xml`, `robots.txt`.
- 404 personnalisée.
- Images : photo WebP déjà optimisée (~172 Ko dans la version de référence), dimensions explicites, lazy-loading pour l'image secondaire.
- Responsive mobile/tablette/desktop et améliorations de contraste/focus clavier.
- Liens internes corrigés pour la structure actuellement déployée à la racine.
- Formulaire SabirGPT : `required`, `maxlength`, honeypot et validation côté serveur.
- Analytics : après déploiement, activer **Web Analytics** dans le projet Vercel pour que `/_vercel/insights/script.js` soit servi.
- Le site reste statique et sans dépendance npm ; les pages se déploient directement avec Vercel.

> Les pages RGPD/CGU sont des informations générales et ne constituent pas un avis juridique. Les obligations exactes dépendent du statut de l'éditeur et des traitements réellement activés.
