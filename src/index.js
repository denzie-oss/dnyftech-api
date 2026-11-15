const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const { pathname } = new URL(request.url);

    if (pathname === "/api/hello") {
      return Response.json(
        { message: "Hello from dnyftech", time: new Date().toISOString() },
        { headers: cors }
      );
    }

    if (pathname === "/api/notes") {
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const text = String(body.text || "").trim().slice(0, 500);
        if (!text) {
          return Response.json({ error: "text required" }, { status: 400, headers: cors });
        }
        await env.DB.prepare("INSERT INTO notes (text) VALUES (?)").bind(text).run();
        return Response.json({ ok: true }, { status: 201, headers: cors });
      }
      const { results } = await env.DB.prepare(
        "SELECT id, text, created_at FROM notes ORDER BY id DESC LIMIT 50"
      ).all();
      return Response.json(results, { headers: cors });
    }

    if (pathname === "/") {
      return Response.json({ ok: true, name: "dnyftech-api" }, { headers: cors });
    }

    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  },
};
