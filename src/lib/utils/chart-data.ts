/**
 * Chart Data Transformation Utilities
 * Transforms Phase 1 episode data into Recharts-compatible format
 */

import type { EpisodeRatingEntry } from '@/lib/types/domain';

/**
 * Chart-optimized representation of an episode rating.
 * Used by Recharts LineChart to render TMDB and Trakt lines.
 */
export interface EpisodeChartPoint {
  /** Episode number (X-axis) */
  episode: number;

  /** Episode title for tooltip display */
  title: string;

  /** TMDB rating (Y-axis, blue line) or null if unavailable */
  tmdb: number | null;

  /** Trakt rating (Y-axis, red line) or null if unavailable */
  trakt: number | null;
}

/**
 * Transform Phase 1 episode data into Recharts-compatible format.
 *
 * @param episodes - Array of EpisodeRatingEntry from Phase 1 API
 * @returns Array of EpisodeChartPoint sorted by episode number
 *
 * @example
 * const episodes: EpisodeRatingEntry[] = [
 *   { seasonNumber: 1, episodeNumber: 1, title: "Pilot", tmdbScore: 8.5, traktScore: 8.2 },
 *   { seasonNumber: 1, episodeNumber: 2, title: "Episode 2", tmdbScore: 8.7, traktScore: null },
 * ];
 *
 * const chartData = transformEpisodesToChartData(episodes);
 * // Result:
 * // [
 * //   { episode: 1, title: "Pilot", tmdb: 8.5, trakt: 8.2 },
 * //   { episode: 2, title: "Episode 2", tmdb: 8.7, trakt: null },
 * // ]
 */
export function transformEpisodesToChartData(
  episodes: EpisodeRatingEntry[]
): EpisodeChartPoint[] {
  // First, sort episodes by their episode number
  const sorted = episodes.slice().sort((a, b) => a.episodeNumber - b.episodeNumber);

  // Transform and re-index to ensure episodes always start from 1
  // This handles cases where API might return absolute episode numbers
  return sorted.map((ep, index) => ({
    episode: index + 1, // Always start from 1, increment by 1
    title: ep.title || `Episode ${index + 1}`, // Use re-indexed number in fallback
    tmdb: ep.tmdbScore ?? null, // Convert undefined to null
    trakt: ep.traktScore ?? null, // Convert undefined to null
  }));
}
