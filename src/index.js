const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
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

    if (pathname === "/") {
      return Response.json(
        { ok: true, name: "dnyftech-api" },
        { headers: cors }
      );
    }

    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  },
};
