# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAYLESS is the stage name for an electronic musician. Indie dance. DIY ethos.

The name says it all - show, don't tell.

- **Genre:** Indie dance
- **Aesthetic:** Black and white, stencil typography, minimalist
- **Current brand elements:** Stencil Gothic typography, the circuit-trace motif (from the artist's tattoo; see the homepage divider and `assets/social/sayless-og.html`)
- **Former brand elements:** the emoji (🤫💋 shush-face with heart)
- **Tagline:** "Show up, read the room, let the music speak. Oh, and don't forget to have fun 💃🕺"

## Web properties

- soundcloud.com/just-say-less
- instagram.com/just.sayless
- justsayless.xyz


## Project Structure

- `index.html` - Homepage: releases, upcoming and past shows, about
- `presskit.html` - The EPK (`press.html` redirects to it)
- `track-<name>.html` - One page per release (e.g. `track-bad.html`)
- `dl-<slug>.html` - Free-download gate pages (see below)
- `shows/<date>/` - One page per show; `flyers/<date>/` - show flyers
- `assets/` - Deployed images, video, fonts (`assets/fonts/StencilGothic.ttf`), JS and the download gate (`assets/gate/`)
- `scripts/` - `new-dl.sh`, `check-downloads.sh`, video capture for social loops
- `emoji/` - The **emoji** (shush-face with heart) PNGs. Call it "the emoji", never "the logo".
  - SAYLESS-TRANSPARENT.png
  - SAYLESS-BLACK-BG.png
  - SAYLESS.png
- `fonts/` - Font archive: StencilGothic.ttf plus other stencil/grunge fonts tried for art
- `brand/` - Branding materials and merchandise designs
- `docs/` - Documentation assets
- `etc/` - Miscellaneous assets
- `releases/` - **Album-art workspace, not part of the site.** Cover-art HTML/PNG design files live here and are never deployed. Don't put site pages in it; each release gets a root-level page named `track-<name>.html` (e.g. `track-bad.html`).
- `downloads/` - **Free-download audio for `dl-*.html` gate pages. Gitignored, but deployed**, after `scripts/check-downloads.sh` confirms every referenced file is present.
- `content/` - **Dropzone for raw/originals. Gitignored.** Anything dropped here that needs to go live must be moved (or copied) into a tracked `assets/` subdirectory (e.g., `assets/photos/` for show imagery) before referencing it from HTML.

## Development Notes

### Static Site
This is a static HTML site with no build process or package management. Changes are made directly to HTML files.

### Deploy
`./go-live` pushes and runs `../hetzner/sites/sayless/deploy.sh` from the private `hetzner` repo, a sibling checkout. It rsyncs only root-level `*.html`, `favicon.ico`, and `assets/`, `emoji/`, `shows/`, `flyers/`, `fonts/`, `presskit/`, `downloads/`. New pages should fit that setup (a root `.html` file or one of those folders). Production Caddy config also lives in the hetzner repo; the root `Caddyfile` is for local dev only.

### What belongs in this repo
This repo is public. It holds only the static site and the art tooling (album art, flyers, social cards, QR). Server setup, IPs and hostnames go in `../hetzner`. Personal writing, interviews, plans and production notes go in `../sayless-private`.

### Design Philosophy
- Black and white aesthetic
- Stencil Gothic typography
- Minimalist approach ("making marks, not advertisements")
- Independent spirit and DIY ethos

## Common Tasks

### Adding New Pages
When creating new HTML pages, maintain consistency with the existing design:
- Use the same black background and white text styling
- Include the StencilGothic font
- Follow the minimalist aesthetic

### The Emoji (former brand element)
The shush-face image (`emoji/SAYLESS-TRANSPARENT.png`; copies at `assets/images/emoji.png` and `presskit/sayless-emoji.png`) is "the emoji". Never call it the logo. It was removed from the homepage header and social preview cards in Oct 2026; don't add it to new pages unless asked. It stays as the favicon (`favicon.ico`, 16 and 32 px). The current look is the SAYLESS text in Stencil Gothic with the circuit underline (see `assets/social/sayless-og.html`).

### Free download gates (Hypeddit-style)
`scripts/new-dl.sh <slug> "<TITLE>" <cover> <file>` writes a root `dl-<slug>.html`. The page asks visitors to follow @just.sayless on Instagram and just-say-less on SoundCloud, then unlocks the download. Following is never verified: a step counts as done once it's been tapped. The links open the app when it's installed (universal links on iOS, `intent://` on Android outside in-app browsers). Progress is saved per track in localStorage. The shared code is in `assets/gate/` (`gate.js`, `gate.css`). Audio goes in `downloads/`, which is gitignored (it's never in this public repo) but deployed. Since it only exists on the machine the file was dropped on, `scripts/check-downloads.sh` runs at the start of every deploy (`deploy.sh`, so `go-live` too) and stops it if any `dl-*.html` points at a file that isn't there; otherwise rsync `--delete` would take the live file off the server. A full URL (Dropbox, Drive) also works and is checked with a fetch.

### Font Implementation
The official font is Stencil Gothic. Root pages load it from `assets/fonts/StencilGothic.ttf` (pages in `shows/` use `../../assets/fonts/StencilGothic.ttf`). Use it for headings and UI text; the EPK sets body text in Helvetica for readability.
