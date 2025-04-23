/*
 * Utility for merging Tailwind CSS class names.
 * Uses clsx for conditional class concatenation.
 * Uses tailwind-merge to remove duplicate or conflicting classes.
 */
// All comments made in the file were done by OpenAI's o4-mini model

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 'cn' accepts multiple class inputs and returns a merged, conflict-free string
export function cn(...inputs: ClassValue[]) {
  // combine inputs into a single class string, then dedupe/resolve Tailwind classes
  return twMerge(clsx(inputs));
}
