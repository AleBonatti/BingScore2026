/**
 * Date/Time Formatting Utilities
 * Using date-fns for consistent date handling
 */

import { format, parseISO } from 'date-fns';

export function formatReleaseYear(dateString: string | undefined): string {
  if (!dateString) return 'Unknown';
  try {
    return format(parseISO(dateString), 'yyyy');
  } catch {
    return 'Unknown';
  }
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Unknown';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return 'Unknown';
  }
}
