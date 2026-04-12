const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/ai/insights
router.post('/insights', async (req, res) => {
  try {
    const { habits = [], logs = [], tasks = [] } = req.body;

    if (!habits.length && !logs.length && !tasks.length) {
      return res.status(400).json({ error: "No data provided" });
    }

    const prompt = `
You are an AI productivity coach.

Analyze the user's data and respond ONLY in JSON format:

{
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

User Data:
Habits: ${JSON.stringify(habits)}
Tasks: ${JSON.stringify(tasks)}
Logs: ${JSON.stringify(logs)}

Rules:
- Max 3 points each
- Keep it practical
- No extra text outside JSON
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const output = response.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch {
      parsed = { raw: output };
    }

    res.json({
      success: true,
      insights: parsed,
    });

  } catch (error) {
    console.error("GROQ ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;