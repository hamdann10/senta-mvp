export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "../../../firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { fetchRSSNews } from "@/app/lib/rssNewsService";
import { sendWhatsAppAlert } from "@/app/lib/twilio";

/* ================= CONFIG ================= */

const NEGATIVE_THRESHOLD = -0.1;
const POSITIVE_THRESHOLD = 0.1;
const ALERT_DAYS = 1;
const COOLDOWN_HOURS = 6;

/* ================= SENTIMENT ================= */

async function analyzeSentiment(headlines: string[]) {
  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: headlines.slice(0, 20),
        options: { wait_for_model: true, use_cache: true },
      }),
    }
  );

  if (!res.ok) {
    console.error("HF failed:", await res.text());
    throw new Error("HF sentiment failed");
  }

  const raw = await res.json();
  const results = Array.isArray(raw[0]) ? raw : [raw];

  let total = 0;
  let count = 0;

  results.forEach((item: any[]) => {
    if (!Array.isArray(item)) return;

    const top = item.reduce(
      (a: any, b: any) => (b.score > a.score ? b : a),
      item[0]
    );

    const polarity =
      top.label.toLowerCase() === "positive"
        ? 1
        : top.label.toLowerCase() === "negative"
        ? -1
        : 0;

    total += polarity;
    count++;
  });

  return count === 0 ? 0 : total / count;
}

/* ================= ROUTE ================= */

export async function GET() {
  try {
    console.log("⏰ CRON START: Sentiment monitoring");

    const usersSnap = await getDocs(collection(db, "users"));
    console.log("👥 Users found:", usersSnap.docs.length);

    /* ================= PHASE 1: COLLECT UNIQUE STOCKS ================= */

    const uniqueStocks = new Set<string>();

    usersSnap.docs.forEach(userDoc => {
      const user = userDoc.data();
      const stocks: string[] = user.savedStocks || [];
      stocks.forEach(stock => uniqueStocks.add(stock));
    });

    console.log("📦 Unique stocks:", Array.from(uniqueStocks));

    /* ================= PHASE 2: COMPUTE & STORE SENTIMENT ================= */

    const today = new Date().toISOString().split("T")[0];
    const sentimentMap: Record<string, number> = {};

    for (const stock of uniqueStocks) {
      console.log(`📈 Analyzing ${stock}`);

      const articles = await fetchRSSNews(stock, ALERT_DAYS);

      if (articles.length === 0) {
        console.log(`ℹ️ No news for ${stock}`);
        sentimentMap[stock] = 0;
        continue;
      }

      const headlines = articles.map(a => a.title);
      const score = await analyzeSentiment(headlines);

      sentimentMap[stock] = score;

      await setDoc(
        doc(db, "sentimentHistory", stock, "daily", today),
        {
          score,
          date: new Date(),
        }
      );

      console.log(`📊 Stored sentiment for ${stock}:`, score);
    }

    /* ================= PHASE 3: ALERT PROCESSING ================= */

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();

      const stocks: string[] = user.savedStocks || [];
      const alertsEnabled: boolean = user.alertsEnabled ?? false;
      const phoneNumber: string | undefined = user.phoneNumber;

      if (!alertsEnabled || !phoneNumber || stocks.length === 0) {
        continue;
      }

      for (const stock of stocks) {
        const score = sentimentMap[stock];
        if (score === undefined) continue;

        const now = Date.now();
        const lastAlertMap = user.lastAlertSent || {};
        const lastSent = lastAlertMap[stock] || 0;

        const hoursSinceLast =
          (now - lastSent) / (1000 * 60 * 60);

        if (hoursSinceLast < COOLDOWN_HOURS) {
          console.log(`⏳ Cooldown active for ${stock}`);
          continue;
        }

        /* ===== BEARISH ALERT ===== */

        if (score <= NEGATIVE_THRESHOLD) {
          await sendWhatsAppAlert(
            phoneNumber,
            `🚨 SENTA ALERT (Bearish)

Stock: ${stock}
Sentiment Score: ${score.toFixed(2)}
Timeframe: Last 24 hours

Signal crossed bearish threshold.`
          );

          await updateDoc(doc(db, "users", userDoc.id), {
            [`lastAlertSent.${stock}`]: now,
          });

          console.log(`📲 Bearish alert sent for ${stock}`);
        }

        /* ===== BULLISH ALERT ===== */

        if (score >= POSITIVE_THRESHOLD) {
          await sendWhatsAppAlert(
            phoneNumber,
            `📈 SENTA ALERT (Bullish)

Stock: ${stock}
Sentiment Score: ${score.toFixed(2)}
Timeframe: Last 24 hours

Signal crossed bullish threshold.`
          );

          await updateDoc(doc(db, "users", userDoc.id), {
            [`lastAlertSent.${stock}`]: now,
          });

          console.log(`📲 Bullish alert sent for ${stock}`);
        }
      }
    }

    return NextResponse.json({
      status: "Sentiment monitoring completed successfully",
    });

  } catch (error) {
    console.error("❌ Cron failed:", error);

    return NextResponse.json(
      { error: "Sentiment monitoring failed" },
      { status: 500 }
    );
  }
}