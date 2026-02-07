export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import nodemailer from "nodemailer";

/* ================= CONFIG ================= */

// Realistic, signal-based thresholds
const NEGATIVE_SCORE_THRESHOLD = -0.4;
const POSITIVE_SCORE_THRESHOLD = 0.4;

/* ================= EMAIL SETUP ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= SENTIMENT (OPTION A) ================= */

async function analyzeSentiment(headlines: string[]) {
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

  // Normalize HuggingFace response (single vs batch)
  const results = Array.isArray(raw[0]) ? raw : [raw];

  let scoreSum = 0;
  let total = 0;

  for (const item of results) {
    if (!Array.isArray(item)) continue;

    const top = item.reduce(
      (a: any, b: any) => (b.score > a.score ? b : a),
      item[0]
    );

    if (top.label === "positive") scoreSum += 1;
    if (top.label === "negative") scoreSum -= 1;
    total++;
  }

  const averageScore = total === 0 ? 0 : scoreSum / total;

  console.log("📊 SENTIMENT RESULT", {
    total,
    scoreSum,
    averageScore,
  });

  return {
    averageScore,
    total,
  };
}

/* ================= ROUTE ================= */

export async function GET() {
  try {
    console.log("🚀 Sentiment monitor started");

    const usersSnap = await getDocs(collection(db, "users"));
    console.log("👥 Users found:", usersSnap.docs.length);

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();
      const stocks: string[] = user.savedStocks || [];
      const email: string | undefined = user.email;

      if (!email || stocks.length === 0) continue;

      for (const stock of stocks) {
        console.log("📈 Checking stock:", stock);

        const newsRes = await fetch(
          `https://newsapi.org/v2/everything?q=${stock}&language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`
        );

        const newsData = await newsRes.json();
        const headlines: string[] = (newsData.articles || []).map(
          (a: any) => a.title
        );

        // No news → skip sentiment (expected & safe)
        if (headlines.length === 0) {
          console.log("ℹ️ No news found for", stock);
          continue;
        }

        const sentiment = await analyzeSentiment(headlines);

        console.log("🔍 Alert evaluation", {
          stock,
          averageScore: sentiment.averageScore,
          negative: sentiment.averageScore <= NEGATIVE_SCORE_THRESHOLD,
          positive: sentiment.averageScore >= POSITIVE_SCORE_THRESHOLD,
        });

        /* ---------- NEGATIVE ALERT ---------- */
        if (sentiment.averageScore <= NEGATIVE_SCORE_THRESHOLD) {
          await transporter.sendMail({
            from: `"Senta Alerts" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `⚠️ Negative Sentiment Alert – ${stock}`,
            text: `
🚨 NEGATIVE SENTIMENT ALERT

Stock: ${stock}
Average sentiment score: ${sentiment.averageScore.toFixed(2)}
Articles analyzed: ${sentiment.total}

— Senta Alert System
            `,
          });

          console.log("📧 Negative alert sent:", stock);
        }

        /* ---------- POSITIVE ALERT ---------- */
        if (sentiment.averageScore >= POSITIVE_SCORE_THRESHOLD) {
          await transporter.sendMail({
            from: `"Senta Alerts" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `📈 Positive Sentiment Alert – ${stock}`,
            text: `
📈 POSITIVE SENTIMENT ALERT

Stock: ${stock}
Average sentiment score: ${sentiment.averageScore.toFixed(2)}
Articles analyzed: ${sentiment.total}

— Senta Alert System
            `,
          });

          console.log("📧 Positive alert sent:", stock);
        }
      }
    }

    return NextResponse.json({
      status: "Sentiment monitoring completed successfully",
    });
  } catch (error) {
    console.error("❌ Monitoring failed:", error);
    return NextResponse.json(
      { error: "Sentiment monitoring failed" },
      { status: 500 }
    );
  }
}
