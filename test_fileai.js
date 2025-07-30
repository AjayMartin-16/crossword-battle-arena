const fetch = require("node-fetch");

const key = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

(async () => {
  try {
    console.log("🔹 Using API Key:", key ? "Loaded" : "Not Found");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: "Hello AI! Are you working?" }],
      }),
    });

    const data = await res.json();
    console.log("🔹 OpenRouter Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ API call failed:", err);
  }
})();
