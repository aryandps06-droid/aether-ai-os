// api/chat.js — Vercel Serverless Function
// Uses Groq API (FREE, no credit card, 30 req/min, OpenAI-compatible format)
// Set GROQ_API_KEY in Vercel Environment Variables.
// Get a free key at: https://console.groq.com

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GROQ_API_KEY not configured. Add it in Vercel → Settings → Environment Variables. Get a free key at console.groq.com'
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages payload.' });
    }

    console.log('[Aether] Calling Groq with', messages.length, 'messages');

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Free, fast, smart
        messages,
        stream: false,
        max_tokens: 1024,
        temperature: 0.75
      })
    });

    const responseText = await groqRes.text();
    console.log('[Aether] Groq status:', groqRes.status);

    if (!groqRes.ok) {
      console.error('[Aether] Groq error:', groqRes.status, responseText.slice(0, 300));
      let friendlyError = `Groq API error (HTTP ${groqRes.status})`;
      try {
        const errData = JSON.parse(responseText);
        friendlyError = errData.error?.message || friendlyError;
      } catch {}

      if (groqRes.status === 401) friendlyError = 'Invalid Groq API key. Please check GROQ_API_KEY in Vercel settings.';
      if (groqRes.status === 429) friendlyError = 'Groq rate limit reached (30 req/min). Please wait a moment and try again.';

      return res.status(groqRes.status).json({ error: friendlyError });
    }

    const data = JSON.parse(responseText);
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'Empty response from Groq.' });
    }

    console.log('[Aether] Groq response OK, length:', content.length);
    return res.status(200).json({ content });

  } catch (err) {
    console.error('[Aether Chat] Unexpected error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}