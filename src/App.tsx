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
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:id" element={<WorkDetail />} />
            <Route path="/read/:workId/:chapterId" element={<Reader />} />
            <Route path="/artist" element={<ArtistDashboard />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
