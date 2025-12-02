/**
 * Zod Validation Schemas
 * Based on data-model.md specification
 */

import { z } from 'zod';

// Domain Schemas
export const MediaTypeSchema = z.enum(['movie', 'tv']);

export const SearchResultSchema = z.object({
  provider: z.literal('tmdb'),
  tmdbId: z.number().int().positive(),
  imdbId: z
    .string()
    .regex(/^tt\d+$/)
    .nullable()
    .optional(),
  mediaType: MediaTypeSchema,
  title: z.string().min(1),
  originalTitle: z.string().optional(),
  year: z.number().int().min(1800).max(2100).optional(),
  overview: z.string().optional(),
  posterUrl: z.string().nullable().optional(),
  backdropUrl: z.string().nullable().optional(),
});

export const UnifiedMediaIdSchema = z
  .object({
    mediaType: MediaTypeSchema,
    tmdbId: z.number().int().positive().optional(),
    imdbId: z
      .string()
      .regex(/^tt\d+$/)
      .optional(),
    traktId: z.string().min(1).optional(),
  })
  .refine((data) => data.tmdbId || data.imdbId || data.traktId, {
    message: 'At least one ID must be present',
  });

export const OverallRatingSchema = z.object({
  source: z.enum(['tmdb', 'imdb', 'trakt']),
  score: z.number().min(0).max(10).nullable(),
  votes: z.number().int().nonnegative().nullable().optional(),
});

export const EpisodeRatingEntrySchema = z.object({
  seasonNumber: z.number().int().nonnegative(),
  episodeNumber: z.number().int().positive(),
  title: z.string().optional(),
  tmdbScore: z.number().min(0).max(10).nullable().optional(),
  traktScore: z.number().min(0).max(10).nullable().optional(),
});

export const AggregatedRatingsSchema = z.object({
  ids: UnifiedMediaIdSchema,
  title: z.string().min(1),
  year: z.number().int().min(1800).max(2100).optional(),
  mediaType: MediaTypeSchema,
  overview: z.string().optional(),
  posterUrl: z.string().nullable().optional(),
  overall: z.object({
    tmdb: OverallRatingSchema.nullable().optional(),
    imdb: OverallRatingSchema.nullable().optional(),
    trakt: OverallRatingSchema.nullable().optional(),
  }),
  episodesBySeason: z
    .record(z.string(), z.array(EpisodeRatingEntrySchema))
    .optional(),
});
