import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required" });
    }

    // Initialize Gemini client with API key from environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Define the schema for action items - based on existing schema from geminiService.ts
    const ACTION_ITEM_SCHEMA = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Clear, action-oriented title" },
          description: { type: Type.STRING, description: "Detailed description of the requirement" },
          role: { type: Type.STRING, enum: ["Leader", "Driver", "Supporter", "Contributor", "Informed"], description: "Primary responsible stakeholder" },
          level: { type: Type.STRING, enum: ["Board", "Transformation", "Vision", "Program", "Project", "Task"], description: "Hierarchy level" },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          chainOfThought: { type: Type.STRING, description: "AI reasoning for why this was extracted" },
          dueDate: { type: Type.STRING, description: "Estimated due date in YYYY-MM-DD if mentioned, else leave empty" }
        },
        required: ["title", "description", "role", "level", "priority", "chainOfThought"]
      }
    };

    // Generate content with Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Using Gemini 3 Flash Preview (current model as of Dec 2025)
      contents: `Analyze the following meeting transcript and extract high-level action items. 
       Classify them based on the provided stakeholder roles and tracking levels.
       
       Transcript:
       ${transcript}`,
      config: {
        systemInstruction: "You are an elite executive assistant specialized in C-suite meeting intelligence. Your goal is to map meeting discussions to a strategic hierarchy (Board -> Transformation -> Vision -> Program -> Project -> Task). Always provide detailed 'chainOfThought' explaining your reasoning.",
        responseMimeType: "application/json",
        responseSchema: ACTION_ITEM_SCHEMA
      }
    });

    const text = response.text || "[]";
    const actionItems = JSON.parse(text);

    return res.status(200).json({ actions: actionItems });
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}