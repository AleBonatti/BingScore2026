/**
 * Tests for chart data transformation utility
 */

import { describe, it, expect } from 'vitest';
import { transformEpisodesToChartData } from './chart-data';
import type { EpisodeRatingEntry } from '../types/domain';

describe('transformEpisodesToChartData', () => {
  it('should transform valid episode data correctly', () => {
    const episodes: EpisodeRatingEntry[] = [
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Pilot',
        tmdbScore: 8.5,
        traktScore: 8.2,
      },
      {
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'Cat\'s in the Bag...',
        tmdbScore: 8.3,
        traktScore: 8.1,
      },
    ];

    const result = transformEpisodesToChartData(episodes);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      episode: 1,
      title: 'Pilot',
      tmdb: 8.5,
      trakt: 8.2,
    });
    expect(result[1]).toEqual({
      episode: 2,
      title: 'Cat\'s in the Bag...',
      tmdb: 8.3,
      trakt: 8.1,
    });
  });

  it('should convert undefined scores to null', () => {
    const episodes: EpisodeRatingEntry[] = [
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Pilot',
        tmdbScore: 8.5,
        traktScore: undefined,
      },
    ];

    const result = transformEpisodesToChartData(episodes);

    expect(result[0].tmdb).toBe(8.5);
    expect(result[0].trakt).toBeNull();
  });

  it('should handle episodes without titles', () => {
    const episodes: EpisodeRatingEntry[] = [
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: '',
        tmdbScore: 8.5,
        traktScore: 8.2,
      },
    ];

    const result = transformEpisodesToChartData(episodes);

    expect(result[0].title).toBe('Episode 1');
  });

  it('should sort episodes by episode number', () => {
    const episodes: EpisodeRatingEntry[] = [
      {
        seasonNumber: 1,
        episodeNumber: 3,
        title: 'Third',
        tmdbScore: 8.5,
        traktScore: 8.2,
      },
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'First',
        tmdbScore: 8.3,
        traktScore: 8.1,
      },
      {
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'Second',
        tmdbScore: 8.4,
        traktScore: 8.0,
      },
    ];

    const result = transformEpisodesToChartData(episodes);

    expect(result[0].episode).toBe(1);
    expect(result[1].episode).toBe(2);
    expect(result[2].episode).toBe(3);
  });

  it('should handle empty array', () => {
    const result = transformEpisodesToChartData([]);
    expect(result).toEqual([]);
  });

  it('should handle episodes with both scores missing', () => {
    const episodes: EpisodeRatingEntry[] = [
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Pilot',
        tmdbScore: undefined,
        traktScore: undefined,
      },
    ];

    const result = transformEpisodesToChartData(episodes);

    expect(result[0].tmdb).toBeNull();
    expect(result[0].trakt).toBeNull();
  });

  it('should handle null scores correctly', () => {
    const episodes: EpisodeRatingEntry[] = [
      {
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Pilot',
        tmdbScore: null,
        traktScore: null,
      },
    ];

    const result = transformEpisodesToChartData(episodes);

    expect(result[0].tmdb).toBeNull();
    expect(result[0].trakt).toBeNull();
  });
});
