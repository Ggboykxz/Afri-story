# AfriStory - Plateforme Panafricaine de Webtoons, BDs et Romans Illustrés

[![Netlify Status](https://api.netlify.com/api/v1/badges/xxxxx/deploy-status)](https://afristory.netlify.app)
[![Vercel Status](https://thereis.no/status-url-yet)](https://afri-story.vercel.app)
[![Firebase Hosting](https://fire-hosting-badge-url)](https://gen-lang-client-0232154573.web.app)

---

## 📱 À Propos

AfriStory est une plateforme numérique panafricaine dédiée à la publication et découverte de:
- **Webtoons** - Bandes dessinées numériques vertical scroll
- **BD** - Bandes dessinées traditionnelles
- **Romans illustrés** - Romans avec Illustrations
- **Contenu hybride** - Combinaison des formats

La plateforme met en valeur les créateurs Africans et Afro-descendants avec un système de monétisation équitable.

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.x | UI Framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Bundler |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| React Router DOM | 7.x | Routing |

### Backend & Services
| Service | Usage |
|---------|-------|
| Firebase Auth | Authentication |
| Firebase Firestore | Base de données |
| Firebase Storage | Stockage fichiers |
| Cloudinary | CDN images |
| Stripe | Paiements (à configurer) |

### Déploiement
```bash
# Firebase
firebase deploy --only hosting

# Vercel (automatique via Git)
vercel --prod

# Netlify (automatique via Git)
netlify deploy --prod
```

---

## 🚀 Installation Locale

```bash
# Cloner le projet
git clone https://github.com/Ggboykxz/Afri-story.git
cd Afri-story

# Installer les dépendances
npm install

# Variables d'environnement
cp .env.example .env.local
# Configurer firebase-applet-config.json

# Lancer en développement
npm run dev

# Vérifier les types
npm run lint

# Builder pour production
npm run build
```

---

## 📁 Structure du Projet

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx       # Main layout
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── Footer.tsx      # Footer
│   │   └── BottomNav.tsx   # Mobile bottom nav
│   ├── EmptyState.tsx      # States UI
│   ├── ErrorBoundary.tsx   # Error handling
│   ├── Toast.tsx           # Notifications
│   └── Skeleton.tsx        # Loading states
├── context/
│   ├── AuthContext.tsx     # Auth & permissions
│   └── ThemeContext.tsx    # Dark/light mode
├── lib/
│   ├── firebase.ts         # Firebase config
│   ├── roles.ts            # Rôles, permissions, badges
│   ├── subscriptionService.ts # Abonnements
│   ├── workService.ts     # Œuvres, chapitres
│   ├── forumService.ts    # Forums
│   ├── notificationService.ts # Notifications
│   ├── cloudinaryService.ts # Upload images
│   └── utils.ts            # Helpers
├── pages/
│   ├── Home.tsx            # Accueil
│   ├── Explore.tsx        # Catalogue
│   ├── SearchPage.tsx      # Recherche
│   ├── Library.tsx        # Bibliothèque
│   ├── WorkDetail.tsx     # Page oeuvre
│   ├── Reader.tsx          # Lecteur
│   ├── Profile.tsx        # Profil (éditable)
│   ├── ArtistDashboard.tsx # Dashboard créateur
│   ├── AdminDashboard.tsx # Dashboard admin
│   ├── ForumHome.tsx       # Forums
│   ├── Subscription.tsx    # Abonnements
│   ├── Rankings.tsx       # Classements
│   └── [autres pages]
├── App.tsx                 # Routing principal
└── main.tsx               # Entry point
```

---

## 🔐 Rôles et Permissions

### Hiérarchie des Rôles

```
ADMIN
  └── SUPERVISOR
        └── MODERATOR
              └── ARTISTE PRO CERTIFIÉ
                    ├── ARTISTE MENTOR
                    └── ARTISTE DRAFT
ENTREPRISE
LECTEUR PREMIUM
LECTEUR STANDARD
VISITEUR
```

### Liste des Rôles

| Rôle | Description | Accès |
|------|-------------|-------|
| `visitor` | Non connecté | Lecture limitée |
| `reader` | Lecteur gratuit | Lecture, commentaires |
| `reader_premium` | Abonné Standard | + accès anticipé |
| `reader_supporter` | Abonné Supporter | + AfriCoins mensuels |
| `artist_draft` | Créateur amateur | Publication libre |
| `artist_pro` | Créateur validé | Monétisation |
| `artist_mentor` | Mentor Pro | Encadrement Draft |
| `enterprise` | Partenaire B2B | Messages privés |
| `moderator` | Modérateur | Signalements |
| `supervisor` | Senior modérateur | Cas complexes |
| `admin` | Administrateur | Accès total |

---

## 📡 API Routes

```
/                           → Home
/explore                    → Catalogue
/search                     → Recherche
/library                   → Bibliothèque (connecté)
/forum                      → Forums
/forum/public                → Forum public
/forum/premium               → Forum Premium
/notifications              → Centre notifications
/collaboration              → Hub collaborations
/rankings                   → Classements
/rankings/:type              → Classements Pro/Draft
/subscription                → Abonnements
/africoins                   → Achat AfriCoins
/shop                         → Boutique
/work/:id                    → Page œuvre
/read/:workId/:chapterId    → Lecteur
/artist                       → Dashboard créateur
/artist/new-work              → Créer œuvre
/artist-profile/:id           → Profil artiste
/profile/:id                  → Profil utilisateur
/profile                      → Mon profil (éditable)
/messages                     → Messages
/admin                        → Dashboard admin
/become-pro                   → Devenir artiste Pro
/copyright                    → Droits d'auteur
/terms / privacy / faq / about → Pages légales
/login / signup               → Authentification
/*                            → 404 NotFound
```

---

## 🗄️ Collections Firestore

### Collections Principales

| Collection | Description |
|------------|-------------|
| `users` | Profils utilisateurs |
| `works` | Œuvres publiées |
| `works/{workId}/chapters` | Chapitres |
| `works/{workId}/chapters/{id}/comments` | Commentaires |
| `works/{workId}/reviews` | Critiques |
| `forums` | Catégories forum |
| `forum_threads` | Sujets forum |
| `forum_replies` | Réponses |
| `notifications` | Notifications |
| `conversations` | Messages privés |
| `collections` | Collections utilisateur |
| `book_clubs` | Clubs de lecture |
| `contests` | Concours |
| `ama_sessions` | Sessions AMA |
| `scheduled_chapters` | Chapitres planifiés |
| `recruitment_ads` | Annonces collaboration |
| `team_members` | Équipes de création |
| `reports` | Signalements |
| `moderation_actions` | Actions modération |
| `verification_requests` | Demandes Pro |
| `africoins_transactions` | Transactions |

Voir [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md) pour la documentation complète.

---

## 💰 Système de Monétisation

### Abonnements

| Plan | Prix | Avantages |
|------|------|-----------|
| Standard | 2,99€/mois | Sans pub, accès anticipé |
| Premium | 4,99€/mois | + contenu exclusif, forums privés |
| Supporter | 5,99€/mois | + AfriCoins mensuels |

### AfriCoins

| Pack | Prix | Bonus |
|------|------|-------|
| Découverte | 0,99€ | 100 |
| Standard | 3,99€ | 500 + 50 |
| Premium | 9,99€ | 1500 + 250 |
| Méga | 29,99€ | 5000 + 1000 |

### Répartition Revenus

| Source | Artiste | Plateforme |
|--------|--------|------------|
| Abonnements | 70% | 30% |
| AfriCoins | 80% | 20% |
| Dons | 90% | 10% |

---

## 🎨 Design System

### Couleurs

```css
--color-brand-gold: #D4AF37;
--color-brand-brown: #5C4033;
--color-brand-red: #A52A2A;
--color-brand-green: #2E8B57;
--color-brand-black: #0F0F0F;
```

### Polices

- **Display**: Space Grotesk
- **Sans**: Outfit

### Composants

- Mobile-first avec BottomNav
- Glass morphism cards
- Animations Framer Motion
- Dark mode (optionnel)

---

## 🔧 Configuration

### Firebase
Configurer `firebase-applet-config.json`:
```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "firestoreDatabaseId": "your-db-id",
  "storageBucket": "your-project.firebasestorage.app"
}
```

### Cloudinary
Créer un upload preset "unsigned" sur cloudinary.com et configurer dans `cloudinaryService.ts`:
```typescript
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
```

---

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec coverage
npm test -- --coverage
```

---

## 📱 Plateformes Déployées

- **Vercel**: https://afri-story.vercel.app (OFFICIEL)
- **Firebase**: https://gen-lang-client-0232154573.web.app
- **Netlify**: https://afristory.netlify.app

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/xxx`)
3. Commit (`git commit -m 'Add xxx'`)
4. Push (`git push origin feature/xxx`)
5. Créer une Pull Request

---

## 📄 License

Propriétaire - Tous droits réservés

---

## 📞 Contact

- Email: contact@afristory.com
- Twitter: @AfriStory
- Instagram: @afristory_official