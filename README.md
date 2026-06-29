# Highlighted — Landing Page

Marketing site for the Highlighted iOS app. A single static `index.html` (CSS and
JS inline, images embedded as data URIs) plus an `assets/` folder. No build step,
no framework, no dependencies.

Live: https://usehighlighted.com

---

## Hosting

Hosted on **Cloudflare Pages** (free tier), deployed automatically from this Git repo.
Every push to the `main` branch publishes within seconds. Pull requests get their
own preview URLs.

### Cloudflare Pages build settings

When connecting the repo (Workers & Pages → Create → Pages → Connect to Git):

| Setting                  | Value     |
| ------------------------ | --------- |
| Framework preset         | `None`    |
| Build command            | *(empty)* |
| Build output directory   | `/`       |
| Root directory           | `/`       |

There is no build process — Cloudflare just serves the files as-is.

### Custom domain

`usehighlighted.com` (registrar: Porkbun). DNS is managed by Cloudflare
(nameservers changed at Porkbun to point at Cloudflare). The domain is attached
under the Pages project → Custom domains. HTTPS is provisioned automatically.

`www.usehighlighted.com` redirects to the apex via the `_redirects` file.

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
assets/
  highlighted-demo.mp4  App preview video (add when ready).
  icon*.png             App icon, various sizes (reference / favicons).
  qr.png                App Store QR code (reference; also embedded in HTML).
  appstore-badge.svg    Official Apple download badge (reference; also embedded).
  icons/                "How it works" section glyphs (reference; embedded via CSS).
_redirects              Cloudflare: www → apex redirect.
_headers                Cloudflare: caching + security headers.
.gitignore
```

> Note: the icon, QR, App Store badge, and section icons are all embedded directly
> in `index.html` as data URIs, so the page is fully self-contained. The copies in
> `assets/` are kept for reference and as source files. The one file the page
> genuinely loads at runtime is the video, once added.
