export function calculateCorrelation(
  sentiment: number[],
  prices: number[]
) {
  const n = sentiment.length;
  if (n !== prices.length || n === 0) return 0;

  const meanSent =
    sentiment.reduce((a, b) => a + b, 0) / n;

  const meanPrice =
    prices.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomSent = 0;
  let denomPrice = 0;

  for (let i = 0; i < n; i++) {
    const sDiff = sentiment[i] - meanSent;
    const pDiff = prices[i] - meanPrice;

    numerator += sDiff * pDiff;
    denomSent += sDiff * sDiff;
    denomPrice += pDiff * pDiff;
  }

  if (denomSent === 0 || denomPrice === 0) return 0;

  return numerator / Math.sqrt(denomSent * denomPrice);
}
