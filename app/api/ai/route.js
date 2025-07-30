import { NextResponse } from "next/server";

export async function POST(req) {
  const { prompt } = await req.json();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key missing" }, { status: 500 });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a funny AI opponent in a crossword game." },
        { role: "user", content: prompt }
      ],
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
