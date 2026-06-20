import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import type { SupabaseClient } from "@supabase/supabase-js";

function r2Client(): S3Client | null {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

// Delete every R2 object stored under this user's folder (users/<id>/...).
// Best-effort: image cleanup failures must not block account deletion.
export async function deleteUserR2Files(userId: string): Promise<void> {
  const r2 = r2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!r2 || !bucket) return;

  const prefix = `users/${userId}/`;
  let token: string | undefined;
  do {
    const list = await r2.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token })
    );
    const objects = (list.Contents ?? []).map((o) => ({ Key: o.Key! })).filter((o) => o.Key);
    if (objects.length > 0) {
      // DeleteObjects handles up to 1000 keys per call; ListObjectsV2 returns ≤1000.
      await r2.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects } }));
    }
    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);
}

// Fully remove a user: their R2 images, all business rows, then the auth user.
// `admin` must be a service-role Supabase client.
export async function deleteUserAndData(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await deleteUserR2Files(userId);
  } catch (err) {
    console.error("R2 cleanup failed (continuing with account deletion):", err);
  }

  await admin.from("businesses").delete().eq("user_id", userId);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
