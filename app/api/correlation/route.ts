import { NextResponse } from "next/server";
import { db } from "@/app/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { calculateCorrelation } from "@/app/lib/correlation";

type SentimentDoc = {
  score: number;
  date: any;
};

async function fetchHistoricalPrices(symbol: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?range=7d&interval=1d`
  );

  const data = await res.json();

  const closes =
    data.chart.result[0].indicators.quote[0].close;

  return closes.filter((p: number | null) => p !== null);
}

function interpretCorrelation(value: number) {
  if (value > 0.5) return "Strong Positive Correlation";
  if (value < -0.5) return "Strong Negative Correlation";
  return "Weak or No Significant Correlation";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stock = searchParams.get("stock");

    if (!stock) {
      return NextResponse.json(
        { error: "Stock parameter required" },
        { status: 400 }
      );
    }

    /* ===== FETCH SENTIMENT ===== */

    const sentimentSnap = await getDocs(
      collection(db, "sentimentHistory", stock, "daily")
    );

    const sentimentDocs = sentimentSnap.docs.map(
      d => d.data() as SentimentDoc
    );

    sentimentDocs.sort(
      (a, b) => a.date.toMillis() - b.date.toMillis()
    );

    const last7Sentiment = sentimentDocs
      .slice(-7)
      .map(item => item.score);

    /* ===== FETCH PRICES ===== */

    const prices = await fetchHistoricalPrices(stock);
    const last7Prices = prices.slice(-7);

    const minLength = Math.min(
      last7Sentiment.length,
      last7Prices.length
    );

    const trimmedSentiment = last7Sentiment.slice(-minLength);
    const trimmedPrices = last7Prices.slice(-minLength);

    if (minLength < 3) {
      return NextResponse.json({
        stock,
        correlation: 0,
        interpretation: "Not enough historical data yet",
        dataPoints: minLength,
      });
    }

    const correlation = calculateCorrelation(
      trimmedSentiment,
      trimmedPrices
    );

    return NextResponse.json({
      stock,
      correlation,
      interpretation: interpretCorrelation(correlation),
      dataPoints: minLength,
    });

  } catch (error) {
    console.error("Correlation failed:", error);

    return NextResponse.json(
      { error: "Correlation calculation failed" },
      { status: 500 }
    );
  }
}