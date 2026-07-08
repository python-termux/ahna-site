import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

// Losslessly shrink a JPEG by dropping metadata segments at byte level — the
// compressed pixel data is never decoded or re-encoded, so pixels, colors and
// dimensions are untouched. Removes EXIF/XMP (APP1), thumbnails and editor
// junk (APP3–APP15) and comments (COM); keeps JFIF (APP0) and the ICC color
// profile (APP2) so color rendering is identical.
function stripJpegMetadata(buf: Buffer): Buffer {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return buf;
  const parts: Buffer[] = [buf.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) return buf; // malformed — leave untouched
    const marker = buf[i + 1];
    if (marker === 0xda) {
      // Start of Scan: entropy-coded data follows — copy the rest verbatim.
      parts.push(buf.subarray(i));
      return Buffer.concat(parts);
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) return buf;
    const isApp1to15ExceptIcc = marker >= 0xe1 && marker <= 0xef && marker !== 0xe2;
    const isComment = marker === 0xfe;
    if (!isApp1to15ExceptIcc && !isComment) {
      parts.push(buf.subarray(i, i + 2 + len));
    }
    i += 2 + len;
  }
  return buf;
}

// POST /api/optimize-image — losslessly re-compress an already-uploaded R2
// image in place. PNG: re-encoded with maximum-effort DEFLATE (PNG is a
// lossless format, so pixels are bit-identical). JPEG: metadata stripped at
// byte level, never re-encoded. Other types are left as-is. The object is
// only overwritten when the result is strictly smaller.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Matches the upload limit (30/hour per user)
  const rl = rateLimit(`optimize-img:${user.id}`, 30, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const { url } = (body ?? {}) as { url?: unknown };
  if (typeof url !== "string" || !R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) {
    return NextResponse.json({ error: "Not a valid R2 image URL" }, { status: 400 });
  }

  // Only the owner's folder — same guard as delete-image.
  const key = url.slice(R2_PUBLIC_URL.length).replace(/^\//, "");
  if (!key.startsWith(`users/${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const obj = await r2.send(
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key })
    );
    const original = Buffer.from(await obj.Body!.transformToByteArray());
    const contentType = obj.ContentType ?? "";

    let optimized: Buffer | null = null;
    if (contentType === "image/png") {
      optimized = Buffer.from(
        await sharp(original)
          .keepIccProfile()
          .png({ compressionLevel: 9, effort: 10, palette: false })
          .toBuffer()
      );
    } else if (contentType === "image/jpeg") {
      optimized = stripJpegMetadata(original);
    }

    if (!optimized || optimized.length >= original.length) {
      return NextResponse.json({ ok: true, before: original.length, after: original.length, saved: 0 });
    }

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: optimized,
        ContentType: contentType,
      })
    );
    return NextResponse.json({
      ok: true,
      before: original.length,
      after: optimized.length,
      saved: original.length - optimized.length,
    });
  } catch {
    // Optimization is best-effort — the original upload is already safe in R2.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
