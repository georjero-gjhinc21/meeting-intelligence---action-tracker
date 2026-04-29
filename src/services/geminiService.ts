import { ActionItem } from "../types";

// Thin client that calls the Vercel serverless function
export async function extractActionItems(transcript: string): Promise<Partial<ActionItem>[]> {
  try {
    const response = await fetch("/api/extract-actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to extract action items: ${response.statusText}`);
    }

    const actionItems = await response.json();
    return actionItems;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
