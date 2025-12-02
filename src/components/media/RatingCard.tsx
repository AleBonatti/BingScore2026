/**
 * RatingCard Component
 * Displays rating from a single source with icon and styling
 */

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { OverallRating } from '@/lib/types/domain';

interface RatingCardProps {
  rating: OverallRating | null;
}

const sourceLabels = {
  tmdb: 'TMDB',
  imdb: 'IMDb',
  trakt: 'Trakt',
};

const sourceColors = {
  tmdb: 'from-blue-500 to-blue-600',
  imdb: 'from-yellow-500 to-yellow-600',
  trakt: 'from-red-500 to-red-600',
};

export default function RatingCard({ rating }: RatingCardProps) {
  if (!rating) return null;

  const hasScore = rating.score !== null && rating.score !== undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {sourceLabels[rating.source]}
        </h3>
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      </div>

      {hasScore ? (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className={`text-4xl font-bold bg-gradient-to-br ${sourceColors[rating.source]} bg-clip-text text-transparent`}
            >
              {rating.score?.toFixed(1) ?? '—'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">/ 10</span>
          </div>
          {rating.votes && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rating.votes.toLocaleString()} votes
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Not available</p>
      )}
    </motion.div>
  );
}
