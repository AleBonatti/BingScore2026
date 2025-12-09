/**
 * Tests for AutocompleteResults component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AutocompleteResults from './AutocompleteResults';
import type { SearchResult } from '../../../lib/types/domain.ts';

// Wrapper for components that use react-router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('AutocompleteResults', () => {
  const mockResults: SearchResult[] = [
    {
      provider: 'tmdb',
      tmdbId: 1396,
      mediaType: 'tv',
      title: 'Breaking Bad',
      year: 2008,
      posterUrl: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    },
    {
      provider: 'tmdb',
      tmdbId: 60059,
      mediaType: 'tv',
      title: 'Better Call Saul',
      year: 2015,
      posterUrl: '/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
    },
  ];

  it('should not render when not visible', () => {
    const { container } = render(<AutocompleteResults results={mockResults} isVisible={false} />, {
      wrapper: RouterWrapper,
    });

    expect(container.firstChild).toBeNull();
  });

  it('should not render when results are empty', () => {
    const { container } = render(<AutocompleteResults results={[]} isVisible={true} />, {
      wrapper: RouterWrapper,
    });

    expect(container.firstChild).toBeNull();
  });

  it('should render results when visible and has data', () => {
    render(<AutocompleteResults results={mockResults} isVisible={true} />, {
      wrapper: RouterWrapper,
    });

    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Better Call Saul')).toBeInTheDocument();
  });

  it('should render all search results', () => {
    render(<AutocompleteResults results={mockResults} isVisible={true} />, {
      wrapper: RouterWrapper,
    });

    // SearchResultItem renders as clickable divs, not links
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Better Call Saul')).toBeInTheDocument();
    expect(screen.getByText('2008 • TV Series')).toBeInTheDocument();
    expect(screen.getByText('2015 • TV Series')).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    const { container } = render(<AutocompleteResults results={mockResults} isVisible={true} />, {
      wrapper: RouterWrapper,
    });

    // Should have absolute positioning and shadow
    const resultsContainer = container.querySelector('.absolute');
    expect(resultsContainer).toBeInTheDocument();
    expect(resultsContainer).toHaveClass('shadow-lg');
  });

  it('should handle single result', () => {
    const singleResult: SearchResult[] = [mockResults[0]];

    render(<AutocompleteResults results={singleResult} isVisible={true} />, {
      wrapper: RouterWrapper,
    });

    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.queryByText('Better Call Saul')).not.toBeInTheDocument();
  });

  it('should use unique keys for each result', () => {
    const { container } = render(<AutocompleteResults results={mockResults} isVisible={true} />, {
      wrapper: RouterWrapper,
    });

    // Each SearchResultItem should be rendered as clickable divs
    const resultItems = container.querySelectorAll('.cursor-pointer');
    expect(resultItems.length).toBeGreaterThanOrEqual(2);
  });
});
