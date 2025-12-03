/**
 * MediaDetailHeader Component
 * Displays poster, title, year, overview, and ratings
 */

import RatingCard from './RatingCard';
import type { AggregatedRatings } from '@/lib/types/domain';

interface MediaDetailHeaderProps {
  title: string;
  year?: number;
  overview?: string;
  posterUrl?: string | null;
  mediaType: 'movie' | 'tv';
  ratings: AggregatedRatings;
}

export default function MediaDetailHeader({
  title,
  year,
  overview,
  posterUrl,
  mediaType,
  ratings,
}: MediaDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {posterUrl && (
        <div className="shrink-0">
          <img src={posterUrl} alt={title} className="w-full md:w-64 h-auto rounded-lg shadow-lg" />
        </div>
      )}
      <div className="flex-1">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {mediaType === 'movie' ? 'Movie' : 'TV Series'}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        {year && <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{year}</p>}
        {overview && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{overview}</p>
        )}

        {/* Ratings Section */}
        <div>
          {/* <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ratings</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RatingCard rating={ratings.overall.imdb || null} />
            <RatingCard rating={ratings.overall.tmdb || null} />
            <RatingCard rating={ratings.overall.trakt || null} />
          </div>
        </div>
      </div>
    </div>
  );
}
