export default {
  async fetch(request) {
    return Response.json({ ok: true, name: "dnyftech-api" });
  },
};
