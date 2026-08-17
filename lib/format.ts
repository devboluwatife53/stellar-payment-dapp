/** Small display helpers shared across components. */

/** Truncate a Stellar address like GABC...WXYZ. */
export function truncateAddress(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail) return address;
  return `${address.slice(0, lead)}...${address.slice(-tail)}`;
}

/** Format a balance string (XLM or USDC) to 7 decimal places for display. */
export function formatAmount(balance: string): string {
  const n = Number(balance);
  if (Number.isNaN(n)) return balance;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 7,
    maximumFractionDigits: 7,
  });
}
