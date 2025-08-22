import crypto from "crypto";

// AES-256-GCM util
// Token format (base64url): iv(12B) || ciphertext || tag(16B)

const b64url = {
  encode(buf: Buffer) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  },
  decode(s: string) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = 4 - (s.length % 4);
    if (pad !== 4) s = s + "=".repeat(pad);
    return Buffer.from(s, "base64");
  },
};

function getKey(): Buffer {
  const secret = process.env.CRYPTO_SECRET;
  if (!secret) throw new Error("CRYPTO_SECRET not set");
  // Accept 32-byte raw or base64/base64url
  let key: Buffer;
  if (/^[A-Za-z0-9_\-]+$/.test(secret) && (secret.length % 4 !== 1)) {
    try { key = b64url.decode(secret); } catch { key = Buffer.from(secret); }
  } else if (/^[A-Za-z0-9+/=]+$/.test(secret)) {
    try { key = Buffer.from(secret, "base64"); } catch { key = Buffer.from(secret); }
  } else {
    key = Buffer.from(secret);
  }
  if (key.length < 32) {
    // Derive to 32 bytes deterministically
    key = crypto.createHash("sha256").update(key).digest();
  } else if (key.length > 32) {
    key = key.subarray(0, 32);
  }
  return key;
}

export function encryptToToken(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return b64url.encode(Buffer.concat([iv, ciphertext, tag]));
}

export function decryptFromToken(token: string): string {
  const key = getKey();
  const buf = b64url.decode(token);
  if (buf.length < 12 + 16) throw new Error("INVALID_TOKEN");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const ciphertext = buf.subarray(12, buf.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return plaintext;
}

export function makeOpaqueUrl(url: string): string {
  const token = encryptToToken(url);
  return `/pay/redirect?token=${encodeURIComponent(token)}`;
}
