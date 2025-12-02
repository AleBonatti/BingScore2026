/**
 * MediaDetailPage Component
 * Displays aggregated ratings for a media item
 */

import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { useMediaAggregation } from '../hooks/useMediaAggregation';
import MediaDetailHeader from '../components/media/MediaDetailHeader';
import OverallRatingsPanel from '../components/media/OverallRatingsPanel';
import type { MediaType } from '@/lib/types/domain';

export default function MediaDetailPage() {
  const { mediaType, tmdbId } = useParams<{ mediaType: string; tmdbId: string }>();

  const parsedTmdbId = parseInt(tmdbId || '0', 10);
  const validMediaType = (mediaType === 'movie' || mediaType === 'tv' ? mediaType : 'movie') as MediaType;

  const { data, isLoading, error } = useMediaAggregation(parsedTmdbId, validMediaType);

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
      />
      <OverallRatingsPanel ratings={data} />
    </div>
  );
}
