/**
 * App Component
 * React Router setup with routes
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SearchPage from './pages/SearchPage';
import MediaDetailPage from './pages/MediaDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-grafite">
        <Header />
        <main className="grow">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/media/:mediaType/:tmdbId" element={<MediaDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
