// api/chat.js — Vercel Serverless Function
// Calls OpenAI API server-side using OPENAI_API_KEY env var.
// Returns the full response as JSON (no streaming) — maximally reliable.

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('[Aether] OPENAI_API_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'OPENAI_API_KEY not configured on server.'
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages payload.' });
    }

    console.log('[Aether] Calling OpenAI with', messages.length, 'messages');

    // Helper to call OpenAI once
    async function callOpenAI() {
      return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          stream: false,
          max_tokens: 1024,
          temperature: 0.75
        })
      });
    }

    let openaiRes = await callOpenAI();

    // If rate limited, wait 20s and retry once
    if (openaiRes.status === 429) {
      console.log('[Aether] 429 rate limit — waiting 20s before retry...');
      await new Promise(r => setTimeout(r, 20000));
      openaiRes = await callOpenAI();
    }

    const responseText = await openaiRes.text();
    console.log('[Aether] OpenAI status:', openaiRes.status);

    if (!openaiRes.ok) {
      console.error('[Aether] OpenAI error:', openaiRes.status, responseText.slice(0, 300));
      let friendlyError = `OpenAI API error (HTTP ${openaiRes.status})`;
      try {
        const errData = JSON.parse(responseText);
        friendlyError = errData.error?.message || friendlyError;
      } catch {}

      if (openaiRes.status === 401) friendlyError = 'Invalid OpenAI API key. Please check OPENAI_API_KEY in Vercel settings.';
      if (openaiRes.status === 429) friendlyError = 'OpenAI rate limit reached. Please wait a moment and try again.';
      if (openaiRes.status === 503) friendlyError = 'OpenAI servers are busy. Please try again in a few seconds.';

      return res.status(openaiRes.status).json({ error: friendlyError });
    }

    const data = JSON.parse(responseText);
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[Aether] No content in OpenAI response:', responseText.slice(0, 300));
      return res.status(500).json({ error: 'Empty response from OpenAI.' });
    }

    console.log('[Aether] OpenAI response OK, length:', content.length);
    return res.status(200).json({ content });

  } catch (err) {
    console.error('[Aether Chat] Unexpected error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}