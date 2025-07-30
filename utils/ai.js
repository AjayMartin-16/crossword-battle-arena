export const getTauntFromGrok = async (prompt) => {
  try {
    const res = await fetch("https://api.x.ai/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        prompt: prompt,
        max_tokens: 30,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.text?.trim();
  } catch (err) {
    console.error("Grok API error:", err);
    return null;
  }
};