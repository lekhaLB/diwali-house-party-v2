import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

export const config = { path: "/api/rsvp" };

const J = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

export default async (req) => {
  const store = getStore({ name: "rsvps", consistency: "strong" });
  const url = new URL(req.url);
  const admin = process.env.ADMIN_KEY && url.searchParams.get("key") === process.env.ADMIN_KEY;

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return J({ error: "bad request" }, 400); }
    const name = clip(b.name, 60);
    if (!name) return J({ error: "name required" }, 400);
    const rec = {
      id: randomUUID(), name,
      status: clip(b.status, 40),
      guests: Math.min(Math.max(parseInt(b.guests) || 1, 1), 10),
      note: clip(b.note, 300), fit: clip(b.fit, 40), t: Date.now(),
    };
    await store.setJSON(rec.id, rec);
    return J({ ok: true });
  }

  if (!admin) return J({ error: "unauthorized" }, 401);

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const rows = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
    return J(rows.filter(Boolean).sort((a, b) => b.t - a.t));
  }
  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return J({ error: "id required" }, 400);
    await store.delete(id);
    return J({ ok: true });
  }
  return J({ error: "method not allowed" }, 405);
};
