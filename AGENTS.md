# AfriStory - Documentation Technique

Projet de plateforme panafricaine de webtoons, BDs et romans illustrés.

## Stack Technique

- **Frontend**: React 19, Vite 6, TypeScript 5.8
- **Styling**: Tailwind CSS 4, Framer Motion
- **Backend**: Firebase (Auth + Firestore), Express (SSR)
- **Routing**: React Router DOM v7
- **Bundler**: Vite

## Structure du Projet

```
src/
├── components/          # Composants UI partagés
│   └── Layout/       # Navbar, Footer, Layout
├── context/          # React Context (Auth)
├── lib/             # Services Firebase
│   ├── firebase.ts          # Config Firebase
│   ├── roles.ts            # Rôles, permissions, badges
│   ├── subscriptionService.ts # Abonnements, AfriCoins
│   ├── moderationService.ts # Modération, signalements
│   ├── workService.ts     # Œuvres, chapitres
│   ├── forumService.ts    # Forums, threads
│   └── collaborationService.ts
├── pages/            # Pages React
├── App.tsx           # Routing principal
└── main.tsx          # Entry point
```

## Commandes

```bash
npm run dev       # Développement (SSR)
npm run build     # Production
npm run lint     # TypeScript check
```

## Systèmes Implémentés

### Rôles (11)

| Rôle | Description |
|------|------------|
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

## Conventions Code

- **Tailwind**: `@apply` directives autorisées
- **Components**: Fonctionnels avec `React.FC<{ props }>`
- **Services**: Méthodes async avec try/catch et handleFirestoreError
- **Icons**: lucide-react
- **Polices**: Space Grotesk (display), Outfit (sans)

## Routes Principales

```
/                  → Home
/explore           → Catalogue
/library          → Bibliothèque (connecté)
/forum            → Forums
/forum/premium    → Forum Premium (abonné)
/subscription    → AfriCoins + Abonnements
/work/:id         → Page œuvre
/read/:workId/:chapterId → Lecture
/artist           → Dashboard créateur
/admin            → Dashboard admin
```

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

- `firebase-applet-config.json`: Config Firebase (NE PAS COMMITTERcredentials)
- `.env.example`: Template variables d'environnement

## Notes

- Mobile-first design
- Protection anti-clic droit sur images
- Filigrane invisible sur chapitres
- 70% revenus aux artistes (abonnements), 80% (AfriCoins), 90% (dons)