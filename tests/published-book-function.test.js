import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/books/[[path]].js";

const token = "a".repeat(43);
const env = {
  PUBLISHED_BOOK_ORIGIN: "https://api.example.com",
  PUBLISHED_BOOK_PROXY_SECRET: "proxy-secret",
};

test("proxies a valid public URL without putting its token in the origin URL", async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: url.href, init };
    return new Response("<h1>Published</h1>", {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  };

  try {
    const response = await onRequest(context(`https://usehighlighted.com/books/${token}?page=2`));
    assert.equal(response.status, 200);
    assert.equal(request.url, "https://api.example.com/web/published-book-pages/render");
    assert.deepEqual(JSON.parse(request.init.body), { token, page: 2 });
    assert.equal(request.init.headers["X-Highlighted-Proxy-Secret"], "proxy-secret");
    assert.equal(request.init.redirect, "manual");
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
    assert.equal(await response.text(), "<h1>Published</h1>");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects malformed tokens, paths, methods, and pages before contacting origin", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; };

  try {
    const responses = await Promise.all([
      onRequest(context("https://usehighlighted.com/books/short")),
      onRequest(context(`https://usehighlighted.com/books/${token}/extra`)),
      onRequest(context(`https://usehighlighted.com/books/${token}?page=0`)),
      onRequest(context(`https://usehighlighted.com/books/${token}?page=10001`)),
      onRequest(context(`https://usehighlighted.com/books/${token}`, { request: { method: "POST" } })),
    ]);
    assert.deepEqual(responses.map((response) => response.status), [404, 404, 404, 404, 404]);
    assert.equal(calls, 0);
    assert.match(await responses[0].text(), /Page unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns a branded private fallback when origin is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("offline"); };

  try {
    const response = await onRequest(context(`https://usehighlighted.com/books/${token}`));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Cache-Control"), "private, no-store");
    assert.doesNotMatch(await response.text(), new RegExp(token));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("tracks downloads best-effort and always redirects to the trusted App Store URL", async () => {
  const originalFetch = globalThis.fetch;
  let request;
  let backgroundTask;
  globalThis.fetch = async (url, init) => {
    request = { url: url.href, init };
    return new Response(null, { status: 204 });
  };

  try {
    const response = await onRequest(context(
      `https://usehighlighted.com/books/${token}/download`,
      {
        env: { ...env, APP_STORE_URL: "https://evil.example.com" },
        waitUntil: (task) => { backgroundTask = task; },
      }
    ));
    await backgroundTask;
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("Location"), "https://apps.apple.com/app/id1480216009");
    assert.equal(request.url, "https://api.example.com/web/published-book-pages/app-store-click");
    assert.deepEqual(JSON.parse(request.init.body), { token });
    assert.equal(request.init.redirect, "manual");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("coarsely limits render traffic without exposing the token", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response("<h1>Published</h1>", { status: 200 });
  };

  try {
    let response;
    for (let requestNumber = 1; requestNumber <= 121; requestNumber += 1) {
      response = await onRequest(context(
        `https://usehighlighted.com/books/${token}`,
        { request: { headers: { "CF-Connecting-IP": "203.0.113.99" } } }
      ));
    }

    assert.equal(calls, 120);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("Retry-After"), "60");
    assert.doesNotMatch(await response.text(), new RegExp(token));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function context(url, overrides = {}) {
  return {
    request: new Request(url, overrides.request || {}),
    env: overrides.env || env,
    waitUntil: overrides.waitUntil || (() => {}),
  };
}
