# 🌍 AfriStory - Le Sanctuaire du Webtoon Africain

AfriStory est une plateforme de narration graphique dédiée aux créateurs et lecteurs africains. Elle permet de publier, lire et monétiser des œuvres originales (Webtoons et BD) tout en bâtissant une communauté forte.

## 🚀 Fonctionnalités Clés

- **🏠 Home & Discovery** : Mise en avant des œuvres tendances et des nouveautés
- **📖 Lecteur Immersif** : Support des modes Webtoon (défilement vertical) et BD (planches horizontales) avec gestion des chapitres et verrouillage Premium
- **🎨 Dashboard Artiste** : Statistiques détaillées, gestion d'équipe et publication simplifiée
- **🏆 Classements** : Top dynamique basé sur les engagements réels
- **🛒 Boutique AfriCoins** : Système de monnaie virtuelle pour soutenir les artistes
- **💬 Forum & Interaction** : Espaces communautaires avec gestion des spoilers
- **👤 Profils & Paramètres** : Personnalisation complète

## 🛠 Stack Technique

| Technologie | Usage |
|------------|-------|
| React 19 | UI Framework |
| TypeScript 5.8 | Type safety |
| Vite 6 | Bundler |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations |
| Firebase | Auth, Firestore, Storage |
| Cloudinary | CDN Images |
| Lucide React | Icônes |

## 📦 Structure du Projet

```
/src
├── /components    # Composants UI réutilisables
│   ├── /Layout  # Layout, Navbar, Footer, BottomNav
│   └── *.tsx    # EmptyState, ErrorBoundary, Toast, Skeleton
├── /context     # AuthContext, ThemeContext
├── /lib         # Services Firebase, utilitaires
├── /pages       # Toutes les vues
└── App.tsx      # Routing principal
```

## 🔧 Configuration

### Installation
```bash
npm install
npm run dev
```

### Variables d'environnement
Copiez `.env.example` vers `.env` et ajoutez vos clés Firebase.

## 📱 Liens Déployés

- **Vercel**: https://afri-story.vercel.app
- **Firebase**: https://gen-lang-client-0232154573.web.app

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

Propriétaire - Tous droits réservés

---

*Fait avec ❤️ par l'équipe AfriStory.*