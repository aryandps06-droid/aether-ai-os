// api/chat.js — Vercel Serverless Function
// Proxies Gemini API streaming requests. Accepts apiKey from client body (user-provided key).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contents, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required. Please add your Gemini API key in Settings.'
      });
    }

    // Sanitize apiKey — extract raw key if user pasted full URL or curl command
    let cleanKey = apiKey.trim();
    if (cleanKey.includes('key=')) {
      const match = cleanKey.match(/key=([^&\s"']+)/);
      if (match) cleanKey = match[1];
    }
    cleanKey = cleanKey.replace(/['"]/g, '').replace(/\s+/g, '');

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Invalid contents payload.' });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${cleanKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Aether Chat] Gemini error:', geminiRes.status, errText);

      let friendlyError = `Gemini API connection error (HTTP ${geminiRes.status}).`;
      if (geminiRes.status === 400) friendlyError += ' Make sure you copied ONLY the key value (starts with AIzaSy) and not the full URL or curl command.';
      if (geminiRes.status === 403) friendlyError += ' Your API key may be invalid or quota exceeded.';
      if (geminiRes.status === 404) friendlyError += ' Make sure you copied ONLY the key value (starts with AIzaSy) and not the full URL or curl command.';
      if (geminiRes.status === 429) friendlyError = 'Gemini API Rate Limit Exceeded (HTTP 429). You have hit the rate limit or daily quota. Please wait a moment before trying again, or clear your API key in Settings to use Sandbox mode.';

      return res.status(geminiRes.status).json({ error: friendlyError });
    }

    // Stream the Gemini response back to the client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering on Vercel

    if (geminiRes.body) {
      const reader = geminiRes.body.getReader();
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
    // Only send error header if not already started streaming
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
}