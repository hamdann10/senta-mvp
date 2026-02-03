import { NextResponse } from "next/server";

type SentimentLabel = {
  label: string;
  score: number;
};

type HuggingFaceResponse = SentimentLabel[][];

export async function POST(req: Request) {
  try {
    // ✅ Properly type request body
    const body = (await req.json()) as { headlines: string[] };
    const { headlines } = body;

    if (!headlines || headlines.length === 0) {
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

    const model = "ProsusAI/finbert";
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${model}`;

    const responses = await Promise.all(
      headlines.map(async (headline: string) => {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: headline }),
        });

        const data = (await res.json()) as HuggingFaceResponse;

        // 🛡️ Handle unexpected API response
        if (!Array.isArray(data) || !Array.isArray(data[0])) {
          console.warn("Unexpected Hugging Face response:", data);
          return { headline, sentiment: "unknown", raw: data };
        }

        // ✅ Find highest confidence label
        const topLabel = data[0].reduce(
          (prev, curr) => (curr.score > prev.score ? curr : prev),
          data[0][0]
        );

        return {
          headline,
          sentiment: topLabel.label,
          confidence: topLabel.score,
        };
      })
    );

    return NextResponse.json({ results: responses });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { error: "Sentiment analysis failed" },
      { status: 500 }
    );
  }
}
