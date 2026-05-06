# 🌍 Nexus-Hub - Le Sanctuaire du Webtoon Africain

Nexus-Hub est une plateforme de narration graphique dédiée aux créateurs et lecteurs africains. Elle permet de publier, lire et monétiser des œuvres originales (Webtoons et BD) tout en bâtissant une communauté forte.

## 🚀 Fonctionnalités Clés

- **🏠 Home & Discovery** : Mise en avant des œuvres tendances et des nouveautés.
- **📖 Lecteur Immersif** : Support des modes Webtoon (défilement vertical) et BD (planches horizontales) avec gestion des chapitres et verrouillage Premium.
- **🎨 Dashboard Artiste** : Statistiques détaillées (Recharts), gestion d'équipe et publication simplifiée.
- **🏆 Classements (Hall of Fame)** : Top dynamique basé sur les engagements réels.
- **🛒 Boutique Nexus-Coins** : Système de monnaie virtuelle pour soutenir les artistes.
- **💬 Forum & Interaction** : Espaces communautaires avec gestion des spoilers.
- **👤 Profils & Paramètres** : Personnalisation complète de l'identité utilisateur et préférences de notification.

## 🛠 Stack Technique

- **Frontend** : React 18, TypeScript, Vite.
- **Styling** : Tailwind CSS (Design System sur-mesure).
- **Animations** : Motion (Transitions fluides et interactions).
- **Backend/Auth** : Firebase (Authentication, Firestore).
- **Graphiques** : Recharts (Analytiques artistes).
- **Icons** : Lucide React.

## 📦 Structure du Projet

- `/src/pages` : Toutes les vues de l'application.
- `/src/components` : Composants UI réutilisables (Layout, Navbar, Footer, etc.).
- `/src/lib` : Services Firebase et utilitaires de données.
- `/src/context` : Gestion de l'état global (AuthContext).

## 🔒 Configuration Production

L'application utilise désormais les variables d'environnement pour la connexion aux services Firebase. Pour une utilisation locale :
1. Copiez `.env.example` vers `.env`.
2. Remplissez vos clés d'API Firebase.

---
*Fait avec ❤️ par l'équipe Nexus-Hub.*
