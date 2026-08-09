# Highlighted — Landing Page

Marketing site for the Highlighted iOS app, plus the minimal Cloudflare Worker
that serves opt-in personal book-highlight pages. There is no application framework
or build step.

Live: https://usehighlighted.com

---

## Hosting

Hosted with **Cloudflare Workers Static Assets**, deployed automatically from this
Git repo. Every push to the `main` branch publishes within seconds. Pull requests
get their own preview versions.

### Cloudflare Workers configuration

`wrangler.jsonc` keeps static files on Cloudflare's asset path and invokes the
Worker only for `/books/*`. The Worker entrypoint forwards every other request to
the static asset binding.

There is no application build process. Cloudflare uploads the static files and
bundles the small Worker entrypoint during deployment.

### Custom domain

`usehighlighted.com` (registrar: Porkbun). DNS is managed by Cloudflare
(nameservers changed at Porkbun to point at Cloudflare). The domain is attached
to the Worker under Domains & Routes. HTTPS is provisioned automatically.

`www.usehighlighted.com` redirects to the apex. Set this up as a **Redirect Rule**
in the Cloudflare dashboard (Rules → Redirect Rules): redirect
`www.usehighlighted.com/*` to `https://usehighlighted.com/$1` (301). A relative
`_redirects` file cannot do a cross-hostname redirect, so it lives in the dashboard.

---

## Editing & deploying

```bash
# edit index.html locally, then:
git add -A
git commit -m "Describe the change"
git push origin main
# live in a few seconds
```

---

## Adding the App Store preview video

The hero currently shows a placeholder where the portrait app-preview video goes.

1. Add the file: `assets/highlighted-demo.mp4` (portrait, ideally < 15 MB, must be
   under Cloudflare's 25 MB per-file limit).
2. In `index.html`, find the hero comment:
   `DROP YOUR PORTRAIT APP PREVIEW VIDEO HERE`
3. Replace the `<div class="hero-video-ph">…</div>` placeholder block with:

   ```html
   <video autoplay muted loop playsinline poster="assets/poster.jpg">
     <source src="assets/highlighted-demo.mp4" type="video/mp4">
   </video>
   ```

   (A `poster` image is optional. `autoplay muted loop playsinline` makes it behave
   like an ambient hero loop on both desktop and iOS Safari.)
4. Commit and push.

---

## Before launch — checklist

- [ ] Add the hero preview video (see above).
- [ ] Replace the footer **Privacy Policy** and **Terms of Service** `#` links with real URLs.
- [ ] Confirm the App Store link / ID is correct (currently `id1480216009`).
- [ ] Verify the App Store rating shown in the proof bar (currently `4.9`).
- [ ] Test on a real iPhone and on desktop; confirm HTTPS padlock and `www` redirect.

---

## File overview

```
index.html              The entire site (inline CSS/JS; icon, QR, App Store badge
                        embedded as data URIs — page renders without assets/).
worker.js                Worker entrypoint that dispatches /books/* requests and
                        otherwise preserves the static asset path.
functions/books/         Validates public links and privately proxies rendering to
                        the Highlighted server. Tokens never appear in origin URLs.
assets/
  published-book-page.css
                        Shared, app-matched styling for published highlight pages.
  highlighted-demo.mp4  App preview video (add when ready).
  icon*.png             App icon, various sizes (reference / favicons).
  qr.png                App Store QR code (reference; also embedded in HTML).
  appstore-badge.svg    Official Apple download badge (reference; also embedded).
  icons/                "How it works" section glyphs (reference; embedded via CSS).
_headers                Cloudflare: caching + security headers.
wrangler.jsonc          Worker/Pages config (asset directory).
package.json            Dependency-free Node test command (`npm test`).
.assetsignore           Files NOT to serve publicly (.git, README, etc.).
.gitignore
```

> Note: the icon, QR, App Store badge, and section icons are all embedded directly
> in `index.html` as data URIs, so the page is fully self-contained. The copies in
> `assets/` are kept for reference and as source files. The one file the page
> genuinely loads at runtime is the video, once added.

The Worker needs three environment variables: `PUBLISHED_BOOK_ORIGIN`
(the HTTPS server origin), `PUBLISHED_BOOK_PROXY_SECRET` (a shared high-entropy
secret), and optionally `APP_STORE_URL` (defaults to Highlighted's current App
Store URL). Configure the same proxy secret on the server. Run `npm test` to test
the public routing and privacy boundary. The Function also applies coarse
per-isolate request limits; retain Cloudflare's managed abuse controls as the
outer production defense.
