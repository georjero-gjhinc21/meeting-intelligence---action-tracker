import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Schema aligned with src/types.ts
const ACTION_ITEM_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Clear, action-oriented title' },
      description: { type: Type.STRING, description: 'Detailed description of the requirement' },
      role: { type: Type.STRING, enum: ['Board', 'CEO', 'CFO', 'CIO', 'CISO', 'CTO', 'COO'], description: 'Primary responsible stakeholder' },
      level: { type: Type.STRING, enum: ['Board Action', 'Transformation', 'Vision', 'Program', 'Project', 'Task'], description: 'Hierarchy level' },
      priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
      chainOfThought: { type: Type.STRING, description: 'AI reasoning for why this was extracted' },
      dueDate: { type: Type.STRING, description: 'Estimated due date in YYYY-MM-DD if mentioned, else leave empty' }
    },
    required: ['title', 'description', 'role', 'level', 'priority', 'chainOfThought']
  }
};

app.post('/api/extract-actions', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Clip transcript to avoid context limits (~60k chars ≈ 15k tokens)
    const MAX_CHARS = 60_000;
    let clipped = transcript;
    if (transcript.length > MAX_CHARS) {
      const half = Math.floor(MAX_CHARS / 2);
      clipped = transcript.slice(0, half) + '\n\n...[truncated middle of transcript]...\n\n' + transcript.slice(-half);
    }

    // Generate content with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following meeting transcript and extract high-level action items.
Classify them based on the provided stakeholder roles and tracking levels.
Only extract genuine action items — decisions, commitments, follow-ups. Skip small talk.

Transcript:
${clipped}`,
      config: {
        systemInstruction: "You are an elite executive assistant specialized in C-suite meeting intelligence. Map meeting discussions to a strategic hierarchy (Board Action -> Transformation -> Vision -> Program -> Project -> Task). Always provide detailed 'chainOfThought' explaining your reasoning. Return JSON only — no preamble, no markdown.",
        responseMimeType: 'application/json',
        responseSchema: ACTION_ITEM_SCHEMA
      }
    });

    const text = response.text || '[]';
    const actionItems = JSON.parse(text);

    return res.status(200).json({ actions: actionItems });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Extraction failed', message: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
