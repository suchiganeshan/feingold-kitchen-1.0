import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/generate-recipes", async (req: Request, res: Response) => {
    try {
      const { ingredients } = req.body as { ingredients: string[] };

      if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ error: "No ingredients provided" });
      }

      const prompt = `You are a Feingold diet recipe expert. The Feingold diet eliminates artificial colors, artificial flavors, artificial preservatives (BHA, BHT, TBHQ), and certain salicylates.

The user has selected these Feingold-approved ingredients: ${ingredients.join(", ")}.

Generate exactly 3 creative, delicious recipes using ONLY these ingredients (plus basic pantry staples like salt, pepper, olive oil, butter, flour, sugar, and water which are always assumed available on the Feingold diet).

Respond with ONLY a valid JSON array (no markdown, no code blocks, just raw JSON) in this exact format:
[
  {
    "title": "Recipe Name",
    "description": "One sentence enticing description",
    "prepTime": "10 mins",
    "cookTime": "20 mins",
    "servings": 4,
    "ingredients": ["1 cup ingredient", "2 tbsp ingredient"],
    "steps": ["Step one description", "Step two description"],
    "tags": ["Quick", "Family-Friendly"]
  }
]`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { maxOutputTokens: 8192 },
      });

      let fullText = "";
      for await (const chunk of stream) {
        const text = chunk.text || "";
        if (text) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Recipe generation error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate recipes" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
