import { NextResponse } from "next/server";
import crypto from "crypto";

// Facebook calls this endpoint when a user removes your app from their account.
// It sends a signed_request we must verify with the App Secret, then confirm deletion.
export async function POST(request: Request) {
  const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
  if (!APP_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let body: URLSearchParams;
  try {
    const text = await request.text();
    body = new URLSearchParams(text);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const signedRequest = body.get("signed_request");
  if (!signedRequest) {
    return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
  }

  // Parse & verify the signed request
  const userId = verifyAndParse(signedRequest, APP_SECRET);
  if (!userId) {
    return NextResponse.json({ error: "Invalid signed_request" }, { status: 403 });
  }

  // Generate a unique confirmation code
  const confirmationCode = crypto.randomBytes(12).toString("hex");

  // In production you would queue a background job here to delete
  // any stored data associated with this Facebook user ID.
  // For syrflow.com: users connect pages but we don't store FB user IDs
  // long-term, so nothing extra is needed beyond revoking the token.

  return NextResponse.json({
    url: `https://syrflow.com/data-deletion?id=${userId}&code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

// GET — human-readable confirmation page (Facebook may redirect users here)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const code = searchParams.get("code") ?? "";
  return NextResponse.redirect(
    new URL(`/data-deletion?id=${id}&code=${code}`, request.url)
  );
}

function verifyAndParse(signedRequest: string, appSecret: string): string | null {
  try {
    const [encodedSig, payload] = signedRequest.split(".");
    if (!encodedSig || !payload) return null;

    // Facebook uses base64url (no padding, - instead of +, _ instead of /)
    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    const expected = crypto.createHmac("sha256", appSecret).update(payload).digest();

    if (!crypto.timingSafeEqual(sig, expected)) return null;

    const data = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return data.user_id ?? data.userId ?? null;
  } catch {
    return null;
  }
}
