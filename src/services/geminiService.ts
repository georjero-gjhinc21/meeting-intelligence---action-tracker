import { GoogleGenAI, Type } from "@google/genai";
import { StakeholderRole, TrackingLevel, ActionItem, ExecutiveOffice, InsightCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ACTION_ITEM_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Clear, action-oriented title" },
      description: { type: Type.STRING, description: "Detailed description of the requirement" },
      role: { type: Type.STRING, enum: Object.values(StakeholderRole), description: "Primary responsible stakeholder" },
      level: { type: Type.STRING, enum: Object.values(TrackingLevel), description: "Hierarchy level" },
      priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
      chainOfThought: { type: Type.STRING, description: "AI reasoning for why this was extracted" },
      dueDate: { type: Type.STRING, description: "Estimated due date in YYYY-MM-DD if mentioned, else leave empty" },
      offices: {
        type: Type.ARRAY,
        items: { type: Type.STRING, enum: Object.values(ExecutiveOffice) },
        description: "Executive offices this item concerns. Budget/finance -> CFO; technology/systems -> CIO; brand/customer/market -> CMO; strategy/org-wide -> CEO; governance/fiduciary -> Board; security -> CISO; engineering/product -> CTO; operations -> COO. Multiple allowed."
      },
      category: {
        type: Type.STRING,
        enum: Object.values(InsightCategory),
        description: "Action = concrete task or decision needed. Program = ongoing initiative status. Risk = potential future problem. Issue = current active problem. Regulatory = legal/compliance matter. Mission = vision, strategy, or transformation direction."
      }
    },
    required: ["title", "description", "role", "level", "priority", "chainOfThought", "offices", "category"]
  }
};

// Keep transcripts under model context — gemini-flash handles ~1M tokens but
// keeping it tight makes responses faster and cheaper. ~60k chars ≈ 15k tokens.
const MAX_CHARS = 60_000;

function clipTranscript(s: string): string {
  if (s.length <= MAX_CHARS) return s;
  const half = Math.floor(MAX_CHARS / 2);
  return s.slice(0, half) + '\n\n...[truncated middle of transcript]...\n\n' + s.slice(-half);
}

export async function extractActionItems(transcript: string): Promise<Partial<ActionItem>[]> {
  const clipped = clipTranscript(transcript || '');
  if (!clipped.trim()) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following meeting transcript and extract high-level action items.
Classify them based on the provided stakeholder roles and tracking levels.
Only extract genuine action items — decisions, commitments, follow-ups. Skip small talk.

Transcript:
${clipped}`,
      config: {
        systemInstruction:
          "You are an elite executive assistant specialized in C-suite meeting intelligence. Map meeting discussions to a strategic hierarchy (Board Action -> Transformation -> Vision -> Program -> Project -> Task). For each action item, infer the executive offices it concerns (budget/finance → CFO; technology/systems → CIO; brand/customer/market → CMO; strategy/org-wide → CEO; governance/fiduciary → Board; security → CISO; engineering/product → CTO; operations -> COO) and classify as Action/Program/Risk/Issue/Regulatory/Mission. Also classify every item with the executive offices it concerns and exactly one insight category. Always provide detailed 'chainOfThought' explaining your reasoning. Return JSON only — no preamble, no markdown.",
        responseMimeType: "application/json",
        responseSchema: ACTION_ITEM_SCHEMA
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
