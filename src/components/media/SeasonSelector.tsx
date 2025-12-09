/**
 * SeasonSelector Component
 * Horizontal pill buttons for season navigation
 */

import { motion } from 'framer-motion';

interface SeasonSelectorProps {
  seasons: number[];
  selectedSeason: number;
  onSelectSeason: (season: number) => void;
}

export default function SeasonSelector({
  seasons,
  selectedSeason,
  onSelectSeason,
}: SeasonSelectorProps) {
  if (seasons.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-ivory mb-3">Select Season</h3>
      <div className="flex flex-wrap gap-2">
        {seasons.map((season) => (
          <motion.button
            key={season}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectSeason(season)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              selectedSeason === season
                ? 'bg-tuscan-sun text-grafite shadow-md'
                : 'bg-gray-200 dark:bg-shadow-gray text-dust-gray dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Season {season}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
