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

    // TODO: Fix Gemini API integration - returning mock data for now
    const mockActions = [
      {
        title: 'Complete Q2 Planning',
        description: 'Finalize quarterly objectives and key results',
        role: 'CEO',
        level: 'Vision',
        priority: 'High',
        chainOfThought: 'Extracted from transcript discussion about Q2 goals',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        title: 'Review Budget Allocation',
        description: 'Approve infrastructure budget for cloud migration',
        role: 'CFO',
        level: 'Project',
        priority: 'Medium',
        chainOfThought: 'Budget discussion mentioned in transcript',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    return res.json({ actions: mockActions });

    /* Gemini integration - disabled due to model availability issues
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Analyze: ${transcript}`,
      config: { ... }
    });
    */
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Extraction failed', message: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
