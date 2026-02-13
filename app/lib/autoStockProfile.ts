import { indianStocks } from "@/app/data/indianStocks";

export interface GeneratedStockProfile {
  symbol: string;
  name: string;
  aliases: string[];
  keywords: string[];
}

/* ==============================
   Helper: Clean Company Name
============================== */
function cleanCompanyName(name: string): string {
  return name
    .replace(/limited|ltd|corp|corporation|india|industries|services/gi, "")
    .trim();
}

/* ==============================
   Generate Profile Automatically
============================== */
export function generateStockProfile(symbol: string): GeneratedStockProfile {
  const stock = indianStocks.find(
    s => s.symbol.toUpperCase() === symbol.toUpperCase()
  );

  const name = stock?.name || symbol;

  const cleanedName = cleanCompanyName(name);

  const nameTokens = cleanedName
    .split(" ")
    .filter(word => word.length > 3)
    .map(word => word.toLowerCase());

  const aliases = [
    symbol.toLowerCase(),
    cleanedName.toLowerCase(),
    ...nameTokens,
  ];

  const keywords = [
    "earnings",
    "results",
    "profit",
    "loss",
    "guidance",
    "margin",
    "acquisition",
    "merger",
    "dividend",
    "stake",
    "shares",
    "stock",
    ...nameTokens,
  ];

  return {
    symbol,
    name,
    aliases,
    keywords,
  };
}
