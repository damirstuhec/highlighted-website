const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const DEFAULT_APP_STORE_URL = "https://apps.apple.com/app/id1480216009";
const RATE_BUCKETS = new Map();
const MAX_RATE_BUCKETS = 10_000;

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length < 2 || parts[0] !== "books" || !TOKEN_PATTERN.test(parts[1])) {
    return unavailableResponse();
  }

  const token = parts[1];
  if (parts.length === 3 && parts[2] === "download") {
    if (context.request.method !== "GET") return unavailableResponse();
    return downloadResponse(context, token);
  }
  if (parts.length !== 2 || context.request.method !== "GET") {
    return unavailableResponse();
  }

  const page = parsePage(url.searchParams.get("page"));
  if (page === null) return unavailableResponse();
  if (!consumeRateLimit(`render:${clientIP(context.request)}`, 120)) {
    return rateLimitedResponse();
  }

  return renderResponse(context, token, page);
}

async function renderResponse(context, token, page) {
  const endpoint = originEndpoint(context.env, "/web/published-book-pages/render");
  if (!endpoint) return unavailableResponse();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Highlighted-Proxy-Secret": context.env.PUBLISHED_BOOK_PROXY_SECRET,
      },
      body: JSON.stringify({ token, page }),
      redirect: "manual",
      signal: controller.signal,
    });

    if (response.status !== 200 && response.status !== 404) {
      return unavailableResponse();
    }

    const headers = publicHeaders();
    headers.set("Content-Type", response.headers.get("Content-Type") || "text/html; charset=utf-8");
    return new Response(response.body, { status: response.status, headers });
  } catch {
    return unavailableResponse();
  } finally {
    clearTimeout(timeout);
  }
}

function downloadResponse(context, token) {
  if (consumeRateLimit(`click:${clientIP(context.request)}`, 30)) {
    const tracking = trackAppStoreClick(context.env, token);
    if (typeof context.waitUntil === "function") context.waitUntil(tracking);
  }

  const location = validAppStoreURL(context.env.APP_STORE_URL) || DEFAULT_APP_STORE_URL;
  const headers = publicHeaders();
  headers.set("Location", location);
  return new Response(null, { status: 302, headers });
}

async function trackAppStoreClick(env, token) {
  const endpoint = originEndpoint(env, "/web/published-book-pages/app-store-click");
  if (!endpoint) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Highlighted-Proxy-Secret": env.PUBLISHED_BOOK_PROXY_SECRET,
      },
      body: JSON.stringify({ token }),
      redirect: "manual",
      signal: controller.signal,
    });
  } catch {
    // Tracking is deliberately best-effort and never blocks the App Store redirect.
  } finally {
    clearTimeout(timeout);
  }
}

function originEndpoint(env, path) {
  if (!env.PUBLISHED_BOOK_ORIGIN || !env.PUBLISHED_BOOK_PROXY_SECRET) return null;
  try {
    const origin = new URL(env.PUBLISHED_BOOK_ORIGIN);
    const isLoopback = origin.hostname === "127.0.0.1" || origin.hostname === "localhost";
    if (origin.protocol !== "https:" && !(origin.protocol === "http:" && isLoopback)) {
      return null;
    }
    return new URL(path, origin.origin);
  } catch {
    return null;
  }
}

function validAppStoreURL(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "apps.apple.com" ? url.href : null;
  } catch {
    return null;
  }
}

function parsePage(value) {
  if (value === null) return 1;
  if (!/^[1-9][0-9]{0,4}$/.test(value)) return null;
  const page = Number(value);
  return page <= 10_000 ? page : null;
}

function clientIP(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function consumeRateLimit(key, limit) {
  const minute = Math.floor(Date.now() / 60_000);
  const existing = RATE_BUCKETS.get(key);
  const count = existing?.minute === minute ? existing.count + 1 : 1;
  RATE_BUCKETS.set(key, { minute, count });

  if (RATE_BUCKETS.size > MAX_RATE_BUCKETS) {
    RATE_BUCKETS.delete(RATE_BUCKETS.keys().next().value);
  }

  return count <= limit;
}

function rateLimitedResponse() {
  const response = unavailableResponse(429);
  response.headers.set("Retry-After", "60");
  return response;
}

function unavailableResponse(status = 404) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#FAF7F0"><title>Page unavailable · Highlighted</title><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/published-book-page.css?v=18"></head><body><main class="unavailable-page"><div><h1>Page unavailable</h1><p>This Highlighted page may have been unpublished or its link may have changed.</p><a class="text-link" href="https://usehighlighted.com">Learn more about Highlighted</a></div></main></body></html>`;
  const headers = publicHeaders();
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(html, { status, headers });
}

function publicHeaders() {
  return new Headers({
    "Cache-Control": "private, no-store",
    "Content-Security-Policy": "default-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https: data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  });
}
