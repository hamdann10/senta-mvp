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

    // ✅ Stable endpoint (NOT router)
    
      const apiUrl =
  "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert";


    // Limit batch size for stability
    const limitedHeadlines = headlines.slice(0, 5);

    // Timeout protection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: limitedHeadlines,
        options: { wait_for_model: true }, // 🔥 prevents cold start failure
      }),
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

    if (rawData?.error) {
      console.error("HF model issue:", rawData.error);

      return NextResponse.json(
        { error: "Sentiment model still loading. Try again." },
        { status: 503 }
      );
    }

    const data = rawData as HuggingFaceBatchResponse;

    // Normalize predictions
    const results = limitedHeadlines.map((headline, index) => {
      let prediction: SentimentLabel[] | undefined;

      // Proper batch response
      if (Array.isArray(data) && Array.isArray(data[index])) {
        prediction = data[index] as SentimentLabel[];
      }

      // Fallback single response
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
