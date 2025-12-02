/**
 * EpisodeRatingsDisplay Component
 * Displays episode ratings table for selected season
 */

import type { EpisodeRatingEntry } from '@/lib/types/domain';

interface EpisodeRatingsDisplayProps {
  episodes: EpisodeRatingEntry[];
  seasonNumber: number;
}

export default function EpisodeRatingsDisplay({
  episodes,
  seasonNumber,
}: EpisodeRatingsDisplayProps) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No episode ratings available for Season {seasonNumber}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Episode
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              TMDB
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Trakt
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {episodes.map((episode) => (
            <tr
              key={`${episode.seasonNumber}-${episode.episodeNumber}`}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {episode.episodeNumber}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                {episode.title || 'Unknown'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                {episode.tmdbScore !== null && episode.tmdbScore !== undefined ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {episode.tmdbScore.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">N/A</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                {episode.traktScore !== null && episode.traktScore !== undefined ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    {episode.traktScore.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
