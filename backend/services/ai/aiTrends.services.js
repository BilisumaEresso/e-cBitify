const OpenAI = require("openai").default;

const client = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: process.env.AI_BASE_URL,
});

const generateTrendsFromAI = async (categories = []) => {
  const response = await client.chat.completions.create({
    model: process.env.AI_MODEL,
    temperature: 0.4,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content:
          "You are an e-commerce trend analysis engine. Respond ONLY with valid JSON.",
      },
      {
        role: "user",
        content: `
Generate trending product ideas for an e-commerce platform.

Allowed categories:
${categories.join(", ")}

Return JSON in this exact format:
{
  "trends": [
    {
      "name": "",
      "category": "",
      "reason": "",
      "source": ""
    }
  ]
}

Rules:
- category must be from allowed list
- keep reasons short
- max 12 trends
- JSON only
        `,
      },
    ],
  });

  const raw = response.choices[0].message.content;
  try {
    const cleaned = raw.replace(/^```json\s*|^```\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.trends)) throw new Error("trends field is not an array");
    return parsed;
  } catch (err) {
    throw new Error(`AI trends returned invalid JSON: ${err.message}`);
  }
};

module.exports = { generateTrendsFromAI };
