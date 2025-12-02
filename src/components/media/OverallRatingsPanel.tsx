/**
 * OverallRatingsPanel Component
 * Displays all three rating sources side by side
 */

import RatingCard from './RatingCard';
import type { AggregatedRatings } from '@/lib/types/domain';

interface OverallRatingsPanelProps {
  ratings: AggregatedRatings;
}

export default function OverallRatingsPanel({ ratings }: OverallRatingsPanelProps) {
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ratings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RatingCard rating={ratings.overall.tmdb || null} />
        <RatingCard rating={ratings.overall.imdb || null} />
        <RatingCard rating={ratings.overall.trakt || null} />
      </div>
    </div>
  );
}
