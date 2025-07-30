export async function getAITaunt(prompt) {
  try {
    const res = await fetch("/api/ai/grok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch AI taunt");
    }

    const data = await res.json();
    return data.taunt || "🤖 ...thinking of a taunt!";
  } catch (err) {
    console.error("Grok fetch error:", err);
    return "🤖 I'm speechless right now!";
  }
}
