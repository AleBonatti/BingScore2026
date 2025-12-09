/**
 * EpisodeChart Component
 * Displays line chart with TMDB and Trakt episode ratings
 */

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader } from 'lucide-react';
import { transformEpisodesToChartData, type EpisodeChartPoint } from '@/src/lib/utils/chart-data';
import type { EpisodeRatingEntry } from '@/lib/types/domain';

interface EpisodeChartProps {
  episodes: EpisodeRatingEntry[];
  seasonNumber: number;
  isLoading?: boolean;
}

interface ChartColors {
  tmdb: string;
  trakt: string;
  grid: string;
  text: string;
  background: string;
}

/**
 * Custom tooltip component for episode chart
 * Shows episode number, title, and ratings from both providers
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  // Extract episode title from payload (it's in the data point)
  const episodeTitle = payload[0]?.payload?.title || '';

  return (
    <div
      className={`p-3 border rounded shadow-lg ${
        isDark
          ? 'bg-slate-800 border-slate-600 text-white'
          : 'bg-white border-gray-300 text-gray-900'
      }`}
    >
      <p className="text-sm font-semibold mb-1">Episode {label}</p>
      {episodeTitle && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{episodeTitle}</p>
      )}
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.value !== null && entry.value !== undefined
            ? `${entry.name}: ${(entry.value as number).toFixed(1)}/10`
            : `${entry.name}: N/A`}
        </p>
      ))}
    </div>
  );
}

export default function EpisodeChart({
  episodes,
  seasonNumber,
  isLoading = false,
}: EpisodeChartProps) {
  const [chartData, setChartData] = useState<EpisodeChartPoint[]>([]);
  const [colors, setColors] = useState<ChartColors>({
    tmdb: '#3b82f6',
    trakt: '#ef4444',
    grid: '#e5e7eb',
    text: '#1f2937',
    background: '#ffffff',
  });

  // Transform episode data for chart
  useEffect(() => {
    if (episodes && episodes.length > 0) {
      const transformed = transformEpisodesToChartData(episodes);
      setChartData(transformed);
    } else {
      setChartData([]);
    }
  }, [episodes]);

  // Detect dark mode and update colors
  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');

      if (isDark) {
        setColors({
          tmdb: '#60a5fa',
          trakt: '#f87171',
          grid: '#334155',
          text: '#f1f5f9',
          background: '#242423',
        });
      } else {
        setColors({
          tmdb: '#3b82f6',
          trakt: '#ef4444',
          grid: '#e5e7eb',
          text: '#1f2937',
          background: '#ffffff',
        });
      }
    };

    // Initial call
    updateColors();

    // Listen for class changes (when dark mode toggle is clicked)
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Also listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateColors);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateColors);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading episode ratings...</p>
        </div>
      </div>
    );
  }

  // Empty state or error handling
  if (!chartData || chartData.length === 0) {
    return null; // Hide chart when no data available
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 40, right: 30, left: 0, bottom: 10 }}
          key={`chart-${seasonNumber}`}
          style={{ backgroundColor: colors.background }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
          <XAxis dataKey="episode" type="number" stroke={colors.text} />
          <YAxis domain={[0, 10]} stroke={colors.text} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: colors.text }} />
          <Line
            type="monotone"
            name="TMDB"
            dataKey="tmdb"
            stroke={colors.tmdb}
            connectNulls
            isAnimationActive={!isLoading}
            animationDuration={300}
            animationEasing="ease-in-out"
            strokeWidth={2}
            dot={{ fill: colors.tmdb, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            name="Trakt"
            dataKey="trakt"
            stroke={colors.trakt}
            connectNulls
            isAnimationActive={!isLoading}
            animationDuration={300}
            animationEasing="ease-in-out"
            strokeWidth={2}
            dot={{ fill: colors.trakt, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
