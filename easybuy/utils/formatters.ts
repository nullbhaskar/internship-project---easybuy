/**
 * Shared formatting utilities used across the EasyBuy app.
 * Centralises price, date, and string formatting logic.
 */

/**
 * Formats a numeric price into a human-readable Indian currency string.
 * Examples: 1500 → "₹1,500", 150000 → "₹1.5L", 10000000 → "₹1.0Cr"
 */
export function formatPrice(value: number): string {
  if (value >= 10_000_000) return `\u20B9${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `\u20B9${(value / 100_000).toFixed(1)}L`;
  if (value >= 1_000) return `\u20B9${(value / 1_000).toFixed(1)}K`;
  return `\u20B9${Math.round(value).toLocaleString('en-IN')}`;
}

/**
 * Formats a full price with rupee symbol and Indian locale separators.
 * Example: 1299 → "₹1,299"
 */
export function formatExactPrice(value: number): string {
  return `\u20B9${value.toLocaleString('en-IN')}`;
}

/**
 * Calculates the discount percentage between MRP and selling price.
 * Returns 0 if either value is invalid.
 */
export function getDiscountPercent(price: number, mrp: number): number {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Formats a Firestore timestamp or ISO date string into a readable date.
 * Example: "2024-08-22T18:30:00Z" → "22 Aug 2024"
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Truncates a string to a maximum character count with an ellipsis.
 * Example: truncate("Hello World", 7) → "Hello W..."
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Converts a plain string to Title Case.
 * Example: "hello world" → "Hello World"
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
