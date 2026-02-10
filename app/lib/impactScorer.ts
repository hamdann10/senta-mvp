import { pipeline } from "@xenova/transformers";

let scorer: any;

async function loadModel() {
  if (!scorer) {
    scorer = await pipeline(
      "text2text-generation",
      "google/flan-t5-base"
    );
  }
  return scorer;
}

export async function getImpactScore(
  stock: string,
  title: string,
  description: string
): Promise<number> {
  const model = await loadModel();

  const prompt = `
You are a financial analyst.

Rate the impact of the following news on the stock price of ${stock}.

Score from 0 to 1:
0 = no impact
1 = very high impact

News:
${title}. ${description}

Respond with ONLY a number between 0 and 1.
`;

  const result = await model(prompt, { max_new_tokens: 5 });
  const text = result[0].generated_text.trim();

  const score = parseFloat(text);
  return isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
}
