// services/aiGenerate.js - For GitHub AI Models
const generateProductDetails = async (description) => {
  try {
    // Use GitHub's AI platform
    const token =
      import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN;
    const baseURL =
      import.meta.env.VITE_AI_BASE_URL || import.meta.env.AI_BASE_URL;
    const model =
      import.meta.env.VITE_AI_MODEL ||
      import.meta.env.AI_MODEL ||
      "openai/gpt-4o";

    if (!token || !baseURL) {
      console.warn("GitHub AI credentials not configured, using fallback");
      return generateFallbackContent(description);
    }

    const response = await fetch(`${baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are an expert e-commerce product copywriter. Generate compelling product names and descriptions. Respond ONLY with valid JSON format, no additional text.",
          },
          {
            role: "user",
            content: `Based on this product idea: "${description}"
            
            Generate a product name and description for an e-commerce store.
            
            Requirements:
            1. Name: Catchy, SEO-friendly (max 6 words)
            2. Description: 3-4 sentences highlighting benefits
            3. Keywords: 3-5 relevant keywords
            4. Suggested Price: Realistic price in USD
            
            Return ONLY this JSON format:
            {
              "name": "Product Name Here",
              "description": "Product description here. Make it engaging.",
              "keywords": ["keyword1", "keyword2", "keyword3"],
              "suggestedPrice": 49.99
            }`,
          },
        ],
      }),
    });

    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub AI Error:", response.status, errorText);
      throw new Error(
        `GitHub AI Error ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("GitHub AI Response:", data);

    // Check if choices exist
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No choices in response");
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    // Parse JSON (handle potential formatting issues)
    let parsed;
    try {
      // Clean content - extract JSON if wrapped in code blocks
      let jsonContent = content.trim();

      // Remove markdown code blocks if present
      if (jsonContent.startsWith("```json")) {
        jsonContent = jsonContent.replace(/^```json\s*|\s*```$/g, "");
      } else if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/^```\s*|\s*```$/g, "");
      }

      parsed = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      // Try to extract JSON from text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (error) {
          throw new Error("Failed to parse AI response as JSON",error);
        }
      } else {
        throw new Error("No JSON found in response");
      }
    }

    return {
      success: true,
      data: {
        name: parsed.name || "",
        description: parsed.description || "",
        keywords: parsed.keywords || [],
        suggestedPrice: parsed.suggestedPrice || null,
      },
    };
  } catch (error) {
    console.error("AI generation error:", error);

    // Generate fallback content
    return generateFallbackContent(description);
  }
};

// Fallback generator (same as before)
const generateFallbackContent = (description) => {
  const words = description.split(" ").filter((word) => word.length > 0);

  const prefixes = ["Premium", "Pro", "Elite", "Deluxe", "Ultimate"];
  const suffixes = ["Edition", "Pro", "Plus", "2024", "Series"];

  const namePrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const nameSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  const nameWords = words.slice(0, Math.min(3, words.length));
  const name = `${namePrefix} ${nameWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")} ${nameSuffix}`.trim();

  const descriptionTemplates = [
    `Experience exceptional quality with our ${description.toLowerCase()}. Designed for superior performance and durability. Perfect for both professional and personal use. Elevate your standards with this premium product.`,
    `Introducing our ${description.toLowerCase()} - crafted with precision and attention to detail. Featuring innovative design elements and premium materials for unmatched reliability. The perfect choice for discerning customers.`,
    `Discover the ultimate ${description.toLowerCase()} solution. Engineered for excellence with cutting-edge technology and ergonomic design. Built to last while delivering exceptional value and performance.`,
  ];

  const descriptionText =
    descriptionTemplates[
      Math.floor(Math.random() * descriptionTemplates.length)
    ];

  const keywords = [
    ...new Set([
      ...words.slice(0, 5).map((w) => w.toLowerCase()),
      "premium",
      "quality",
      "durable",
      "professional",
      "innovative",
    ]),
  ];

  const suggestedPrice = (Math.random() * 100 + 19.99).toFixed(2);

  return {
    success: false,
    error: "AI service unavailable",
    fallback: {
      name,
      description: descriptionText,
      keywords,
      suggestedPrice: parseFloat(suggestedPrice),
    },
  };
};

export default generateProductDetails;
