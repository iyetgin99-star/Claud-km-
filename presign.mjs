import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { json, guard } from "./_lib.mjs";
export default async (req) => {
  const g = guard(req); if (g) return g;
  const { name = "", size = 0, type = "" } = await req.json();
  const max = Number(process.env.MAX_UPLOAD_MB || 100) * 1048576;
  if (!/\.(pdf|pptx)$/i.test(name)) return json({ error: "Yalnızca .pdf veya .pptx" }, 400);
  if (!(size > 0) || size > max) return json({ error: `Dosya ${process.env.MAX_UPLOAD_MB || 100} MB sınırını aşıyor` }, 413);
  const s3 = new S3Client({ region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
  const key = `slides/${Date.now()}-${crypto.randomUUID()}-${name.replace(/[^\w.\-]/g, "_")}`;
  // ContentLength imzaya dahil: farklı boyutta yükleme R2 tarafından reddedilir (sunucu tarafı boyut doğrulaması)
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentLength: size, ContentType: type || "application/octet-stream" }), { expiresIn: 900 });
  return json({ url, key, contentType: type || "application/octet-stream" });
};
