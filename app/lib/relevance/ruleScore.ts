import { StockProfile } from "@/app/data/stockProfiles";

export function ruleScore(
  articleText: string,
  stock: StockProfile
): number {
  const text = articleText.toLowerCase();
  let score = 0;

  // Company mention
  if (text.includes(stock.symbol.toLowerCase())) score += 0.6;

  stock.aliases.forEach(a => {
    if (text.includes(a.toLowerCase())) score += 0.4;
  });

  // Keyword density
  stock.keywords.forEach(k => {
    if (text.includes(k.toLowerCase())) score += 0.2;
  });

  // Earnings / results boost
  if (
    text.includes("earnings") ||
    text.includes("results") ||
    text.includes("guidance")
  ) {
    score += 0.6;
  }

  return Math.min(score, 2.0);
}
