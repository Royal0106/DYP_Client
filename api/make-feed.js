const { kv } = require('@vercel/kv');

const FEED_KEY = 'make_feed_records';
const MAX_RECORDS = 200;

module.exports = async function handler(req, res) {
  const key = req.headers['x-api-key'];
  if (!process.env.MAKE_FEED_SECRET || key !== process.env.MAKE_FEED_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (req.method === 'POST') {
    const record = req.body;
    if (!record || typeof record !== 'object') {
      return res.status(400).json({ error: 'invalid body' });
    }
    await kv.lpush(FEED_KEY, record);
    await kv.ltrim(FEED_KEY, 0, MAX_RECORDS - 1);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    const records = await kv.lrange(FEED_KEY, 0, MAX_RECORDS - 1);
    return res.status(200).json(records);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method not allowed' });
};
