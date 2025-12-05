/**
 * Tests for SearchBar component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByPlaceholderText('Search for TV series or movies...');
    expect(input).toBeInTheDocument();
  });

  it('should display the current value', () => {
    render(<SearchBar value="Breaking Bad" onChange={() => {}} />);

    const input = screen.getByPlaceholderText('Search for TV series or movies...');
    expect(input).toHaveValue('Breaking Bad');
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Search for TV series or movies...');
    await user.type(input, 'B');

    expect(handleChange).toHaveBeenCalledWith('B');
  });

  it('should show search icon when not loading', () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} isLoading={false} />);

    // Search icon (lucide-react renders as SVG)
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should show loader when loading', () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} isLoading={true} />);

    // Loader icon should have animate-spin class
    const loader = container.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('should allow clearing the input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="Breaking Bad" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Search for TV series or movies...');
    await user.clear(input);

    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle multiple character inputs', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Search for TV series or movies...');
    await user.type(input, 'Breaking');

    expect(handleChange).toHaveBeenCalledTimes(8); // One call per character
  });
});
