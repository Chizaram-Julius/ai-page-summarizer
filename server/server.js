import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env file.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(
  cors({
    origin: "*",
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.get("/", (req, res) => {
  res.send("AI Page Summarizer backend is running.");
});

app.post("/api/summarize", async (req, res) => {
  try {
    const { title, url, text } = req.body;

    if (
      typeof title !== "string" ||
      typeof url !== "string" ||
      typeof text !== "string" ||
      text.trim().length < 100
    ) {
      return res.status(400).json({
        error: "Invalid page content.",
      });
    }

    const cleanTitle = title.slice(0, 200);
    const cleanUrl = url.slice(0, 500);
    const cleanText = text.slice(0, 12000);

    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 220));

    const prompt = `
You are an AI webpage summarizer.

Summarize the webpage content below.

Return ONLY valid JSON in this exact shape:
{
  "summary": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "estimatedReadingTime": "3 min",
  "wordCount": 650
}

Rules:
- Summary must be clear and useful.
- Use bullet-style short sentences.
- Key insights must be different from the summary.
- Do not include markdown.
- Do not include explanations outside JSON.

Page title: ${cleanTitle}
Page URL: ${cleanUrl}

Page content:
${cleanText}
`;

    const aiResponse = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You return only valid JSON. No markdown. No explanation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    const output = aiResponse.output_text;

    if (!output) {
      return res.status(500).json({
        error: "No AI response received.",
      });
    }

    let parsedSummary;

    try {
      parsedSummary = JSON.parse(output);
    } catch {
      return res.status(500).json({
        error: "AI returned invalid JSON.",
      });
    }

    return res.json({
      summary: Array.isArray(parsedSummary.summary)
        ? parsedSummary.summary
        : [],
      keyInsights: Array.isArray(parsedSummary.keyInsights)
        ? parsedSummary.keyInsights
        : [],
      estimatedReadingTime:
        parsedSummary.estimatedReadingTime || `${estimatedMinutes} min`,
      wordCount: parsedSummary.wordCount || wordCount,
    });
  } catch (error) {
    console.error("Summarization error:", error);

    return res.status(500).json({
      error: error.message || "Failed to summarize page.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Page Summarizer backend running on port ${PORT}`);
});
