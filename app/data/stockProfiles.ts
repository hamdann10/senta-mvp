export interface StockProfile {
  symbol: string;
  name: string;
  aliases: string[];
  sectors: string[];
  keywords: string[];
}

export const STOCK_PROFILES: Record<string, StockProfile> = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    aliases: ["Reliance", "RIL", "Mukesh Ambani"],
    sectors: ["Energy", "Telecom", "Retail"],
    keywords: [
      "refinery",
      "petrochemical",
      "jio",
      "retail",
      "oil",
      "gas",
      "capex",
      "earnings",
    ],
  },

  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    aliases: ["TCS", "Tata Consultancy"],
    sectors: ["IT Services"],
    keywords: ["deal", "client", "margin", "attrition", "guidance"],
  },
};
