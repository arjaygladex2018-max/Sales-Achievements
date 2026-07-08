// Text-to-speech proxy: fetches spoken audio from Google Translate TTS and
// streams it back same-origin, so browsers without a speech engine (e.g. Smart
// TVs) can play the announcement as audio without CORS/ORB blocking.
export default async function handler(req, res) {
  const { q, tl } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing q' });
  const lang = (tl || 'en').slice(0, 5);
  const text = String(q).slice(0, 200); // Google TTS caps ~200 chars
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });
    if (!r.ok) throw new Error('TTS fetch failed: ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400'); // cache identical phrases
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
