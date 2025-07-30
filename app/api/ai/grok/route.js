import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // For now, just return a fake taunt (replace this with real Grok API later)
    return NextResponse.json({
      taunt: `AI: ${prompt} - just wait, I'll win!`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
