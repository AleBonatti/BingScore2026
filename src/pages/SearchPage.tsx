/**
 * SearchPage Component
 * Home page with search functionality
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';
import { useSearch } from '../hooks/useSearch';
import SearchBar from '../components/search/SearchBar';
import AutocompleteResults from '../components/search/AutocompleteResults';

export default function SearchPage() {
  const [inputValue, setInputValue] = useState('');
  const debouncedQuery = useDebounce(inputValue, 300);
  const { data, isLoading, error } = useSearch(debouncedQuery);

  // Show error toast if search fails
  if (error) {
    toast.error('Failed to fetch search results. Please try again.');
  }

  const showResults = debouncedQuery.length >= 2;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Find Your Next Binge
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search for TV series or movies and compare ratings from TMDB, IMDb, and Trakt
        </p>
      </div>

      <div className="relative">
        <SearchBar value={inputValue} onChange={setInputValue} isLoading={isLoading} />
        <AutocompleteResults results={data || []} isVisible={showResults} />
      </div>

      {showResults && data && data.length === 0 && (
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
          No results found for "{debouncedQuery}"
        </div>
      )}
    </div>
  );
}
