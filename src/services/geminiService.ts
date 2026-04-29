import { GoogleGenAI, Type } from "@google/genai";
import { StakeholderRole, TrackingLevel, ActionItem } from "../types";

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
      dueDate: { type: Type.STRING, description: "Estimated due date in YYYY-MM-DD if mentioned, else leave empty" }
    },
    required: ["title", "description", "role", "level", "priority", "chainOfThought"]
  }
};

export async function extractActionItems(transcript: string): Promise<Partial<ActionItem>[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
