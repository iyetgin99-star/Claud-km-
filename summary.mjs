import { json, guard, claude } from "./_lib.mjs";
export default async (req) => {
  const g = guard(req); if (g) return g;
  const { text = "" } = await req.json(); if (text.length < 300) return json({ error: "Slayt metni çok kısa" }, 400);
  const sys = `Slayt metninden tek sayfalık son gün tekrar kartı için kısa içerik çıkar. Slayt dışı bilgi KULLANMA; kullanırsan yalnızca "ek_bilgi" alanına yaz. Çıktı yalnızca JSON: {"baslik":"","hap_bilgiler":["≤14 kelime"],"keywords":[""],"ayirt_edici":[{"a":"","b":"","fark":""}],"karistirilanlar":[""],"tablo":{"basliklar":[""],"satirlar":[[""]]},"kodlamalar":[""],"ek_bilgi":[""]} . Liste sınırları: hap 8, keywords 12, ayirt 4, karistirilanlar 4, tablo ≤6 satır, kodlama 3.`;
  return json(await claude(sys, text.slice(0, 60000), 4000));
};
