import { STOCK_PROFILES } from "@/app/data/stockProfiles";

export function scoreImpact(text: string, stock: string): number {
  const t = text.toLowerCase();
  const profile = STOCK_PROFILES[stock];

  let score = 0;

  if (!profile) {
    // Fallback logic if stock not manually profiled
    if (t.includes(stock.toLowerCase())) score += 40;
    if (t.match(/earnings|results|profit|loss|guidance|merger|acquisition/))
      score += 20;
    return score;
  }

  /* 🔹 Direct company mention */
  if (
    profile.aliases.some(alias =>
      t.includes(alias.toLowerCase())
    )
  ) {
    score += 60;
  }

  /* 🔹 Company keywords */
  if (
    profile.keywords.some(keyword =>
      t.includes(keyword.toLowerCase())
    )
  ) {
    score += 25;
  }

  /* 🔹 Sector relevance */
  if (
    profile.sectors.some(sector =>
      t.includes(sector.toLowerCase())
    )
  ) {
    score += 20;
  }

  /* 🔹 Financial triggers */
  if (
    t.match(/earnings|results|profit|loss|guidance|margin|stake|dividend/)
  ) {
    score += 15;
  }

  return score;
}
