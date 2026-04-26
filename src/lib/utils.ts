import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Basic Input Sanitization (XSS Prevention)
 * Replaces HTML tags with empty strings
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>?/gm, '');
}

/**
 * Client-side validation regex helpers
 */
export const validators = {
  email: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  phone: (val: string) => /^\+?[\d\s-]{8,15}$/.test(val),
  zip: (val: string) => /^\d{4,6}$/.test(val),
};

/**
 * Formats currency (defaulting to USD for template, but easily swappable)
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
