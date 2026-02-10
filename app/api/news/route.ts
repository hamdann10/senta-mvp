import { NextResponse } from "next/server";
import { fetchRSSNews } from "../../lib/rssNewsService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stock = searchParams.get("stock");
  const days = Number(searchParams.get("days") || 7);

  if (!stock) {
    return NextResponse.json({ error: "Stock missing" }, { status: 400 });
  }

  const articles = await fetchRSSNews(stock, days);
  return NextResponse.json({ articles });
}
