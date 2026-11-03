import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

export const config = { path: "/api/photos" };

const J = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const store = getStore({ name: "photos", consistency: "strong" });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const admin = process.env.ADMIN_KEY && url.searchParams.get("key") === process.env.ADMIN_KEY;

  if (req.method === "GET") {
    if (id) {
      const r = await store.getWithMetadata(id, { type: "arrayBuffer" });
      if (!r) return new Response("Not found", { status: 404 });
      return new Response(r.data, {
        headers: { "content-type": r.metadata?.type || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" },
      });
    }
    const { blobs } = await store.list();
    const items = await Promise.all(
      blobs.map(async (b) => {
        const m = await store.getMetadata(b.key);
        return { id: b.key, name: m?.metadata?.name || "", t: Number(m?.metadata?.t || 0) };
      })
    );
    return J(items.sort((a, b) => b.t - a.t).slice(0, 80));
  }

  if (req.method === "POST") {
    let fd;
    try { fd = await req.formData(); } catch { return J({ error: "bad request" }, 400); }
    const f = fd.get("photo");
    if (!f || typeof f === "string") return J({ error: "no photo" }, 400);
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return J({ error: "unsupported type" }, 415);
    if (f.size > 4_000_000) return J({ error: "too large" }, 413);
    const key = randomUUID();
    await store.set(key, await f.arrayBuffer(), {
      metadata: { name: String(fd.get("name") || "").trim().slice(0, 40), t: String(Date.now()), type: f.type },
    });
    return J({ ok: true, id: key });
  }

  if (req.method === "DELETE") {
    if (!admin) return J({ error: "unauthorized" }, 401);
    if (!id) return J({ error: "id required" }, 400);
    await store.delete(id);
    return J({ ok: true });
  }
  return J({ error: "method not allowed" }, 405);
};
