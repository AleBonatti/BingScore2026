/**
 * SearchBar Component
 * Input field with search icon and debounced onChange
 */

import { Search, Loader } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ value, onChange, isLoading }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isLoading ? (
          <Loader className="h-5 w-5 text-dust-gray animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-dust-gray" />
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for TV series or movies..."
        className="block w-full pl-10 pr-3 py-3 rounded-lg leading-5 bg-white dark:bg-shadow-gray placeholder-gray-500 dark:placeholder-disabled focus:outline-none focus:ring-2 focus:ring-tuscan-sun focus:border-tuscan-sun text-gray-900 dark:text-dust-gray"
      />
    </div>
  );
}
