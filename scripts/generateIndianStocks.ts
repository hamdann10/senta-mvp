import fs from "fs";
import path from "path";

const csvPath = path.join(process.cwd(), "scripts", "nse_stocks.csv");
const outputPath = path.join(
  process.cwd(),
  "app",
  "data",
  "indianStocks.ts"
);

const csv = fs.readFileSync(csvPath, "utf-8");

const lines = csv.split("\n").slice(1); // skip header

const stocks = lines
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [symbol, name] = line.split(",");
    if (!symbol || !name) return null;
    return {
      symbol: symbol.trim(),
      name: name.trim(),
    };
  })
  .filter(Boolean);

const content = `
// ⚠️ AUTO-GENERATED FILE
// Generated from NSE stock list
// Do NOT edit manually

export type IndianStock = {
  symbol: string;
  name: string;
};

export const indianStocks: IndianStock[] = ${JSON.stringify(
  stocks,
  null,
  2
)};
`;

fs.writeFileSync(outputPath, content);

console.log("✅ indianStocks.ts generated with", stocks.length, "stocks");
