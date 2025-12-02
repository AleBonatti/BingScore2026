/**
 * App Component
 * React Router setup with routes
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SearchPage from './pages/SearchPage';

// Placeholder page for now
const MediaDetailPage = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <p className="text-gray-700 dark:text-gray-300">Media Detail Page - Coming soon</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
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
