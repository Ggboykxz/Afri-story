# AfriStory - Documentation Technique

Projet de plateforme panafricaine de webtoons, BDs et romans illustrés.

## Stack Technique

- **Frontend**: React 19, Vite 6, TypeScript 5.8
- **Styling**: Tailwind CSS 4, Framer Motion
- **Backend**: Firebase (Auth + Firestore + Storage), Express (SSR)
- **Routing**: React Router DOM v7
- **Bundler**: Vite

## Structure du Projet

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx       # Main layout
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── Footer.tsx       # Footer
│   │   └── BottomNav.tsx    # Mobile bottom navigation
│   ├── EmptyState.tsx       # Empty/Loading/Error states
│   ├── ErrorBoundary.tsx   # Global error handling
│   ├── Toast.tsx            # Toast notifications
│   └── Skeleton.tsx        # Loading skeletons
├── context/
│   └── AuthContext.tsx      # Authentication & permissions
├── lib/
│   ├── firebase.ts          # Firebase config (auth, firestore, storage)
│   ├── roles.ts            # Rôles, permissions, badges, plans
│   ├── subscriptionService.ts # Abonnements & AfriCoins
│   ├── moderationService.ts # Signalements & modération
│   ├── workService.ts      # Œuvres, chapitres, comments, search
│   ├── forumService.ts    # Forums, threads, replies
│   ├── notificationService.ts # Notifications temps réel
│   ├── collaborationService.ts # Collaborations
│   ├── firestore-errors.ts # Error handling
│   └── utils.ts
├── pages/
│   ├── Home.tsx            # Accueil
│   ├── Explore.tsx         # Catalogue avec filtres
│   ├── SearchPage.tsx       # Page recherche
│   ├── Library.tsx         # Bibliothèque (favoris/historique)
│   ├── WorkDetail.tsx      # Page œuvre avec chapitres
│   ├── Reader.tsx          # Lecteur avec comments temps réel
│   ├── Profile.tsx         # Profil utilisateur
│   ├── PublicArtistProfile.tsx # Profil artiste public
│   ├── ArtistDashboard.tsx  # Dashboard créateur
│   ├── AdminDashboard.tsx   # Dashboard admin
│   ├── ForumHome.tsx       # Forums
│   ├── ForumCategory.tsx    # Catégorie forum
│   ├── ThreadDetail.tsx     # Thread forum
│   ├── NotificationsPage.tsx # Centre notifications
│   ├── CreateWork.tsx      # Création œuvre avec upload image
│   ├── Shop.tsx            # Boutique
│   ├── Subscription.tsx    # Abonnements & AfriCoins
│   ├── Rankings.tsx         # Classements
│   ├── CollaborationHub.tsx # Hub collaborations
│   ├── Messaging.tsx        # Messages (entreprise/artistes)
│   ├── Login.tsx / Signup.tsx # Auth
│   ├── BecomePro.tsx       # Devenir artiste pro
│   ├── NotFound.tsx         # Page 404
│   ├── Copyright.tsx        # Droits d'auteur
│   ├── Terms.tsx / Privacy.tsx / FAQ.tsx / About.tsx
│   └── Settings.tsx
├── App.tsx                 # Routing principal
└── main.tsx               # Entry point
```

## Commandes

```bash
npm run dev       # Développement (SSR)
npm run build     # Production
npm run lint      # TypeScript check
```

## Systèmes Implémentés

### Rôles (11)

| Rôle | Description |
|------|-------------|
| visitor | Non connecté |
| reader | Lecteur gratuit |
| reader_premium | Abonné Standard |
| reader_supporter | Abonné Supporter |
| artist_draft | Créateur amateur |
| artist_pro | Créateur certifié |
| artist_mentor | Mentor Pro |
| enterprise | Partenaire B2B |
| moderator | Modérateur |
| supervisor | Senior modérateur |
| admin | Administrateur |

### Permissions

25 permissions par rôle dans `src/lib/roles.ts` (PERMISSIONS_MATRIX)

### Badges

- Premium, Supporter, Fidèle, MegaLecteur, ProCertifié, Mentor

### Abonnements

- Standard: 2,99€/mois
- Premium: 4,99€/mois (+ accès anticipé, forum privé)
- Supporter: 5,99€/mois (+ AfriCoins mensuels)

### AfriCoins

- Pack Découverte: 100 (0,99€)
- Pack Standard: 500+50 (3,99€)
- Pack Premium: 1500+250 (9,99€)
- Pack Méga: 5000+1000 (29,99€)

### Modération

- Signalements: spam, harassment, inappropriate, spoiler, plagiarism, copyright
- Actions: warning, deleted, temporary_ban, permanent_ban

## Routes Principales

```
/                       → Home
/explore                 → Catalogue avec filtres
/search                 → Page recherche
/library                → Bibliothèque (connecté)
/forum                  → Forums
/forum/public           → Forum public
/forum/premium          → Forum Premium (abonné)
/notifications           → Centre notifications
/collaboration          → Hub collaborations
/rankings               → Classements
/rankings/:type         → Classements (pro/draft)
/subscription           → Abonnements + AfriCoins
/africoins             → Achat AfriCoins
/shop                   → Boutique
/shop/:productId        → Produit boutique
/work/:id               → Page œuvre
/read/:workId/:chapterId → Lecteur
/artist                 → Dashboard créateur
/artist/new-work        → Créer œuvre
/artist-profile/:id     → Profil artiste public
/profile/:id            → Profil utilisateur
/profile                → Mon profil
/messages               → Messages (entreprise/artistes)
/admin                  → Dashboard admin
/become-pro             → Devenir artiste pro
/copyright              → Droits d'auteur
/terms / privacy / faq / about → Pages légales
/login / signup         → Auth
/*                      → 404 NotFound
```

## Conventions Code

- **Tailwind**: `@apply` directives autorisées
- **Components**: Fonctionnels avec hooks
- **Services**: Méthodes async avec try/catch
- **Icons**: lucide-react
- **Polices**: Space Grotesk (display), Outfit (sans)
- **Images**: Firebase Storage pour uploads
- **Temps réel**: Firestore onSnapshot pour comments/forum/notifications

## Dépendances Clés

```json
{
  "firebase": "^12.12.1",
  "react": "^19.0.1",
  "react-router-dom": "^7.15.0",
  "recharts": "^3.8.1",
  "lucide-react": "^0.546.0",
  "motion": "^12.23.24"
}
```

## Environment

- `firebase-applet-config.json`: Config Firebase (NE PAS COMMITTER credentials)
- `.env.example`: Template variables d'environnement

## Notes

- Mobile-first design avec BottomNav
- Protection anti-clic droit sur images
- Filigrane invisible sur chapitres
- 70% revenus aux artistes (abonnements), 80% (AfriCoins), 90% (dons)
- Toast notifications pour feedback utilisateur
- ErrorBoundary pour gestion erreurs globale
- Real-time comments, forum, notifications via Firestore