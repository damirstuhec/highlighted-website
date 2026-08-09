import { onRequest as handlePublishedBookRequest } from "./functions/books/[[path]].js";

export default {
  fetch(request, env, context) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/books" || pathname.startsWith("/books/")) {
      return handlePublishedBookRequest({
        request,
        env,
        waitUntil: (promise) => context.waitUntil(promise),
      });
    }

    return env.ASSETS.fetch(request);
  },
};
