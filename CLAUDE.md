# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAYLESS is the stage name for an electronic musician, Chris.

The idea is to "say less" and do more. However, that alone is a bland tautology at best.
In line with the philosophy of "show, don't tell", SAYLESS is the rebel yell that doesn't want to
take over or disrupt the music industry, he will do his music project in a way that is the north star
for any independent musician also seeking to escape the matrix.

The thing is, remember the Nietzsche quote: "I refuse to believe in a god that does not dance"

So we're not telling people to escape the matrix - you have to figure that out.
What we're doing is living what comes next. And showing where it makes sense.

The music genre is indie dance.

The branding is tacti-cool for the guys and tacti-cute for the girls.

The font is a stencil that is easily reproducible in the real world - super tactical.
The logo is an emoji created by stable diffusion - hush + kiss.

And the web property is going to be weird and wild.

We've hacked the planet.
Now - we're remixing the world.

This repository is doing branding, web properties, etc in a true open source way.


## Project Structure

- `index.html` - Main landing page (2MB+ file)
- `logo/` - Contains brand logos (PNG formats)
  - SAYLESS-TRANSPARENT.png (official logo)
  - SAYLESS-BLACK-BG.png
  - SAYLESS.png
- `fonts/` - Typography assets
  - StencilGothic.ttf (official font)
  - Various other stencil/grunge font archives
- `brand/` - Branding materials and merchandise designs
- `docs/` - Documentation assets
- `etc/` - Miscellaneous assets

## Development Notes

### Static Site
This is a static HTML site with no build process or package management. Changes are made directly to HTML files.

### Design Philosophy
- Black and white aesthetic
- Stencil Gothic typography
- Minimalist approach ("making your stamp or mark, not advertising")
- "NOT FOR SALE" brand ethos
- "Remix your world" - the brand catchphrase

### Working with Large Files
The index.html file exceeds 256KB. Use grep or specific line ranges when reading/editing this file.

## Common Tasks

### Adding New Pages
When creating new HTML pages, maintain consistency with the existing design:
- Use the same black background and white text styling
- Include the StencilGothic font
- Follow the minimalist aesthetic

### Logo Usage
Official logo path: `logo/SAYLESS-TRANSPARENT.png`
Use this for any new pages or features requiring the logo.

### Font Implementation
The official font is located at `fonts/StencilGothic.ttf` and should be used for all text elements to maintain brand consistency.
