export default {
  async fetch(request: Request, env: { ASSETS: { fetch: typeof fetch } }) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith("/api/")) {
      return new Response("API not implemented in Worker yet", { status: 501 });
    }

    // Attempt to fetch the asset
    const response = await env.ASSETS.fetch(request);

    // If asset not found (404), serve index.html for SPA routing
    if (response.status === 404 && !url.pathname.includes(".")) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }

    return response;
  },
};
