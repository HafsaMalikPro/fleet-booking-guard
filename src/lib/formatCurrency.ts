const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Formats integer cents as US dollars, e.g. 123456 -> "$1,234.56". */
export function formatCurrency(cents: number): string {
  return usd.format(cents / 100);
}
