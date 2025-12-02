/**
 * useSearch Hook
 * TanStack Query hook for search endpoint
 */

import { useQuery } from '@tanstack/react-query';
import type { SearchResponse } from '@/lib/types/api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResponse> => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
