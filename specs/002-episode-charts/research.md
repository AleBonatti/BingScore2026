# Research: Recharts Library Integration for BingeScore Phase 2 Episode Charts

**Completed**: 2025-12-03
**Scope**: Technical investigation for episode rating charts in React + TypeScript + Tailwind v4
**Status**: Ready for implementation

---

## 1. Recharts TypeScript Integration

### Decision
**Use Recharts v3.5.1+ with built-in TypeScript definitions; @types/recharts is not needed.**

### Rationale
- Recharts provides its own complete TypeScript type definitions (since v2+)
- The @types/recharts package is now just a stub that redirects to built-in types
- Recharts requires TypeScript 3.8+ (we have strict mode enabled, which is fully supported)
- Recent versions (v3.0+) have improved TypeScript support with stricter type checking
- React 18 is fully supported in current versions

### Key Type Information

**Main LineChart Component Types:**
- `LineChart` - wrapper component accepting `data`, `width`, `height`, `margin`, `syncId`
- `Line` - renderable line within chart accepting `dataKey`, `stroke`, `connectNulls`, `isAnimationActive`, `animationDuration`, `animationEasing`
- `XAxis`, `YAxis` - axis components with `dataKey`, `type` props
- `Tooltip`, `Legend` - interactive components with customization props
- `ResponsiveContainer` - responsive wrapper with `width`, `height`, `minWidth`, `minHeight`, `debounce`

**Custom Component Props:**
```typescript
// TooltipContentProps for custom tooltip components (v3+)
interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{name: string; value: number}>;
  label?: string;
}

// LineProps for custom Line styling
interface LineProps {
  type?: 'monotone' | 'basis' | 'linear' | 'step';
  stroke?: string;
  strokeWidth?: number;
  connectNulls?: boolean;
  isAnimationActive?: boolean;
  animationDuration?: number;
  animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  dot?: boolean | object | React.ReactNode;
}
```

### Example: Basic TypeScript Setup

```typescript
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
  episode: number;
  title: string;
  tmdb: number | null;
  trakt: number | null;
}

interface EpisodeChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

const EpisodeChart: React.FC<EpisodeChartProps> = ({ data, isLoading }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="episode" type="number" />
        <YAxis domain={[0, 10]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="tmdb"
          stroke="#3b82f6"
          connectNulls
          isAnimationActive={!isLoading}
          animationDuration={300}
        />
        <Line
          type="monotone"
          dataKey="trakt"
          stroke="#ef4444"
          connectNulls
          isAnimationActive={!isLoading}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{name: string; value: number}>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-2 border border-gray-300 dark:border-slate-600 rounded">
      <p className="text-sm font-semibold">{`Episode ${label}`}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="text-xs">
          {`${entry.name}: ${entry.value}`}
        </p>
      ))}
    </div>
  );
};
```

### Alternatives Considered
1. **Use @types/recharts**: Unnecessary overhead; Recharts provides native types
2. **Generate types from D3**: Too complex; Recharts already handles this
3. **Use `any` types**: Breaks strict mode; not recommended

### Installation
```bash
npm install recharts
# DO NOT install @types/recharts
```

**Sources:**
- [recharts - npm](https://www.npmjs.com/package/recharts)
- [A Guide to Creating Charts in React with TypeScript](https://medium.com/@asyncme/a-guide-to-creating-charts-in-react-with-typescript-8ac9fd17fa74)
- [Recharts TypeScript Hygiene · GitHub Issue #3925](https://github.com/recharts/recharts/issues/3925)

---

## 2. Missing Data Handling

### Decision
**Use `connectNulls={true}` on Line components with explicit null/undefined filtering in data transformation.**

### Rationale
- Recharts treats null and undefined equally; both create gaps in data
- `connectNulls={true}` connects data points across missing values while still showing visual gaps
- `connectNulls={false}` (default) breaks the line at null points, creating gaps
- For episode charts, we need to show rating trends even when one provider is missing data
- Gap visibility makes it clear which provider has missing data (visual indication without explicit markers)
- Tooltip behavior: hovering over gaps shows "No data" or the provider info if available

### Behavior Comparison

**connectNulls={false} (default):**
```
TMDB: ●────●────●         ●────●    (broken at missing point)
Trakt:      ●────●────●────●        (broken where no data)
```

**connectNulls={true}:**
```
TMDB: ●────●────●────────●────●     (line continues across gap)
Trakt:      ●────●────●────●        (line continues across gap)
```

### Data Transformation Pattern

```typescript
interface EpisodeRating {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  tmdbScore: number | null;
  traktScore: number | null;
}

interface ChartDataPoint {
  episode: number;
  title: string;
  tmdb: number | null;
  trakt: number | null;
}

// Transform episode data for chart display
const transformEpisodeData = (episodes: EpisodeRating[]): ChartDataPoint[] => {
  return episodes.map(ep => ({
    episode: ep.episodeNumber,
    title: ep.title,
    tmdb: ep.tmdbScore,  // Keep null explicitly for proper Recharts handling
    trakt: ep.traktScore, // Keep null explicitly for proper Recharts handling
  }));
};

// Filter episodes with at least one rating available
const hasAnyRating = (point: ChartDataPoint): boolean => {
  return point.tmdb !== null || point.trakt !== null;
};

// Usage: only render chart if any episodes have ratings
const chartData = transformEpisodeData(episodes).filter(hasAnyRating);
const shouldShowChart = chartData.length > 0;
```

### Advanced: Visual Gap Indication (Optional)

If you want to explicitly mark missing data with a dashed line instead of relying on connectNulls behavior:

```typescript
// Add visual indicator for missing data
const enrichEpisodeData = (episodes: EpisodeRating[]) => {
  return episodes.map(ep => ({
    episode: ep.episodeNumber,
    title: ep.title,
    tmdb: ep.tmdbScore,
    trakt: ep.traktScore,
    hasBothRatings: ep.tmdbScore !== null && ep.traktScore !== null,
    hasAnyRating: ep.tmdbScore !== null || ep.traktScore !== null,
  }));
};

// Can then style lines conditionally based on hasBothRatings flag
```

### Tooltip with Missing Data

```typescript
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 border border-gray-300 dark:border-slate-600 rounded shadow-lg">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{`Episode ${label}`}</p>
      {payload?.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.value !== null
            ? `${entry.name}: ${entry.value.toFixed(1)}`
            : `${entry.name}: No rating available`
          }
        </p>
      ))}
    </div>
  );
};
```

### Edge Cases Handled
1. **All episodes missing data from one provider**: Show only the available provider line; legend shows both
2. **One episode with no ratings**: Still appears on X-axis; both lines show null at that point
3. **All episodes missing all data**: Chart should not render (handled at parent level with shouldShowChart check)
4. **Y-axis scale with sparse data**: Recharts auto-adjusts; domain={[0, 10]} enforces visible 0-10 scale

### Gotchas
- **Resize bug**: Known issue (#748) where nulls may incorrectly connect after resize even with connectNulls={false}. Mitigation: ensure LineChart has explicit width/height through ResponsiveContainer
- **Grid lines for null points**: Grid still renders tick marks for null values; this is expected behavior
- **Tooltip on gaps**: Hovering over a gap may not show tooltip; this is correct behavior (user should hover over actual data points)

**Sources:**
- [Recharts connectNulls · GitHub Issue #748](https://github.com/recharts/recharts/issues/748)
- [Chart break when data is null · GitHub Issue #702](https://github.com/recharts/recharts/issues/702)
- [Recharts connect disconnected lines · Stack Overflow](https://stackoverflow.com/questions/70574594/recharts-join-disconnected-lines)

---

## 3. Dark Mode Support

### Decision
**Use CSS variables with Tailwind v4 for dynamic dark mode theming; Recharts accepts hex colors via props.**

### Rationale
- Recharts doesn't natively support Tailwind dark: classes; it needs explicit color values
- CSS variables allow centralized theme management and dynamic switching without re-rendering
- Tailwind v4 fully supports CSS variables with simplified syntax (no hsl() wrapper needed)
- We can detect dark mode via `useEffect` + `window.matchMedia` or `document.documentElement.classList`
- Props-based theming (passing colors directly) is more reliable than expecting CSS variables in stroke attribute

### Implementation Pattern

**CSS Variables in Global Styles:**

```css
/* In your global CSS file or <style> tag */
:root {
  --chart-tmdb: #3b82f6;      /* Blue for TMDB */
  --chart-trakt: #ef4444;     /* Red for Trakt */
  --chart-bg: #ffffff;         /* Light background */
  --chart-grid: #e5e7eb;      /* Light grid */
  --chart-text: #1f2937;      /* Dark text for light mode */
}

html.dark {
  --chart-tmdb: #60a5fa;      /* Lighter blue for dark mode */
  --chart-trakt: #f87171;     /* Lighter red for dark mode */
  --chart-bg: #1e293b;        /* Dark background */
  --chart-grid: #334155;      /* Dark grid */
  --chart-text: #f1f5f9;      /* Light text for dark mode */
}
```

**React Component with Dynamic Colors:**

```typescript
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartColors {
  tmdb: string;
  trakt: string;
  grid: string;
  text: string;
  background: string;
}

const EpisodeChart: React.FC<EpisodeChartProps> = ({ data, isLoading }) => {
  const [colors, setColors] = useState<ChartColors>({
    tmdb: '#3b82f6',
    trakt: '#ef4444',
    grid: '#e5e7eb',
    text: '#1f2937',
    background: '#ffffff',
  });

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
          background: '#1e293b',
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

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        style={{ backgroundColor: colors.background }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.grid}
          opacity={0.5}
        />
        <XAxis
          dataKey="episode"
          type="number"
          stroke={colors.text}
        />
        <YAxis
          domain={[0, 10]}
          stroke={colors.text}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: colors.text }}
        />
        <Line
          type="monotone"
          name="TMDB"
          dataKey="tmdb"
          stroke={colors.tmdb}
          connectNulls
          isAnimationActive={!isLoading}
          animationDuration={300}
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
          dot={{ fill: colors.trakt, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### Custom Tooltip for Dark Mode

```typescript
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className={`
      p-3 border rounded shadow-lg
      ${isDark
        ? 'bg-slate-800 border-slate-600 text-white'
        : 'bg-white border-gray-300 text-gray-900'
      }
    `}>
      <p className="text-sm font-semibold">{`Episode ${label}`}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.value !== null
            ? `${entry.name}: ${entry.value.toFixed(1)}`
            : `${entry.name}: No rating`
          }
        </p>
      ))}
    </div>
  );
};
```

### Tailwind Dark Mode Configuration

**Expected tailwind.config.ts (for reference):**

```typescript
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'selector' with custom class
  theme: {
    extend: {
      colors: {
        chart: {
          tmdb: 'var(--chart-tmdb)',
          trakt: 'var(--chart-trakt)',
          grid: 'var(--chart-grid)',
          text: 'var(--chart-text)',
          bg: 'var(--chart-bg)',
        }
      }
    },
  },
  plugins: [],
}
```

### Why Not Tailwind dark: Classes?

Recharts components accept `stroke`, `fill`, and color props that expect hex/rgb values, not class names. While you could theoretically use CSS-in-JS to generate Tailwind classes, it's simpler and more reliable to:
1. Define colors via CSS variables at the document level
2. Use JavaScript to read those variables and pass them as props
3. This gives Recharts the explicit color values it expects

### Alternatives Considered
1. **Hard-coded color values**: Not flexible; requires code changes to switch themes
2. **CSS classes with complex selectors**: Recharts doesn't support class-based theming easily
3. **useContext for colors**: Excessive overhead; CSS variables are simpler
4. **Recharts' rechartWrapper className**: Limited styling capabilities; prefer prop-based approach

**Sources:**
- [Dark mode - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/dark-mode)
- [Tailwind v4 - shadcn/ui](https://ui.shadcn.com/docs/tailwind-v4)
- [Dark Mode with Design Tokens in Tailwind CSS](https://www.richinfante.com/2024/10/21/tailwind-dark-mode-design-tokens-in-tailwind-css)
- [Simple dark mode support with Tailwind & CSS variables](https://invertase.io/blog/tailwind-dark-mode)

---

## 4. Animation Configuration

### Decision
**Use Recharts built-in animation with `isAnimationActive`, `animationDuration={300}`, and `animationEasing='ease-in-out'`. No Framer Motion integration needed for basic fade-in.**

### Rationale
- Recharts has full animation support with configurable duration and easing
- Built-in animations are performant (use CSS/SVG animations, not JavaScript)
- 300ms duration matches your specification exactly
- Linear fade-in effect is achievable with standard easing functions
- Framer Motion would be overkill for a single fade-in effect; adds unnecessary dependency

### Animation Props Behavior

**Key Animation Properties:**

```typescript
// Available on Line, Area, Bar, and other data components
isAnimationActive?: boolean;           // Default: true
animationDuration?: number;            // Default: 1500ms, we set to 300ms
animationEasing?: string;              // Default: 'ease'
animationBegin?: number;               // Default: 0ms (delay before animation starts)
animationEnd?: number;                 // For advanced timing
```

**Easing Options (standard CSS animations):**
- `'ease'` (default): Slow start and end, fast in middle
- `'ease-in'`: Slow start, accelerates to end
- `'ease-out'`: Fast start, decelerates to end
- `'ease-in-out'`: Slow start and end (similar to ease)
- `'linear'`: Constant speed throughout

### Implementation Pattern

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EpisodeChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
  selectedSeason?: number;
}

const EpisodeChart: React.FC<EpisodeChartProps> = ({ data, isLoading, selectedSeason }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        key={`chart-${selectedSeason}`}  // Force re-mount for animation on season change
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="episode" type="number" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Legend />

        {/* TMDB Line with 300ms fade-in animation */}
        <Line
          type="monotone"
          name="TMDB"
          dataKey="tmdb"
          stroke="#3b82f6"
          connectNulls

          // Animation configuration
          isAnimationActive={!isLoading}        // Disable during loading
          animationDuration={300}               // 300ms as specified
          animationEasing="ease-in-out"         // Smooth fade-in
          animationBegin={0}                    // Start immediately

          // Visual styling
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />

        {/* Trakt Line with same animation config */}
        <Line
          type="monotone"
          name="Trakt"
          dataKey="trakt"
          stroke="#ef4444"
          connectNulls

          // Animation configuration
          isAnimationActive={!isLoading}
          animationDuration={300}
          animationEasing="ease-in-out"
          animationBegin={0}

          // Visual styling
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### Animation During Season Change

To ensure animation occurs when switching seasons, you have two options:

**Option 1: Force Re-mount (Recommended)**
```typescript
// Force Recharts to re-mount by changing key
<LineChart
  key={`chart-${selectedSeason}`}
  // ... rest of props
>
```

**Option 2: Detect Data Change**
```typescript
// Use prev/next data comparison
const [prevDataKey, setPrevDataKey] = useState(null);

useEffect(() => {
  if (prevDataKey !== selectedSeason) {
    // Data changed, animation will trigger automatically
    setPrevDataKey(selectedSeason);
  }
}, [selectedSeason, prevDataKey]);

// Note: Recharts automatically animates when data prop changes
```

### Controlling Animation Disabled State

```typescript
// Disable animation during loading to prevent stale animations
<Line
  isAnimationActive={!isLoading}  // true when data ready, false when loading
  animationDuration={300}
  // ... rest of props
/>

// Or, show loading overlay and disable all animations
{isLoading && (
  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
    <Spinner />
  </div>
)}
```

### Performance Considerations

- **Duration**: 300ms is well within reasonable animation time; won't feel laggy
- **Rendering**: SVG animations are efficient; CPU usage minimal for line charts
- **Mobile**: Animations run at 60fps on modern devices; older devices may drop frames (acceptable for supplementary visualization)
- **Disable on slow devices**: Could detect and set `isAnimationActive={false}` for low-end devices if needed

### Advanced: Staggered Animations (Optional)

To animate each line in sequence instead of simultaneously:

```typescript
<Line
  // First line (TMDB) - starts immediately
  animationBegin={0}
  animationDuration={300}
/>

<Line
  // Second line (Trakt) - starts after first completes
  animationBegin={300}           // Wait 300ms for TMDB to finish
  animationDuration={300}
/>
```

### Why Not Framer Motion?

**Framer Motion is overkill here because:**
- Recharts already has built-in animation support
- Framer Motion adds 80KB+ to bundle size
- Complexity increases for a simple fade-in effect
- Recharts animations are performant and well-tested
- Would require complex synchronization between Framer Motion and Recharts' internal state

**Use Framer Motion only if you need:**
- Complex choreographed animations across multiple components
- Spring physics animations
- Gesture-driven animations (drag, swipe)
- Keyframe animations with precise timing control

### Gotchas
- **Animation persistence**: If user quickly switches seasons, previous animation may not complete. Use `key` prop to force clean re-mount.
- **isAnimationActive={false} quirk**: Setting this to false may still render dots after 1500ms default delay. Set `animationDuration={0}` if you want truly instant rendering.
- **Initial mount**: Lines will animate on first load; this is expected and desired per your spec.

**Sources:**
- [How to slow down animation time in Recharts · Stack Overflow](https://stackoverflow.com/questions/46903315/how-to-slow-down-animation-time-in-recharts)
- [How to disable animation for LineChart in recharts · Stack Overflow](https://stackoverflow.com/questions/56580007/how-to-disable-animation-for-linechart-in-recharts)
- [Point animation duration issue · GitHub Issue #945](https://github.com/recharts/recharts/issues/945)
- [Framer Motion Documentation](https://motion.dev/docs/react-animation)

---

## 5. Responsive Design with ResponsiveContainer

### Decision
**Use `ResponsiveContainer width="100%" height={400}` with parent container having explicit dimensions.**

### Rationale
- ResponsiveContainer requires parent to have explicit width for percentage-based responsiveness
- Fixed 400px height is optimal for readability without dominating the page
- ResponsiveContainer automatically adapts to parent width on resize
- Mobile screens (375px+) are fully supported with proper wrapping
- No additional libraries needed for responsive behavior

### ResponsiveContainer Props

```typescript
interface ResponsiveContainerProps {
  width?: string | number;        // Default: "100%"
  height?: string | number;       // Must be number or string, required
  minWidth?: string | number;     // Minimum width (e.g., "300px")
  minHeight?: string | number;    // Minimum height
  aspect?: number;                // Calculate height based on width ratio (alternative to fixed height)
  debounce?: number;              // Resize handler debounce in ms (default: 0)
  onResize?: (dimensions: {width: number; height: number}) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

### Implementation Pattern

**Parent Container Setup (Critical):**

```typescript
// In your parent component (e.g., SeriesDetailPage)
import { EpisodeChart } from './EpisodeChart';

export const SeriesDetailPage: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState(1);

  return (
    <div className="w-full space-y-8">

      {/* Overall Ratings Section */}
      <section className="w-full">
        {/* ... existing overall ratings UI ... */}
      </section>

      {/* Chart Section - must have explicit dimensions */}
      <section className="w-full">
        <h2 className="text-lg font-semibold mb-4">Episode Ratings</h2>

        {/* This div gives ResponsiveContainer the context it needs */}
        <div className="w-full h-auto">
          <EpisodeChart
            seasonNumber={selectedSeason}
            onSeasonChange={setSelectedSeason}
          />
        </div>
      </section>

      {/* Episode Table Section */}
      <section className="w-full">
        {/* ... existing episode table UI ... */}
      </section>
    </div>
  );
};
```

**EpisodeChart Component:**

```typescript
interface EpisodeChartProps {
  seasonNumber: number;
  onSeasonChange: (season: number) => void;
}

export const EpisodeChart: React.FC<EpisodeChartProps> = ({
  seasonNumber,
  onSeasonChange
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data when season changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch episode data for selected season
      const data = await getEpisodeData(seasonNumber);
      setChartData(transformToChartData(data));
      setIsLoading(false);
    };

    fetchData();
  }, [seasonNumber]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded">
        <Spinner />
      </div>
    );
  }

  if (chartData.length === 0) {
    return null; // Don't show chart if no data
  }

  return (
    <div className="w-full">
      {/* Fixed 400px height, full width */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          key={`chart-${seasonNumber}`}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="episode" type="number" />
          <YAxis domain={[0, 10]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            name="TMDB"
            dataKey="tmdb"
            stroke="#3b82f6"
            connectNulls
            isAnimationActive={!isLoading}
            animationDuration={300}
          />
          <Line
            type="monotone"
            name="Trakt"
            dataKey="trakt"
            stroke="#ef4444"
            connectNulls
            isAnimationActive={!isLoading}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### Mobile Responsiveness (375px+)

**Default behavior with ResponsiveContainer handles mobile automatically:**

```typescript
// No special configuration needed; Recharts adapts to container width

// For 375px width (mobile):
// - Chart renders at 100% of 375px = 375px wide
// - X-axis labels may be tighter; Recharts handles overflow
// - Height remains 400px (may need adjustment on very small screens)

// For 768px width (tablet):
// - Chart renders at 768px wide
// - More space for labels and data points

// For 1024px+ width (desktop):
// - Chart renders at full available width
// - Optimal readability
```

**If you want adaptive height for small screens:**

```typescript
export const EpisodeChart: React.FC<EpisodeChartProps> = ({
  seasonNumber,
  onSeasonChange
}) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust height based on screen size
  const chartHeight = screenSize === 'mobile' ? 300 : 400;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart data={chartData}>
        {/* ... rest of chart ... */}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### Handling Known ResponsiveContainer Issues

**Issue: Chart doesn't render inside Flexbox**

```typescript
// ❌ PROBLEMATIC
<div className="flex items-center justify-center">
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data} />
  </ResponsiveContainer>
</div>

// ✅ SOLUTION 1: Remove flex from chart container
<div className="flex items-center justify-center">
  <div className="w-full">
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} />
    </ResponsiveContainer>
  </div>
</div>

// ✅ SOLUTION 2: Use explicit width on parent
<div className="w-full">
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data} />
  </ResponsiveContainer>
</div>

// ✅ SOLUTION 3: Set position absolute on wrapper (not recommended unless necessary)
<div style={{ position: 'relative', width: '100%', height: 400 }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} />
  </ResponsiveContainer>
</div>
```

**Issue: Chart not filling parent height**

```typescript
// ❌ DOESN'T WORK
<ResponsiveContainer width="100%" height="100%">
  {/* Chart height will be undefined */}
</ResponsiveContainer>

// ✅ DOES WORK
<ResponsiveContainer width="100%" height={400}>
  {/* Chart height is explicit 400px */}
</ResponsiveContainer>

// ✅ ALSO WORKS - Use aspect ratio
<ResponsiveContainer width="100%" aspect={16/9}>
  {/* Height calculated from width / aspect ratio */}
</ResponsiveContainer>
```

### Recommended Wrapper Pattern

```typescript
// ChartContainer.tsx - reusable responsive wrapper
interface ChartContainerProps {
  children: React.ReactNode;
  height?: number;
  minHeight?: number;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  height = 400,
  minHeight = 300,
  className = '',
}) => {
  return (
    <div
      className={`w-full flex flex-col ${className}`}
      style={{ minHeight }}
    >
      <ResponsiveContainer
        width="100%"
        height={height}
        debounce={100}  // Prevent excessive re-renders on resize
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
};

// Usage
<ChartContainer height={400} minHeight={300}>
  <LineChart data={data} {...props} />
</ChartContainer>
```

### CSS Gotchas to Avoid

```css
/* ❌ DON'T use position: absolute without explicit parent dimensions */
.chart-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
}

/* ❌ DON'T nest ResponsiveContainer in other ResponsiveContainers */

/* ✅ DO use flex/grid with explicit dimensions */
.chart-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* ✅ DO ensure parent has defined dimensions */
.series-detail {
  width: 100%;
  /* Width is defined; height can be auto */
}
```

### Testing Responsive Behavior

```typescript
// Use browser DevTools to test:
// 1. Open DevTools (F12)
// 2. Click device toolbar (mobile view toggle)
// 3. Test breakpoints:
//    - 375px (iPhone SE)
//    - 768px (iPad)
//    - 1024px (desktop)
// 4. Verify chart resizes smoothly without breaking
// 5. Test window resize while chart is visible
```

### Performance Optimization

```typescript
// Use debounce prop to prevent excessive re-renders during resize
<ResponsiveContainer
  width="100%"
  height={400}
  debounce={100}  // Wait 100ms after resize stops before recalculating
>
  <LineChart data={data} />
</ResponsiveContainer>
```

**Sources:**
- [Set height and width for responsive chart using recharts - Stack Overflow](https://stackoverflow.com/questions/52134350/set-height-and-width-for-responsive-chart-using-recharts-barchart)
- [Recharts ResponsiveContainer not filling height - GitHub Issue #1545](https://github.com/recharts/recharts/issues/1545)
- [A Guide to Recharts ResponsiveContainer in Web Development](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer)
- [Recharts Responsive Container doesn't resize correctly in flexbox - Stack Overflow](https://stackoverflow.com/questions/50891591/recharts-responsive-container-does-not-resize-correctly-in-flexbox)

---

## Summary Table: Quick Reference

| Aspect | Decision | Key Config | Notes |
|--------|----------|-----------|-------|
| **TypeScript** | Built-in types | No @types/recharts | Requires TS 3.8+, works with strict mode |
| **Missing Data** | connectNulls={true} | Transform nulls to null | Shows gaps visually while connecting line |
| **Dark Mode** | CSS variables + props | Detect classList.contains('dark') | Use JavaScript to read variables |
| **Animation** | Recharts built-in | duration={300}, easing='ease-in-out' | No Framer Motion needed |
| **Responsive** | ResponsiveContainer | width="100%" height={400} | Parent must have explicit width |
| **Mobile (375px+)** | Auto-adapts | Default behavior | No special config needed |
| **Y-axis Scale** | domain={[0, 10]} | Fixed scale | Consistent across all charts |
| **Colors** | Hex strings via props | #3b82f6 (TMDB), #ef4444 (Trakt) | Matches Phase 1 design |

---

## Implementation Checklist

- [ ] Install Recharts: `npm install recharts`
- [ ] Create ChartDataPoint interface matching transformation
- [ ] Implement data transformation: episodeRatings → chart data
- [ ] Create EpisodeChart component with TypeScript types
- [ ] Add connectNulls to both Line components
- [ ] Implement dark mode detection and color updating
- [ ] Set animationDuration={300} on Line components
- [ ] Wrap chart in ResponsiveContainer with height={400}
- [ ] Create CustomTooltip component with proper typing
- [ ] Add loading state during data fetch
- [ ] Add error boundary for chart failures
- [ ] Test on mobile (375px, 480px, 768px widths)
- [ ] Test dark mode toggle
- [ ] Test season switching with animation
- [ ] Test with missing data (null ratings)
- [ ] Verify accessibility: table remains as accessible alternative

---

## Recommended Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "recharts": "^3.5.1",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0"
  }
}
```

No additional libraries needed for animations, dark mode, or responsiveness.

---

## Additional Resources

- **Recharts Official Docs**: https://recharts.github.io/
- **LineChart API**: https://recharts.github.io/en-US/api/LineChart/
- **Line Component API**: https://recharts.github.io/en-US/api/Line/
- **ResponsiveContainer API**: https://recharts.github.io/en-US/api/ResponsiveContainer/
- **Tailwind CSS Dark Mode**: https://tailwindcss.com/docs/dark-mode
- **Tailwind v4 CSS Variables**: https://ui.shadcn.com/docs/tailwind-v4

---

**Research Completed**: 2025-12-03
**Next Step**: Use these findings to implement Episode Chart component and update plan.md with specific implementation details.
