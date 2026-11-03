import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

export const config = { path: "/api/notes" };

const J = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

const MAX_NOTES = 500; // simple spam guard

export default async (req) => {
  const store = getStore({ name: "notes", consistency: "strong" });
  const url = new URL(req.url);
  const admin = process.env.ADMIN_KEY && url.searchParams.get("key") === process.env.ADMIN_KEY;

  if (req.method === "GET") {
    // keys start with a reversed timestamp, so sorted keys = newest first
    const { blobs } = await store.list();
    const keys = blobs.map((b) => b.key).sort().slice(0, 100);
    const rows = await Promise.all(keys.map((k) => store.get(k, { type: "json" })));
    return J(rows.filter(Boolean));
  }

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return J({ error: "bad request" }, 400); }
    const t = clip(b.t, 240);
    if (!t) return J({ error: "text required" }, 400);
    const { blobs } = await store.list();
    if (blobs.length >= MAX_NOTES) return J({ error: "wall is full" }, 429);
    const now = Date.now();
    const id = `${String(9999999999999 - now).padStart(13, "0")}-${randomUUID()}`;
    const rec = { id, n: clip(b.n, 40), t, at: now };
    await store.setJSON(id, rec);
    return J({ ok: true, note: rec });
  }

  if (req.method === "DELETE") {
    if (!admin) return J({ error: "unauthorized" }, 401);
    const id = url.searchParams.get("id");
    if (!id) return J({ error: "id required" }, 400);
    await store.delete(id);
    return J({ ok: true });
  }

  return J({ error: "method not allowed" }, 405);
};
