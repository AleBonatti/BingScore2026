/**
 * Tests for useDebounce hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));

    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 500ms
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Change value multiple times rapidly
    rerender({ value: 'first', delay: 500 });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'second', delay: 500 });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'third', delay: 500 });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast-forward to complete the last timer
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Only the last value should be reflected
    expect(result.current).toBe('third');
  });

  it('should work with different data types', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 42, delay: 300 },
      }
    );

    expect(result.current).toBe(42);

    rerender({ value: 100, delay: 300 });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('should handle delay changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'test', delay: 500 },
      }
    );

    // Change value with original delay
    rerender({ value: 'updated', delay: 500 });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    // Change delay before timer completes
    rerender({ value: 'updated', delay: 1000 });

    // Original timer should be cancelled, value still not updated
    expect(result.current).toBe('test');

    // Complete the new timer
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle empty strings', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    rerender({ value: '', delay: 300 });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('');
  });

  it('should work with zero delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    );

    rerender({ value: 'updated', delay: 0 });
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });
});
