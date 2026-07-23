# Jasper Hall — portfolio

A static, single-page portfolio. No framework, no build step, no `npm install`.
Three files plus images.

```
index.html        the page
style.css         design system (Kaolin palette, token-level theming)
app.js            theme toggle, scroll reveal, video motion policy, Euclidean toy
vercel.json       cache headers + clean URLs (optional)
public/shots/     screenshots and renders, WebP, max 1800px wide (~0.9 MB total)
public/shots/_originals/  full-resolution sources, gitignored
public/media/     video (ascii-cli, raybox demo)
.preview/         local verification screenshots (safe to delete)
```

## Run locally

Any static server works. There is nothing to compile.

```bash
npx --yes serve -l 4899 .
# → http://localhost:4899
```

Or `python3 -m http.server 4899`.

## Deploy to Vercel

Point Vercel at this directory. Framework preset: **Other**. Build command: none.
Output directory: the repo root.

```bash
npm i -g vercel      # once
vercel               # preview deploy
vercel --prod        # production
```

Or connect the repo in the Vercel dashboard and accept the defaults — with no
`package.json` build script present, Vercel serves the directory as static files.

Netlify, GitHub Pages and Cloudflare Pages all work the same way: publish
directory is the repo root, build command is empty.

## Assets

Every project now carries real media. Nothing is a placeholder, and there are
no outstanding `TODO`s in `index.html`.

| Project | Visual it uses | Asset |
| --- | --- | --- |
| waveformed | 3 screenshots (hero + pair) | `shots/waveformed-{rendered,create,home}.webp` |
| The harnesses | diagram only, by design | — |
| Tombogo × Rheome gadget | 2-up product renders | `shots/tombogo-{hero,exploded}.webp` |
| Kaolin | plugin UI + storefront | `shots/kaolin-ui.webp`, `shots/rheome-home.webp` |
| Raybox | looping `<video>` | `media/raybox-demo.{webm,mp4}` |
| drumCircles | screenshot + live iframe | `shots/drumcircles.webp` |
| ascii-cli | looping `<video>` + ASCII specimen | `media/ascii-cli.mp4` |
| Ballad of the Balloons | screenshot + live iframe | `shots/ballad.webp` |
| The Fold — Brand Studio | screenshot | `shots/fold-brand-studio.webp` |
| Mutax | YouTube embed | `youtube-nocookie.com/embed/Fc16EAlU_OQ` |

### Image pipeline

Shots are committed as **WebP, quality 92, max 1800px wide** — around 0.9 MB
for the whole folder, down from ~18 MB of PNG. Full-resolution sources live in
`public/shots/_originals/`, which is gitignored. To re-encode after dropping a
new source in there:

```bash
python3 - <<'PY'
import os
from PIL import Image
SHOTS, ORIG = "public/shots", "public/shots/_originals"
for name in sorted(os.listdir(ORIG)):
    if not name.endswith(".png"): continue
    im = Image.open(os.path.join(ORIG, name)).convert("RGB")
    if im.width > 1800:
        im = im.resize((1800, round(im.height * 1800 / im.width)), Image.LANCZOS)
    im.save(os.path.join(SHOTS, name[:-4] + ".webp"), "WEBP", quality=92, method=6)
    print(name, im.size)
PY
```

Remember to update `width`/`height` on the `<img>` when a size changes — they
are what reserve the box and stop the page shifting as images arrive.

## Live embeds

Three `<iframe>`s are active, all verified rendering:

| Embed | URL | Frame sizing |
| --- | --- | --- |
| drumCircles | <https://drum-circles.vercel.app/> | `.embed--app` — fixed height, scrolls internally (the app is ~4000px tall) |
| Ballad of the Balloons | <https://ballad-of-the-balloons.vercel.app/> | `.embed--fixed` — pinned to the app's real 840px canvas |
| Mutax | `youtube-nocookie.com` | `.embed--video` — 16:9 |

Both self-hosted apps are sandboxed (`allow-scripts allow-same-origin
allow-popups`), which is safe because they are cross-origin to this site. The
screenshot above each embed is a deliberate fallback: if a deployment goes
down or starts sending `X-Frame-Options`, the project still reads.

Ballad deliberately has **no** `allow="autoplay"`. Web Audio needs a user
gesture, and nothing on this page should make noise unasked.

## Design notes

- **Palette** is Kaolin — the white clay used for porcelain — plus cobalt
  underglaze. Light and dark are defined **only** as token overrides on
  `:root`, `@media (prefers-color-scheme: dark)`, `:root[data-theme="dark"]`
  and `:root[data-theme="light"]`. Components never hardcode a colour, so the
  toggle wins in both directions and system preference is respected by default.
- **Type** is system stacks only, no webfont URLs: monospace for display and
  labels, serif for body copy.
- `→ ↗ ↺` are used as structural punctuation throughout — the subject is agent
  loops and pipelines.
- The Euclidean toy uses Bjorklund's algorithm. Audio is created on the first
  click of the play button and never before.
- `prefers-reduced-motion` disables the diagram animation and the scroll reveal
  (CSS), and stops the two autoplaying clips from autoplaying or looping —
  they fall back to a still first frame plus controls (`app.js`, section 3,
  since `autoplay` is an attribute and cannot be undone from a stylesheet).
  Pausing a clip by hand is remembered; it is never restarted behind you.
