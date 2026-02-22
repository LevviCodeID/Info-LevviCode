let inMemoryCount = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let kv;
    try {
      const { kv } = require('@vercel/kv');
    } catch (e) {
      kv = null;
    }

    const KV_KEY = 'visit_count';

    if (req.method === 'POST') {
      let newCount;
      if (kv && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        newCount = await kv.incr(KV_KEY);
      } else {
        inMemoryCount += 1;
        newCount = inMemoryCount;
      }
      return res.status(200).json({ count: newCount });
    }

    if (req.method === 'GET') {
      let count;
      if (kv && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        count = await kv.get(KV_KEY) || 0;
      } else {
        count = inMemoryCount;
      }
      return res.status(200).json({ count });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}