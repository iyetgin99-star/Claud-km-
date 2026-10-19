import { json, guard, bank, toks } from "./_lib.mjs";
// Anahtar kelime (TF-IDF) eşleştirme. Yalnızca soru bankasındaki GERÇEK çıkmış sorular döner.
export default async (req) => {
  const g = guard(req); if (g) return g;
  const { slides = [] } = await req.json(); if (!slides.length) return json({ error: "Slayt metni yok" }, 400);
  const Q = bank(), df = new Map(), qt = Q.map(q => { const t = toks(q.stem + " " + Object.values(q.options).join(" ")); new Set(t).forEach(w => df.set(w, (df.get(w) || 0) + 1)); return new Set(t); });
  const idf = w => Math.log(1 + Q.length / (df.get(w) || 1));
  const st = slides.map(s => ({ n: s.n, title: s.title, set: new Set(toks(s.title + " " + s.text)) }));
  const all = new Set(st.flatMap(s => [...s.set]));
  const out = Q.map((q, i) => {
    const shared = [...qt[i]].filter(w => all.has(w)); const sc = shared.reduce((a, w) => a + idf(w), 0) / Math.sqrt(qt[i].size || 1);
    let best = null, bs = 0; for (const s of st) { const v = shared.filter(w => s.set.has(w)).reduce((a, w) => a + idf(w), 0); if (v > bs) { bs = v; best = s } }
    return { q, sc, shared: shared.slice(0, 8), slide: best && { n: best.n, title: best.title } };
  }).filter(x => x.sc > 0 && x.shared.length >= 2).sort((a, b) => b.sc - a.sc).slice(0, 40);
  const top = out[0]?.sc || 1;
  return json({ method: "anahtar kelime (TF-IDF); anlamsal/embedding eşleştirme yapılmadı", count: out.length,
    results: out.map(x => ({ ...x.q, score: +x.sc.toFixed(2), level: x.sc / top > .66 ? "yuksek" : x.sc / top > .33 ? "orta" : "dusuk", matched_terms: x.shared, slide: x.slide })) });
};
