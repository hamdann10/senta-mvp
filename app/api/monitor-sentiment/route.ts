export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import nodemailer from "nodemailer";
import { fetchRSSNews } from "@/app/lib/rssNewsService";

/* ================= CONFIG ================= */

// Signal-based thresholds (tuned)
const NEGATIVE_SCORE_THRESHOLD = -0.35;
const POSITIVE_SCORE_THRESHOLD = 0.35;

// Timeframes cron will evaluate
const TIMEFRAMES = [1, 7, 30]; // days

/* ================= EMAIL SETUP ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= SENTIMENT ================= */

async function analyzeSentiment(
  headlines: string[],
  impactScores: number[]
) {
  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: headlines }),
    }
  );

  const raw = await res.json();
  const results = Array.isArray(raw[0]) ? raw : [raw];

  let weightedScore = 0;
  let weightSum = 0;

  results.forEach((item: any[], idx: number) => {
    if (!Array.isArray(item)) return;

    const top = item.reduce(
      (a: any, b: any) => (b.score > a.score ? b : a),
      item[0]
    );

    const polarity =
      top.label === "positive" ? 1 :
      top.label === "negative" ? -1 :
      0;

    const weight = impactScores[idx] ?? 1;

    weightedScore += polarity * weight;
    weightSum += weight;
  });

  const averageScore = weightSum === 0 ? 0 : weightedScore / weightSum;

  return {
    averageScore,
    articles: headlines.length,
  };
}

/* ================= ROUTE ================= */

export async function GET() {
  try {
    console.log("🚀 CRON: Sentiment monitor started");

    const usersSnap = await getDocs(collection(db, "users"));
    console.log("👥 Users:", usersSnap.docs.length);

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();
      const stocks: string[] = user.savedStocks || [];
      const email: string | undefined = user.email;

      if (!email || stocks.length === 0) continue;

      for (const stock of stocks) {
        for (const days of TIMEFRAMES) {
          console.log(`📈 ${stock} | ${days}d analysis`);

          // 🔥 RSS + Impact filtering
          const articles = await fetchRSSNews(stock, days);

          if (articles.length === 0) {
            console.log(`ℹ️ No impact news (${stock}, ${days}d)`);
            continue;
          }

          const headlines = articles.map(a => a.title);
          const impactScores = articles.map(a => a.impactScore);

          const sentiment = await analyzeSentiment(
            headlines,
            impactScores
          );

          console.log("🔍 SENTIMENT", {
            stock,
            days,
            score: sentiment.averageScore,
            articles: sentiment.articles,
          });

          /* ---------- NEGATIVE ALERT ---------- */
          if (sentiment.averageScore <= NEGATIVE_SCORE_THRESHOLD) {
            await transporter.sendMail({
              from: `"Senta Alerts" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: `⚠️ ${stock} Negative Sentiment (${days}d)`,
              text: `
🚨 NEGATIVE SENTIMENT ALERT

Stock: ${stock}
Timeframe: Last ${days} days
Sentiment score: ${sentiment.averageScore.toFixed(2)}
Articles analyzed: ${sentiment.articles}

This signal is impact-weighted and time-filtered.

— Senta Alert System
              `,
            });

            console.log(`📧 NEGATIVE alert sent (${stock}, ${days}d)`);
          }

          /* ---------- POSITIVE ALERT ---------- */
          if (sentiment.averageScore >= POSITIVE_SCORE_THRESHOLD) {
            await transporter.sendMail({
              from: `"Senta Alerts" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: `📈 ${stock} Positive Sentiment (${days}d)`,
              text: `
📈 POSITIVE SENTIMENT ALERT

Stock: ${stock}
Timeframe: Last ${days} days
Sentiment score: ${sentiment.averageScore.toFixed(2)}
Articles analyzed: ${sentiment.articles}

This signal is impact-weighted and time-filtered.

— Senta Alert System
              `,
            });

            console.log(`📧 POSITIVE alert sent (${stock}, ${days}d)`);
          }
        }
      }
    }

    return NextResponse.json({
      status: "Cron sentiment monitoring completed",
    });
  } catch (error) {
    console.error("❌ Cron failed:", error);
    return NextResponse.json(
      { error: "Cron sentiment monitoring failed" },
      { status: 500 }
    );
  }
}
