/**
 * Episode Merge Logic
 * Combines TMDB and Trakt episode ratings side-by-side
 */

import type { EpisodeRatingEntry } from '@/lib/types/domain.js';

export function mergeEpisodeRatings(
  tmdbEpisodes: EpisodeRatingEntry[],
  traktEpisodes: EpisodeRatingEntry[]
): Record<number, EpisodeRatingEntry[]> {
  // Create a map for quick lookup
  const episodeMap = new Map<string, EpisodeRatingEntry>();

  // Add TMDB episodes
  tmdbEpisodes.forEach((episode) => {
    const key = `${episode.seasonNumber}-${episode.episodeNumber}`;
    episodeMap.set(key, { ...episode });
  });

  // Merge Trakt episodes
  traktEpisodes.forEach((episode) => {
    const key = `${episode.seasonNumber}-${episode.episodeNumber}`;
    const existing = episodeMap.get(key);

    if (existing) {
      // Merge scores
      existing.traktScore = episode.traktScore;
      // Use Trakt title if TMDB title is missing
      if (!existing.title && episode.title) {
        existing.title = episode.title;
      }
    } else {
      // Add new episode from Trakt
      episodeMap.set(key, { ...episode });
    }
  });

  // Group by season
  const episodesBySeason: Record<number, EpisodeRatingEntry[]> = {};

  episodeMap.forEach((episode) => {
    const seasonNum = episode.seasonNumber;
    if (!episodesBySeason[seasonNum]) {
      episodesBySeason[seasonNum] = [];
    }
    episodesBySeason[seasonNum].push(episode);
  });

  // Sort episodes within each season by episode number
  Object.keys(episodesBySeason).forEach((seasonKey) => {
    const seasonNum = parseInt(seasonKey, 10);
    if (episodesBySeason[seasonNum]) {
      episodesBySeason[seasonNum].sort((a, b) => a.episodeNumber - b.episodeNumber);
    }
  });

  return episodesBySeason;
}
