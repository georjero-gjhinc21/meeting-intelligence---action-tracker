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

    // Clip transcript to avoid context limits (~60k chars ≈ 15k tokens)
    const MAX_CHARS = 60_000;
    let clipped = transcript;
    if (transcript.length > MAX_CHARS) {
      const half = Math.floor(MAX_CHARS / 2);
      clipped = transcript.slice(0, half) + '\n\n...[truncated middle of transcript]...\n\n' + transcript.slice(-half);
    }

      // Schema aligned with src/types.ts
      const ACTION_ITEM_SCHEMA = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Clear, action-oriented title" },
            description: { type: Type.STRING, description: "Detailed description of the requirement" },
            role: { type: Type.STRING, enum: ["Leader", "Driver", "Supporter", "Contributor", "Informed"], description: "Primary responsible stakeholder" },
            level: { type: Type.STRING, enum: ["Board Action", "Transformation", "Vision", "Program", "Project", "Task"], description: "Hierarchy level" },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            chainOfThought: { type: Type.STRING, description: "AI reasoning for why this was extracted" },
            dueDate: { type: Type.STRING, description: "Estimated due date in YYYY-MM-DD if mentioned, else leave empty" },
            offices: {
              type: Type.ARRAY,
              items: { type: Type.STRING, enum: ["Board", "CEO", "CFO", "CIO", "CMO", "CISO", "CTO", "COO"] },
              description: "Executive offices this item concerns. Budget/finance -> CFO; technology/systems -> CIO; brand/customer/market -> CMO; strategy/org-wide -> CEO; governance/fiduciary -> Board; security -> CISO; engineering/product -> CTO; operations -> COO. Multiple allowed."
            },
            category: {
              type: Type.STRING,
              enum: ["Action", "Program", "Risk", "Issue", "Regulatory", "Mission"],
              description: "Action = concrete task or decision needed. Program = ongoing initiative status. Risk = potential future problem. Issue = current active problem. Regulatory = legal/compliance matter. Mission = vision, strategy, or transformation direction."
            }
          },
          required: ["title", "description", "role", "level", "priority", "chainOfThought", "offices", "category"]
        }
      };

    // Generate content with Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following meeting transcript and extract high-level action items.
Classify them based on the provided stakeholder roles and tracking levels.
Only extract genuine action items — decisions, commitments, follow-ups. Skip small talk.

Transcript:
${clipped}`,
      config: {
        systemInstruction: "You are an elite executive assistant specialized in C-suite meeting intelligence. Map meeting discussions to a strategic hierarchy (Board Action -> Transformation -> Vision -> Program -> Project -> Task). For each action item, infer the executive offices it concerns (budget/finance → CFO; technology/systems → CIO; brand/customer/market → CMO; strategy/org-wide → CEO; governance/fiduciary → Board; security → CISO; engineering/product → CTO; operations -> COO) and classify as Action/Program/Risk/Issue/Regulatory/Mission. Also classify every item with the executive offices it concerns and exactly one insight category. Always provide detailed 'chainOfThought' explaining your reasoning. Return JSON only — no preamble, no markdown.",
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