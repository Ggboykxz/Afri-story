# Audit UI/UX — AfriStory

Date : 2026-10-14  
Portée : `src/` (React 19 + Tailwind CSS 4 + Framer Motion), layout, navigation, pages, composants communs.

## Résumé exécutif

L’application présente une identité visuelle forte (thème sombre premium, or/bordeaux/vert, typographies Space Grotesk/Outfit) et des micro-interactions soignées. L’expérience mobile est prise en compte via `BottomNav` et des grilles responsives. Cependant, l’audit met en évidence des points critiques en **accessibilité** (aucune ARIA, pas d’association de labels, navigation clavier insuffisante), des **incohérences UX** (navigation desktop/mobile, menus déroulants fragiles), des **performances** (bundle JS ~1.48 Mo, 40+ useEffect, pas de lazy loading des routes), et des **problèmes de maintenabilité** (typographies/legal, textes tronqués, images sans alt, états de chargement parfois absents).

**Score global estimé : 7/10** — solide pour une démo, mais pas prêt pour une mise en production accessible.

## 1. Accessibilité (critique)

### Problèmes
- **Aucun attribut ARIA** dans `src/` (`grep aria-*` = 0).
- **Aucun `role=` ni `tabIndex`** : conteneurs cliquables gérés avec `onClick` (≈187 occurrences hors `button`).
- **Aucun `htmlFor`** : 57 `<label>` sans association programmatique avec leur champ.
- **Images** : 34 `<img>`, dont 10 `alt=""` vides et 14 sans `alt` détecté.
- **Navigation clavier** : pas de focus visible standard, menus hover-only (`group-hover`) dans `Navbar.tsx`.
- **Skip link / landmarks** : `Layout.tsx` ne fournit pas de `<main>` avec `id` ni de lien d’évitement.
- **Modales/portails** : le drawer mobile utilise `createPortal` avec overlay `backgroundColor: black` sans `role="dialog"`, `aria-modal`, ni gestion du focus trap.

### Impact
Utilisateurs au clavier / lecteur d’écran ne peuvent pas naviguer ou comprendre l’interface.

### Recommandations
- Ajouter `role="dialog"`, `aria-modal`, `aria-labelledby` aux modales (`ConfirmDialog`, drawer mobile, dropdowns).
- Remplacer zones `onClick` sur `div` par `<button>` ou ajouter `role="button"` + `tabIndex={0}` + handler clavier.
- Associer chaque `label` à son input via `htmlFor`/`id`.
- Fournir `alt` descriptif pour images de couverture/avatars ; `alt=""` uniquement décoratif.
- Ajouter un lien “Aller au contenu principal” (`skip link`) au début du layout et envelopper le contenu dans `<main id="main">`.
- Définir des styles `:focus-visible` globaux dans `index.css`.

## 2. Navigation et information architecture

### Constats
- `Navbar.tsx` : navigation desktop masquée sous `md`, recherche sous `sm`; nombre d’icônes et badges surchargent le rendu mobile.
- Menu mobile ouvre un drawer plein écran via portal avec une animation spring ; l’overlay est entièrement noir opaque (`backgroundColor: 'black'`), ce qui masque le contexte.
- `BottomNav.tsx` n’apparaît que sur certaines routes (`md:hidden`) ; hôte mobile se retrouve avec deux systèmes de navigation possibles.
- Dropdowns de notifications et profil utilisent des transitions `group-hover` / états `showNotifications`, pas de fermeture au clic extérieur/Escape, risque de menus bloqués.
- Liens nommés parfois incohérents : `/explore` vs `/explorer` mentionnés dans audit précédent ; vérifier l’unicité des alias.
- `ScrollToTop` réinitialise bien la position lors des changements de route.

### Recommandations
- Unifier la navigation mobile : drawer OU bottom nav, avec hiérarchie stable.
- Fermer les dropdowns sur `click` extérieur et `Escape`.
- Ajouter `aria-expanded`, `aria-controls`, `aria-haspopup` aux boutons de menu.
- Ajouter des états actifs visibles dans la navbar desktop (actuellement `text-gray-400 hover:text-white`, pas d’indicateur fort de page active).

## 3. Cohérence visuelle et design system

### Constats positifs
- Tailwind v4 configuré proprement avec `@theme`, tokens brand cohérents.
- Composants réutilisables (`glass-card`, `Skeleton`, `EmptyState`).
- Utilisation régulière de animations (Framer/Motion) pour feedback et hiérarchie.

### Problèmes
- Taille de police racine réduite à 14px sous 640px dans `index.css`; combiné au texte uppercase `text-[8px]`/`text-[10px]`, cela crée des micro-textes illisibles sur mobile.
- Multiples titres `h1/h2/h3` sans hiérarchie réelle (plusieurs `h1` par page possibles) ; tailles visuellement proches entre niveaux (h1 souvent `text-3xl/4xl/5xl`).
- Couleurs sémantiques limitées : statuts utilisés via classes ad hoc (`brand-red`, `brand-green`, `brand-gold`), sans tokens dédiés (success/warning/danger/info).
- Contrastes : `text-gray-500`, `text-gray-600` sur noir peuvent être sous le seuil WCAG pour du texte normal; `text-[8px]` aggrave le problème.
- Boutons utilisent souvent `hover:scale-105` sans option de réduction du mouvement (`prefers-reduced-motion` non pris en compte).
- Incohérence des radius/spacing : `rounded-xl`, `rounded-2xl`, `rounded-full`, `rounded-lg` mélangés dans la même hiérarchie.

### Recommandations
- Supprimer ou reconsidérer la réduction globale de la taille racine mobile.
- Définir une échelle typographique sémantique et garantir un seul `h1` par page.
- Ajouter des tokens sémantiques (`--color-success`, `--color-warning`, `--color-danger`, `--color-info`).
- Respecter `prefers-reduced-motion` via CSS et désactiver les animations intensives.
- Standardiser radius (`sm/md/lg`) et espacements par type de composant.

## 4. Responsivité et mobile

### Constats
- Mobile-first en grande partie (`md:hidden`, `hidden md:flex`).
- `BottomNav` est utile mais navigation principale incomplète (manque Explorer/Profil selon routes).
- Les formulaires restent en side-by-side très tôt (`md:w-48` recherche) alors que mobile compact.
- `min-w-[18px]` et padding fixes peuvent créer de petits touch targets (<44px) pour certaines icônes (`p-2 text-gray-400`).
- `overflow-y-auto` et scroll containers dans dropdowns sont corrects mais max-height fixes.

### Recommandations
- Respecter 44×44 CSS px minimum pour les cibles tactiles.
- Réorganiser `BottomNav` avec accès Profil/Search et labels clairs.
- Limiter les informations secondaires dans le header mobile (coins, messages) ou les placer dans le drawer.

## 5. Composants, états et feedback

### Constats positifs
- `Skeleton`, `EmptyState`, `LoadingState`, `ErrorState` existent et sont réutilisés.
- Toast provider et confirmation dialog présents.

### Problèmes
- Chargement : certaines pages utilisent `onSnapshot` sans état d’erreur; pages volumineuses (`Reader.tsx` 865 lignes, `WorkDetail` 680, `AdminDashboard`) augmentent le risque d’état incohérent.
- Pas de lazy loading des routes dans `App.tsx` (tout importé statiquement); image > bundle 1.48 Mo.
- Gestion du focus après navigation/modales incomplète.
- Toast context supposé présent (`useToast`) ; si utilisé hors provider, erreur.

### Recommandations
- Lazy-load routes avec `React.lazy` + `Suspense`.
- Uniformiser états `loading/error/empty` sur toutes les pages data-driven.
- Ajouter focus trap et restauration du focus dans les modales/portails.

## 6. Formulaires

### Constats
- Login/Signup ont des champs contrôlés basiques.
- Aucun `htmlFor`, pas d’indices `aria-invalid/aria-describedby`.
- Messages d’erreur non standardisés visuellement (à vérifier selon pages).
- Recherche dans navbar submit via `Enter`, bon.
- `scrollToTop` gère le retour en haut.

### Recommandations
- Créer un composant `FormInput` avec label associé, erreur, hint.
- Standardiser validation et messages d’erreur.
- Désactiver les boutons submit pendant la requête et afficher l’état de chargement.

## 7. Performance UI

### Constats
- 41 fichiers importent `motion/react`; nombreuses animations `whileHover`/`whileTap`/`AnimatePresence`.
- Route transitions animées à chaque changement de page; combiné aux re-renders, peut impacter les appareils modestes.
- `onSnapshot` en temps réel sur collections globales (`works`, notifications) peut déclencher beaucoup de re-renders.
- Auto-refresh toutes les 70s si `refresh` expose? À vérifier.

### Recommandations
- Réduire les animations automatiques et respecter `prefers-reduced-motion`.
- Code-split des routes et des librairies lourdes (firebase, recharts).
- Mémoïser les listes coûteuses (`useMemo`) dans pages listes et pagination/virtualisation si grandes.

## 8. Internationalisation et contenu

### Constats
- Langue HTML `fr`, libellés majoritairement en français.
- Mélange de majuscules accentuées / unicodes (ex : `Recharts`, dates), date formatting via `toLocaleDateString` sans locale explicite.
- Quelques typos (“Wath now”, “Aucunne”?) à vérifier par lint linguistique.
- Emojis utilisés pour genres (fun, mais accessibilité dépend de alt/texte).

### Recommandations
- Fixer `toLocaleDateString('fr-FR')`.
- Centraliser les libellés pour faciliter la traduction.
- Corriger coquilles visibles dans pages.

## 9. Évolutivité mobile (Flutter)

Le dépôt actuel reste web React; si une application Flutter est démarrée, la cohérence avec le backend Firebase et le design system doit être maintenue. Recommandé : extraire les tokens (couleurs, typo) dans un package partagé ou documenter `index.css`/`@theme`.

## Priorités recommandées

### P0 — Avant production
1. Accessibilité de base (ARIA, labels, keyboard, alt, skip link).
2. Navigation mobile cohérente.
3. Respect de `prefers-reduced-motion`.
4. Cibles tactiles ≥ 44px.

### P1 — Qualité
5. Code splitting / lazy loading.
6. Standardiser typographie et tokens sémantiques.
7. États loading/error/empty uniformisés.
8. Fermeture robuste des overlays (Escape, click outside, focus trap).

### P2 — Polish
9. Animations moins nombreuses sur mobile.
10. Intl locale fixe, correction typos.
11. Avatar/cover alt dynamiques.

## Mises à jour appliquées (post-audit)

- Focus visible global + respect de `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` et CSS).
- Skip link + `<main id="main-content">` dans `Layout.tsx`.
- Navigation (`Navbar`, `BottomNav`) : ARIA (`aria-label`, `aria-expanded`, `aria-current`), fermeture par Échap / clic extérieur.
- Modales (`ConfirmDialog`) et toasts : `role="dialog"`, `aria-modal`, `aria-live`.
- Auth : labels associés via `htmlFor`/`id` + `role="alert"`.
- Performance : routes lazy-loaded et découpage manuel des chunks Vite.
- Tokens sémantiques (`success`, `warning`, `danger`, `info`) et suppression de la réduction globale de font-size mobile.

## Travaux restants au niveau page

Les pages individuelles (aria-current de boutons d’action, alt dynamiques, labels non associés dans les filtres) doivent encore être normalisées page par page. Les composants partagés sont prêts; les pages dépendantes devront importer/composer ces standards.
EOF
echo created