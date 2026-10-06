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

## Web properites:

  - soundcloud.com/just-say-less/
  - instagram.com/justsayless
  - justsayless.xyz


## Project Structure

- `index.html` - Main landing page (2MB+ file)
- `emoji/` - The **emoji** (shush-face with heart) PNGs. Call it "the emoji", never "the logo".
  - SAYLESS-TRANSPARENT.png
  - SAYLESS-BLACK-BG.png
  - SAYLESS.png
- `fonts/` - Typography assets
  - StencilGothic.ttf (official font)
  - Various other stencil/grunge font archives
- `brand/` - Branding materials and merchandise designs
- `docs/` - Documentation assets
- `etc/` - Miscellaneous assets
- `releases/` - **Album-art workspace, not part of the site.** Cover-art HTML/PNG design files live here and are never deployed. Don't put site pages in it; each release gets a root-level page named `track-<name>.html` (e.g. `track-bad.html`).
- `content/` - **Dropzone for raw/originals. Gitignored.** Anything dropped here that needs to go live must be moved (or copied) into a tracked `assets/` subdirectory (e.g., `assets/photos/` for show imagery) before referencing it from HTML.

## Development Notes

### Static Site
This is a static HTML site with no build process or package management. Changes are made directly to HTML files.

### Deploy
`./go-live` pushes and runs `hetzner/deploy.sh`, which rsyncs only root-level `*.html`, `favicon.ico`, and `assets/`, `emoji/`, `shows/`, `flyers/`, `fonts/`, `presskit/`. New pages should fit that setup (a root `.html` file or one of those folders) rather than changing `deploy.sh`. Production Caddy config lives in `hetzner/setup-caddy.sh`; the root `Caddyfile` is for local dev only. The GitHub Pages workflow (`.github/workflows/static.yml`) is not used; Hetzner is the only real deploy.

### Design Philosophy
- Black and white aesthetic
- Stencil Gothic typography
- Minimalist approach ("making marks, not advertisements")
- Independent spirit and DIY ethos

### Working with Large Files
The index.html file exceeds 256KB. Use grep or specific line ranges when reading/editing this file.

## Common Tasks

### Adding New Pages
When creating new HTML pages, maintain consistency with the existing design:
- Use the same black background and white text styling
- Include the StencilGothic font
- Follow the minimalist aesthetic

### The Emoji (former brand element)
The shush-face image (`emoji/SAYLESS-TRANSPARENT.png`; copies at `assets/images/emoji.png` and `presskit/sayless-emoji.png`) is "the emoji". Never call it the logo. It was removed from the homepage header and social preview cards in Oct 2026; don't add it to new pages unless asked. The current look is the SAYLESS text in Stencil Gothic with the circuit underline (see `assets/social/sayless-og.html`).

### Font Implementation
The official font is located at `fonts/StencilGothic.ttf` and should be used for all text elements to maintain brand consistency.
