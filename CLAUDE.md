# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAYLESS is a branding project focused on minimalist design using stencil fonts and a black/white aesthetic. The project is primarily a static website showcasing the SAYLESS brand identity.

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