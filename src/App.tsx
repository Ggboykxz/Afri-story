import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { WorkDetail } from './pages/WorkDetail';
import { Reader } from './pages/Reader';
import { ArtistDashboard } from './pages/ArtistDashboard';
import { Forum } from './pages/Forum';
import { Profile } from './pages/Profile';
import { Shop } from './pages/Shop';
import { CreateWork } from './pages/CreateWork';
import { Messaging } from './pages/Messaging';
import { AdminDashboard } from './pages/AdminDashboard';
import { Rankings } from './pages/Rankings';
import { Settings } from './pages/Settings';
import { Explore } from './pages/Explore';
import { Library } from './pages/Library';
import { ForumHome } from './pages/ForumHome';
import { ForumCategory } from './pages/ForumCategory';
import { ThreadDetail } from './pages/ThreadDetail';
import { NotificationsPage } from './pages/NotificationsPage';
import { CollaborationHub } from './pages/CollaborationHub';
import { PublicArtistProfile } from './pages/PublicArtistProfile';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { FAQ } from './pages/FAQ';
import { About } from './pages/About';
import { BecomePro } from './pages/BecomePro';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (!profile || !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Accès Restreint</h2>
        <p className="text-gray-500 max-w-md">Vous n'avez pas les permissions nécessaires pour accéder à cette section. Elle est réservée aux comptes de type : {allowedRoles.join(', ')}.</p>
        <Link to="/" className="bg-brand-gold text-brand-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Retour à l'accueil</Link>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/library" element={<Library />} />
            <Route path="/forum" element={<ForumHome />} />
            <Route path="/forum/category/:categoryId" element={<ForumCategory />} />
            <Route path="/forum/thread/:threadId" element={<ThreadDetail />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/collaboration" element={<CollaborationHub />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/artist-profile/:artistId" element={<PublicArtistProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/become-pro" element={<BecomePro />} />
            <Route path="/work/:id" element={<WorkDetail />} />
            <Route path="/read/:workId/:chapterId" element={<Reader />} />
            
            <Route path="/artist" element={
              <ProtectedRoute allowedRoles={['artist_pro', 'artist_draft', 'artist_mentor']}>
                <ArtistDashboard />
              </ProtectedRoute>
            } />
            <Route path="/artist/new-work" element={
              <ProtectedRoute allowedRoles={['artist_pro', 'artist_draft', 'artist_mentor']}>
                <CreateWork />
              </ProtectedRoute>
            } />

            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/messages" element={<Messaging />} />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'moderator', 'supervisor']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
