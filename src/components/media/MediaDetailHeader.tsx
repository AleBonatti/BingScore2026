/**
 * MediaDetailHeader Component
 * Displays poster, title, year, and overview
 */

interface MediaDetailHeaderProps {
  title: string;
  year?: number;
  overview?: string;
  posterUrl?: string | null;
  mediaType: 'movie' | 'tv';
}

export default function MediaDetailHeader({
  title,
  year,
  overview,
  posterUrl,
  mediaType,
}: MediaDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {posterUrl && (
        <div className="flex-shrink-0">
          <img src={posterUrl} alt={title} className="w-full md:w-64 h-auto rounded-lg shadow-lg" />
        </div>
      )}
      <div className="flex-1">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {mediaType === 'movie' ? 'Movie' : 'TV Series'}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        {year && <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{year}</p>}
        {overview && <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{overview}</p>}
      </div>
    </div>
  );
}
