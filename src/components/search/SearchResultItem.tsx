/**
 * SearchResultItem Component
 * Individual search result with poster, title, year, media type
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Tv } from 'lucide-react';
import type { SearchResult } from '@/lib/types/domain';

interface SearchResultItemProps {
  result: SearchResult;
}

export default function SearchResultItem({ result }: SearchResultItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/media/${result.mediaType}/${result.tmdbId}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      onClick={handleClick}
    >
      {result.posterUrl ? (
        <img src={result.posterUrl} alt={result.title} className="w-12 h-18 object-cover rounded" />
      ) : (
        <div className="w-12 h-18 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
          {result.mediaType === 'movie' ? (
            <Film className="w-6 h-6 text-gray-500" />
          ) : (
            <Tv className="w-6 h-6 text-gray-500" />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {result.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {result.year || 'Unknown'} • {result.mediaType === 'movie' ? 'Movie' : 'TV Series'}
        </p>
      </div>
    </motion.div>
  );
}
