export default async function handler(req, res) {
  const { gid } = req.query;
  if (!gid) return res.status(400).json({ error: 'Missing gid' });
  const SHEET_ID = '1giaUbA2D2s5M9IzMOy85FpQL8u86YcyqVMzB5wZy1EY';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error('Sheet fetch failed: ' + r.status);
    const text = await r.text();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}