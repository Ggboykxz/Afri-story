import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
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
import { SubscriptionPage } from './pages/Subscription';
import { NotFound } from './pages/NotFound';
import { SearchPage } from './pages/SearchPage';
import { CopyrightPage } from './pages/Copyright';
import { AddChapter } from './pages/AddChapter';
import { EditWork } from './pages/EditWork';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';

const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireAuth = true,
  fallbackTo = '/login'
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[];
  requireAuth?: boolean;
  fallbackTo?: string;
}) => {
  const { user, profile, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Accès Restreint</h2>
        <p className="text-gray-500 max-w-md">Veuillez vous connecter pour accéder à cette section.</p>
        <Link to={fallbackTo} className="bg-brand-gold text-brand-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Se connecter</Link>
      </div>
    );
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Accès Restreint</h2>
        <p className="text-gray-500 max-w-md">Cette section est réservée aux comptes : {allowedRoles.join(', ')}.</p>
        <Link to="/" className="bg-brand-gold text-brand-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Retour à l'accueil</Link>
      </div>
    );
  }

  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function LoadingFallback() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <ScrollToTopButton />
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/explorer" element={<Navigate to="/explore" replace />} />
                    <Route path="/explorer/pro" element={<Explore />} />
                    <Route path="/explorer/draft" element={<Explore />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/library" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['reader', 'reader_premium', 'reader_supporter', 'artist_draft', 'artist_pro', 'artist_mentor', 'enterprise']}>
                        <Library />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/forum" element={<ForumHome />} />
                    <Route path="/forum/public" element={<ForumHome />} />
                    <Route path="/forum/premium" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['reader_premium', 'reader_supporter', 'artist_pro', 'artist_mentor', 'moderator', 'supervisor', 'admin']}>
                        <ForumHome />
                      </ProtectedRoute>
                    } />
                    <Route path="/forum/category/:categoryId" element={<ForumCategory />} />
                    <Route path="/forum/thread/:threadId" element={<ThreadDetail />} />
                    <Route path="/forum/work/:workId" element={<Forum />} />

                    <Route path="/notifications" element={
                      <ProtectedRoute requireAuth={true}>
                        <NotificationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/collaboration" element={<CollaborationHub />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/rankings/:type" element={<Rankings />} />
                    
                    <Route path="/bookclubs" element={<CollaborationHub />} />
                    <Route path="/contests" element={<CollaborationHub />} />

                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:productId" element={<Shop />} />

                    <Route path="/become-pro" element={<BecomePro />} />
                    <Route path="/become-artist" element={<BecomePro />} />

                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/work/:id" element={<WorkDetail />} />
                    <Route path="/work/:id/add-chapter" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'admin']}>
                        <AddChapter />
                      </ProtectedRoute>
                    } />
                    <Route path="/work/:id/edit" element={
                      <ProtectedRoute requireAuth={true}>
                        <EditWork />
                      </ProtectedRoute>
                    } />
                    <Route path="/work/:id/chapter/:chapterId" element={<Reader />} />
                    <Route path="/read/:workId/:chapterId" element={<Reader />} />

                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/africoins" element={<SubscriptionPage />} />
                    <Route path="/copyright" element={<CopyrightPage />} />

                    <Route path="/login" element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    } />
                    <Route path="/signup" element={
                      <GuestRoute>
                        <Signup />
                      </GuestRoute>
                    } />

                    <Route path="/profile" element={
                      <ProtectedRoute requireAuth={true}>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/:userId" element={<PublicArtistProfile />} />

                    <Route path="/artist" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'enterprise']}>
                        <ArtistDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/artist/new-work" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'enterprise']}>
                        <CreateWork />
                      </ProtectedRoute>
                    } />
                    <Route path="/artist/create-work" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'enterprise']}>
                        <CreateWork />
                      </ProtectedRoute>
                    } />
                    <Route path="/artist-profile/:id" element={<PublicArtistProfile />} />

                    <Route path="/messages" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'enterprise']}>
                        <Messaging />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['moderator', 'supervisor', 'admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                    <Route path="/settings" element={
                      <ProtectedRoute requireAuth={true}>
                        <Settings />
                      </ProtectedRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}