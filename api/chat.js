// api/chat.js — Vercel Serverless Function
// Proxies requests to OpenAI Chat Completions API using server-side API key.
// Set OPENAI_API_KEY in Vercel Environment Variables (never exposed to browser).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API key not configured on server. Please add OPENAI_API_KEY to Vercel environment variables.'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages payload.' });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-efficient, fast, smart
        messages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('[Aether Chat] OpenAI error:', openaiRes.status, errText);

      let friendlyError = `OpenAI API error (HTTP ${openaiRes.status}).`;
      if (openaiRes.status === 401) friendlyError = 'OpenAI API key is invalid or expired. Please check OPENAI_API_KEY in Vercel settings.';
      if (openaiRes.status === 429) friendlyError = 'OpenAI rate limit reached. Please wait a moment and try again.';
      if (openaiRes.status === 500) friendlyError = 'OpenAI server error. Please try again in a few seconds.';

      return res.status(openaiRes.status).json({ error: friendlyError });
    }

    // Stream the OpenAI response back to the client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (openaiRes.body) {
      const reader = openaiRes.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    }

    res.end();

  } catch (err) {
    console.error('[Aether Chat] Unexpected error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
}