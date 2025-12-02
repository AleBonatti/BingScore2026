/**
 * AutocompleteResults Component
 * Floating panel with search results and animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import SearchResultItem from './SearchResultItem';
import type { SearchResult } from '@/lib/types/domain';

interface AutocompleteResultsProps {
  results: SearchResult[];
  isVisible: boolean;
}

export default function AutocompleteResults({ results, isVisible }: AutocompleteResultsProps) {
  if (!isVisible || results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-96 overflow-y-auto"
      >
        <div className="p-2">
          {results.map((result) => (
            <SearchResultItem key={`${result.mediaType}-${result.tmdbId}`} result={result} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
