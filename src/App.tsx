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
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="/work/:id" element={<WorkDetail />} />
            <Route path="/read/:workId/:chapterId" element={<Reader />} />
            <Route path="/artist" element={<ArtistDashboard />} />
            <Route path="/artist/new-work" element={<CreateWork />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/messages" element={<Messaging />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
