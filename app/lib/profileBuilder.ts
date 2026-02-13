import { indianStocks } from "@/app/data/indianStocks";

export interface StockProfile {
  symbol: string;
  name: string;
  aliases: string[];
  keywords: string[];
}

function cleanCompanyName(name: string) {
  return name
    .replace(/Limited|Ltd\.?|Inc\.?|Corporation|Corp\.?/gi, "")
    .trim();
}

function generateAliases(symbol: string, name: string): string[] {
  const cleaned = cleanCompanyName(name);
  const firstWord = cleaned.split(" ")[0];

  return Array.from(
    new Set([
      symbol,
      cleaned,
      firstWord,
      cleaned.toLowerCase(),
      symbol.toLowerCase(),
    ])
  );
}

function generateKeywords(name: string): string[] {
  const words = cleanCompanyName(name).split(" ");
  return words.filter(w => w.length > 3);
}

export function buildStockProfile(symbol: string): StockProfile | null {
  const stock = indianStocks.find((s) => s.symbol === symbol);
  if (!stock) return null;

  return {
    symbol,
    name: stock.name,
    aliases: generateAliases(symbol, stock.name),
    keywords: generateKeywords(stock.name),
  };
}
