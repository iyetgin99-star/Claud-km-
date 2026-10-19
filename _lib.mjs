import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
export const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const hits = new Map(); // en iyi çaba: soğuk başlangıçta sıfırlanır; kalıcı limit için DB gerekir
export function guard(req) {
  if (req.headers.get("x-app-password") !== process.env.APP_PASSWORD || !process.env.APP_PASSWORD) return json({ error: "Yetkisiz" }, 401);
  const ip = req.headers.get("x-nf-client-connection-ip") || "x", h = (hits.get(ip) || []).filter(t => Date.now() - t < 3600e3);
  if (h.length >= Number(process.env.HOURLY_LIMIT || 60)) return json({ error: "Saatlik istek sınırı aşıldı" }, 429);
  h.push(Date.now()); hits.set(ip, h); return null;
}
export function bank() {
  const d = dirname(fileURLToPath(import.meta.url));
  return JSON.parse(readFileSync(join(d, "data", "questions_all.json"), "utf8")).filter(q => q.source_type === "cikmis");
}
export async function claude(system, user, max = 4000) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY tanımlı değil");
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6", max_tokens: max, system, messages: [{ role: "user", content: user }] }) });
  if (!r.ok) throw new Error("Claude API " + r.status);
  const t = (await r.json()).content.map(c => c.text || "").join("");
  const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error("Geçersiz model çıktısı");
  return JSON.parse(m[0]);
}
const STOP = new Set("ve veya ile bir bu şu için olan olarak daha çok en de da ki mi hangisi aşağıdakilerden aşağıdaki yanlıştır doğrudur değildir hastada hasta".split(" "));
export const toks = s => (s || "").toLocaleLowerCase("tr").split(/[^a-z0-9çğıöşü]+/).filter(w => w.length > 2 && !STOP.has(w)).map(w => w.slice(0, 6)); // kaba Türkçe kök
