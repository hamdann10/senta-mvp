"use client";

import { useState } from "react";
import { indianStocks, IndianStock } from "@/app/data/indianStocks";

type Props = {
  onSelect: (stock: IndianStock) => void;
  disabled?: boolean;
};

export default function StockSearch({ onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results =
    query.length === 0
      ? []
      : indianStocks
          .filter(
            (s) =>
              s.symbol.toLowerCase().includes(query.toLowerCase()) ||
              s.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8); // limit suggestions

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search stock (e.g. Reliance, TCS)"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
      />

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 shadow-lg">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => {
                onSelect(stock);
                setQuery("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800"
            >
              <div className="text-sm font-medium">{stock.name}</div>
              <div className="text-xs text-slate-400">{stock.symbol}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
