import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ACTION_ITEM_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Clear, action-oriented title' },
      description: { type: Type.STRING, description: 'Detailed description' },
      role: { type: Type.STRING, enum: ['CEO', 'CFO', 'CIO', 'CISO', 'Board', 'COO'], description: 'Stakeholder role' },
      level: { type: Type.STRING, enum: ['Board', 'Transformation', 'Vision', 'Program', 'Project', 'Task'], description: 'Hierarchy level' },
      priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
      chainOfThought: { type: Type.STRING, description: 'AI reasoning' },
      dueDate: { type: Type.STRING, description: 'Due date YYYY-MM-DD if mentioned' }
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Analyze this meeting transcript and extract high-level action items.
Only extract genuine commitments, decisions, follow-ups.

Transcript:
${transcript}`,
      config: {
        systemInstruction: 'You are an elite executive assistant. Map discussions to strategic hierarchy (Board -> Transformation -> Vision -> Program -> Project -> Task). Provide detailed chainOfThought. Return JSON only.',
        responseMimeType: 'application/json',
        responseSchema: ACTION_ITEM_SCHEMA
      }
    });

    const text = response.text || '[]';
    const actions = JSON.parse(text);

    return res.json({ actions });
  } catch (error) {
    console.error('Gemini error:', error);
    return res.status(500).json({ error: 'Extraction failed', message: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
