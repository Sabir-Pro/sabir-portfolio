// Serverless backend for SabirGPT. Keep OPENAI_API_KEY server-side only.
const rate = globalThis.__sabirRate || new Map();
globalThis.__sabirRate = rate;
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message, history = [], website = '' } = req.body || {};
    if (website) return res.status(400).json({ error: 'Invalid request' });

    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req.headers['x-real-ip'] || 'unknown')).split(',')[0].trim();
    const now = Date.now();
    const windowMs = 60_000;
    const maxRequests = 10;
    const hits = (rate.get(ip) || []).filter(t => now - t < windowMs);
    if (hits.length >= maxRequests) return res.status(429).json({ error: 'Trop de requêtes. Réessaie dans une minute.' });
    hits.push(now);
    rate.set(ip, hits);
    if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'Message required' });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI backend not configured' });

    const safeHistory = Array.isArray(history)
      ? history.slice(-12)
          .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
          .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
      : [];

    const input = [
      { role: 'developer', content: 'Tu es SabirGPT, assistant du portfolio de Sabir IAZZA. Sois utile, précis et naturel. Pour les faits sur Sabir, reste dans le contexte fourni par le portfolio. Ne prétends pas avoir accès à des informations privées. Réponds en français sauf demande contraire.' },
      ...safeHistory,
      { role: 'user', content: message.slice(0, 4000) }
    ];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        input,
        max_output_tokens: 900
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'AI request failed' });

    const answer = data.output_text ||
      data.output?.flatMap(x => x.content || []).find(x => x.type === 'output_text')?.text ||
      '';

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ answer });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}