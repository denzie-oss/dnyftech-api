const ORIGIN = "https://dnyftech.pages.dev";
const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Vary": "Origin",
};
const json = (data, status = 200) =>
  Response.json(data, { status, headers: cors });

async function authorized(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const given = (request.headers.get("Authorization") || "").replace(/^Bearer /, "");
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(env.ADMIN_PASSWORD)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const path = new URL(request.url).pathname;

    if (path === "/") return json({ ok: true, name: "dnyftech-api" });
    if (path === "/api/hello")
      return json({ message: "Hello from dnyftech", time: new Date().toISOString() });

    const m = path.match(/^\/api\/notes(?:\/(\d+))?$/);
    if (!m) return json({ error: "Not found" }, 404);
    const id = m[1];

    if (request.method === "GET" && !id) {
      const { results } = await env.DB.prepare(
        "SELECT id, text, created_at FROM notes ORDER BY id DESC LIMIT 50"
      ).all();
      return json(results);
    }

    if (!(await authorized(request, env))) return json({ error: "Unauthorized" }, 401);

    const body = request.method === "DELETE" ? {} : await request.json().catch(() => ({}));
    const text = String(body.text || "").trim().slice(0, 500);

    if (request.method === "POST" && !id) {
      if (!text) return json({ error: "text required" }, 400);
      await env.DB.prepare("INSERT INTO notes (text) VALUES (?)").bind(text).run();
      return json({ ok: true }, 201);
    }
    if (request.method === "PUT" && id) {
      if (!text) return json({ error: "text required" }, 400);
      await env.DB.prepare("UPDATE notes SET text = ? WHERE id = ?").bind(text, id).run();
      return json({ ok: true });
    }
    if (request.method === "DELETE" && id) {
      await env.DB.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
    return json({ error: "Method not allowed" }, 405);
  },
};
