import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { headlines } = await req.json();

    if (!headlines || headlines.length === 0) {
      return NextResponse.json({ error: "No headlines provided" }, { status: 400 });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const model = "ProsusAI/finbert";
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${model}`;

    // Send each headline to the updated Hugging Face endpoint
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

        const data = await res.json();

        // Handle API errors
        if (!Array.isArray(data) || !Array.isArray(data[0])) {
          console.warn("Unexpected Hugging Face response:", data);
          return { headline, sentiment: "unknown", raw: data };
        }

        // Find the label with highest confidence
        const topLabel = data[0].reduce(
          (prev: any, curr: any) => (curr.score > prev.score ? curr : prev),
          data[0][0]
        );

        return { headline, sentiment: topLabel.label, confidence: topLabel.score };
      })
    );

    return NextResponse.json({ results: responses });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json({ error: "Sentiment analysis failed" }, { status: 500 });
  }
}
