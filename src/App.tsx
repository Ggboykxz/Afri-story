import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';

// Pages - Reader
import { Home } from './pages/reader/Home';
import { Explore } from './pages/reader/Explore';
import { SearchPage } from './pages/reader/SearchPage';
import { Library } from './pages/reader/Library';
import { Reader } from './pages/reader/Reader';
import { WorkDetail } from './pages/reader/WorkDetail';
import { Rankings } from './pages/reader/Rankings';

// Pages - Artist
import { ArtistDashboard } from './pages/artist/ArtistDashboard';
import { CreateWork } from './pages/artist/CreateWork';
import { EditWork } from './pages/artist/EditWork';
import { AddChapter } from './pages/artist/AddChapter';
import { EditChapter } from './pages/artist/EditChapter';
import { ManageChapters } from './pages/artist/ManageChapters';
import { BecomePro } from './pages/artist/BecomePro';
import { CollaborationHub } from './pages/artist/CollaborationHub';

// Pages - Auth
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

// Pages - Forum
import { ForumHome } from './pages/forum/ForumHome';
import { ForumCategory } from './pages/forum/ForumCategory';
import { ThreadDetail } from './pages/forum/ThreadDetail';
import { Forum } from './pages/forum/Forum';

// Pages - Profile
import { Profile } from './pages/profile/Profile';
import { PublicArtistProfile } from './pages/profile/PublicArtistProfile';

// Pages - Subscription & Shop
import { SubscriptionPage } from './pages/subscription';
import { Shop } from './pages/Shop';

// Pages - Legal
import { Terms } from './pages/legal/Terms';
import { Privacy } from './pages/legal/Privacy';
import { FAQ } from './pages/legal/FAQ';
import { About } from './pages/legal/About';
import { CopyrightPage } from './pages/legal/Copyright';

// Pages - Error
import { NotFound } from './pages/error/NotFound';

// Pages - Notifications
import { NotificationsPage } from './pages/NotificationsPage';

// Components
import { AdCarousel } from './components/carousel/AdCarousel';
import { Skeleton, WorkCardSkeleton } from './components/common/Skeleton';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ScrollToTopButton } from './components/common/ScrollToTopButton';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireAuth = true,
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[];
  requireAuth?: boolean;
}) => {
  const { user, profile, loading } = useAuth();

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
        <Link to="/login" className="bg-brand-gold text-brand-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Se connecter</Link>
      </div>
    );
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Accès <span className="text-brand-red">Refusé</span></h2>
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
                    {/* Reader Routes */}
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
                    
                    {/* Forum Routes */}
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

                    {/* Notifications */}
                    <Route path="/notifications" element={
                      <ProtectedRoute requireAuth={true}>
                        <NotificationsPage />
                      </ProtectedRoute>
                    } />

                    {/* Artist Routes */}
                    <Route path="/collaboration" element={<CollaborationHub />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/rankings/:type" element={<Rankings />} />
                    <Route path="/bookclubs" element={<CollaborationHub />} />
                    <Route path="/contests" element={<CollaborationHub />} />

                    {/* Legal Routes */}
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/about" element={<About />} />

                    {/* Subscription & Shop */}
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:productId" element={<Shop />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/africoins" element={<SubscriptionPage />} />

                    {/* Become Pro */}
                    <Route path="/become-pro" element={<BecomePro />} />
                    <Route path="/become-artist" element={<BecomePro />} />

                    {/* Work Routes */}
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
                    <Route path="/work/:id/chapters" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'admin']}>
                        <ManageChapters />
                      </ProtectedRoute>
                    } />
                    <Route path="/work/:id/edit-chapter/:chapterId" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'admin']}>
                        <EditChapter />
                      </ProtectedRoute>
                    } />
                    <Route path="/work/:id/chapter/:chapterId" element={<Reader />} />
                    <Route path="/read/:workId/:chapterId" element={<Reader />} />

                    {/* Copyright */}
                    <Route path="/copyright" element={<CopyrightPage />} />

                    {/* Auth Routes */}
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

                    {/* Profile Routes */}
                    <Route path="/profile" element={
                      <ProtectedRoute requireAuth={true}>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/:userId" element={<PublicArtistProfile />} />

                    {/* Artist Dashboard */}
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

                    {/* Messages */}
                    <Route path="/messages" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['artist_draft', 'artist_pro', 'artist_mentor', 'enterprise']}>
                        <Messaging />
                      </ProtectedRoute>
                    } />

                    {/* Settings */}
                    <Route path="/settings" element={
                      <ProtectedRoute requireAuth={true}>
                        <Settings />
                      </ProtectedRoute>
                    } />

                    {/* Admin */}
                    <Route path="/admin" element={
                      <ProtectedRoute requireAuth={true} allowedRoles={['moderator', 'supervisor', 'admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                    {/* 404 */}
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

// Import Messaging here to avoid circular dependency
import { Messaging } from './pages/Messaging';
import { AdminDashboard } from './pages/AdminDashboard';
import { Settings } from './pages/Settings';