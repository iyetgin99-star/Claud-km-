import { json, guard, bank, claude } from "./_lib.mjs";
export default async (req) => {
  const g = guard(req); if (g) return g;
  const { text = "", n = 5, hoca = "" } = await req.json();
  const N = [5, 10, 20].includes(n) ? n : 5; if (text.length < 300) return json({ error: "Slayt metni çok kısa" }, 400);
  const ex = bank().filter(q => hoca && q.hoca && q.hoca.toLocaleLowerCase("tr") === hoca.toLocaleLowerCase("tr") && q.answer).slice(0, 6)
    .map(q => `Soru: ${q.stem}\n` + Object.entries(q.options).map(([k, v]) => `${k}) ${v}`).join("\n") + `\nCevap: ${q.answer}`).join("\n\n");
  const sys = `Tıp fakültesi kurul sınavı için çoktan seçmeli (A-E) çalışma soruları üret. YALNIZCA verilen slayt metnine dayan; metinde desteklenmeyen veya tıbbi olarak belirsiz soru üretme. Doğru cevabı kesin olmayan soruyu atla; istenenden az soru üretebilirsin. Çıktı yalnızca JSON: {"questions":[{"stem":"","options":{"A":"","B":"","C":"","D":"","E":""},"answer":"A","explanation":"","slide_basis":"slayttaki dayanak ifade"}]}`;
  const r = await claude(sys, `İstenen soru sayısı: ${N}\n${ex ? "Hocanın geçmiş soru biçimi örnekleri (üslubu taklit et, içeriği kopyalama):\n" + ex + "\n\n" : ""}SLAYT METNİ:\n${text.slice(0, 60000)}`, 8000);
  const qs = (r.questions || []).filter(q => q.stem && q.options && ["A", "B", "C", "D", "E"].every(k => q.options[k]) && "ABCDE".includes(q.answer) && q.explanation).slice(0, N);
  return json({ label: "YAPAY ZEKÂ TARAFINDAN ÜRETİLEN ÇALIŞMA SORULARI — gerçek çıkmış soru değildir", requested: N, produced: qs.length, questions: qs });
};
