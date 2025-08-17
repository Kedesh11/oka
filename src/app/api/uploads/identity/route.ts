import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files");
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "NO_FILES" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const supabase = getSupabaseServer();
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");

    const results: { path: string; url?: string; error?: string }[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      const arrayBuffer = await f.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `identity-docs/${year}/${month}/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from("public").upload(path, bytes, {
        contentType: f.type || "application/octet-stream",
        upsert: false,
      });
      if (error) {
        results.push({ path, error: error.message });
      } else {
        const { data } = supabase.storage.from("public").getPublicUrl(path);
        results.push({ path, url: data.publicUrl });
      }
    }

    const errors = results.filter((r) => r.error);
    if (errors.length === results.length) {
      return new Response(JSON.stringify({ error: "UPLOAD_FAILED", results }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/uploads/identity", err);
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
