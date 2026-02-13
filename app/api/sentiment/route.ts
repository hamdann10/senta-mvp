import { NextResponse } from "next/server";

type SentimentLabel = {
  label: string;
  score: number;
};

type HuggingFaceBatchResponse = SentimentLabel[][] | SentimentLabel[];

type RequestBody = {
  headlines: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { headlines } = body;

    if (!Array.isArray(headlines) || headlines.length === 0) {
      return NextResponse.json(
        { error: "No headlines provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Hugging Face API key missing" },
        { status: 500 }
      );
    }

    const apiUrl =
      "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert";

    /* =========================
       🔥 SAFE BATCH REQUEST
    ========================== */

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: headlines }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("HF API error:", errorText);

      return NextResponse.json(
        { error: "Sentiment model request failed" },
        { status: 500 }
      );
    }

    const rawData = await res.json();

    // Model loading edge case
    if (rawData?.error) {
      console.error("HF model loading:", rawData.error);

      return NextResponse.json(
        { error: "Sentiment model still loading. Try again." },
        { status: 503 }
      );
    }

    const data = rawData as HuggingFaceBatchResponse;

    /* =========================
       🔥 NORMALIZE RESPONSE
    ========================== */

    const results = headlines.map((headline, index) => {
      let prediction: SentimentLabel[] | undefined;

      // Case: Proper batch array
      if (Array.isArray(data) && Array.isArray(data[index])) {
        prediction = data[index] as SentimentLabel[];
      }

      // Case: Single array returned (fallback)
      else if (Array.isArray(data) && index === 0) {
        prediction = data as SentimentLabel[];
      }

      if (!prediction || prediction.length === 0) {
        return {
          headline,
          sentiment: "neutral",
          confidence: 0,
        };
      }

      const topLabel = prediction.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );

      const normalized = topLabel.label.toLowerCase();

      return {
        headline,
        sentiment:
          normalized === "positive"
            ? "positive"
            : normalized === "negative"
            ? "negative"
            : "neutral",
        confidence: Number((topLabel.score ?? 0).toFixed(3)),
      };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("Sentiment request timeout");
      return NextResponse.json(
        { error: "Sentiment request timeout" },
        { status: 504 }
      );
    }

    console.error("Sentiment analysis failed:", error);
    return NextResponse.json(
      { error: "Sentiment analysis failed" },
      { status: 500 }
    );
  }
}
