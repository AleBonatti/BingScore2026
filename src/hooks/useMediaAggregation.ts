/**
 * useMediaAggregation Hook
 * TanStack Query hook for media aggregation endpoint
 */

import { useQuery } from '@tanstack/react-query';
import type { AggregateResponse } from '@/lib/types/api';
import type { MediaType } from '@/lib/types/domain';

export function useMediaAggregation(tmdbId: number, mediaType: MediaType) {
  return useQuery({
    queryKey: ['media-aggregate', tmdbId, mediaType],
    queryFn: async (): Promise<AggregateResponse> => {
      const response = await fetch(
        `/api/media/aggregate?tmdbId=${tmdbId}&mediaType=${mediaType}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch aggregated ratings');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
