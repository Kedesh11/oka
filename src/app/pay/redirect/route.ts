import { NextRequest, NextResponse } from "next/server";
import { decryptFromToken } from "@/server/utils/crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 400 });
    const url = decryptFromToken(token);
    // Only allow http/https
    if (!/^https?:\/\//i.test(url)) return NextResponse.json({ error: "INVALID_URL" }, { status: 400 });

    const dest = new URL(url);
    const requestHost = req.headers.get("host") || "";

    // Same-host is always allowed
    if (dest.host === requestHost) {
      return NextResponse.redirect(url);
    }

    // Allowlist via env (comma-separated domains), e.g. "singpay.ga,storage.googleapis.com"
    const raw = process.env.CRYPTO_REDIRECT_ALLOWLIST || "";
    const allow = raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (allow.length > 0) {
      const host = dest.hostname.toLowerCase();
      const ok = allow.some((d) => host === d || host.endsWith(`.${d}`));
      if (!ok) {
        return NextResponse.json({ error: "FORBIDDEN_DOMAIN" }, { status: 403 });
      }
    }

    return NextResponse.redirect(url);
  } catch (e) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }
}
