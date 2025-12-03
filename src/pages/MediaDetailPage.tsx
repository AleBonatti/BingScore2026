/**
 * MediaDetailPage Component
 * Displays aggregated ratings for a media item
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { useMediaAggregation } from '../hooks/useMediaAggregation';
import MediaDetailHeader from '../components/media/MediaDetailHeader';
import SeasonSelector from '../components/media/SeasonSelector';
import EpisodeRatingsDisplay from '../components/media/EpisodeRatingsDisplay';
import EpisodeChart from '../components/media/EpisodeChart';
import type { MediaType } from '@/lib/types/domain';

export default function MediaDetailPage() {
  const { mediaType, tmdbId } = useParams<{ mediaType: string; tmdbId: string }>();

  const parsedTmdbId = parseInt(tmdbId || '0', 10);
  const validMediaType = (
    mediaType === 'movie' || mediaType === 'tv' ? mediaType : 'movie'
  ) as MediaType;

  const { data, isLoading, error } = useMediaAggregation(parsedTmdbId, validMediaType);

  // State for selected season
  // Filter out Season 0 (specials) from display - data is preserved for future use
  const seasons = data?.episodesBySeason
    ? Object.keys(data.episodesBySeason)
        .map(Number)
        .filter((season) => season > 0) // Exclude Season 0 (specials)
        .sort((a, b) => a - b)
    : [];
  const [selectedSeason, setSelectedSeason] = useState(seasons[0] || 1);

  // Show error toast if aggregation fails
  if (error) {
    toast.error('Failed to load ratings. Please try again.');
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading ratings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Media not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <MediaDetailHeader
        title={data.title}
        year={data.year}
        overview={data.overview}
        posterUrl={data.posterUrl}
        mediaType={data.mediaType}
        ratings={data}
      />

      {/* Episode Ratings Section (TV Series Only) */}
      {data.mediaType === 'tv' && data.episodesBySeason && seasons.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Episode Ratings</h2>
          <SeasonSelector
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSelectSeason={setSelectedSeason}
          />

          {/* Episode Chart (positioned above table) */}
          <div className="mb-6">
            <EpisodeChart
              episodes={data.episodesBySeason[selectedSeason] || []}
              seasonNumber={selectedSeason}
              isLoading={isLoading}
            />
          </div>

          {/* Episode Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <EpisodeRatingsDisplay
              episodes={data.episodesBySeason[selectedSeason] || []}
              seasonNumber={selectedSeason}
            />
          </div>
        </div>
      )}
    </div>
  );
}
