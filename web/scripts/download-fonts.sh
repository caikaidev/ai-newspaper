#!/usr/bin/env bash
# Downloads required fonts from Google Fonts API and saves to public/fonts/
# Run once after cloning: bash scripts/download-fonts.sh

set -euo pipefail

FONTS_DIR="$(dirname "$0")/../public/fonts"
mkdir -p "$FONTS_DIR"

echo "Downloading fonts to $FONTS_DIR..."

# Playfair Display Black (weight 900) — used for headlines
curl -sL "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vXDXbtXK-F2qO0g.woff2" \
  -o "$FONTS_DIR/playfair-display-black.woff2"
echo "✓ playfair-display-black.woff2"

# UnifrakturMaguntia — used for masthead
curl -sL "https://fonts.gstatic.com/s/unifrakturmaguntia/v16/WWXPlh98MazZmIvvWzM_su5OhdYoHRCrNhmRkc6OonCOcg.woff2" \
  -o "$FONTS_DIR/unifraktur-maguntia.woff2"
echo "✓ unifraktur-maguntia.woff2"

echo ""
echo "Done. Fonts ready for OG image generation."
