"""Rebuild the social sharing image using the site's exact SVG brand icon."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import cairosvg
import io
import re

ROOT = Path(__file__).resolve().parents[1]
SCALE = 3
WIDTH, HEIGHT = 1200, 630
BG, NAVY, BLUE = "#f7f7f8", "#14202e", "#8199ac"
INTER = Path("/usr/share/fonts/opentype/inter")
# Install Ubuntu's fonts-inter package in the workflow (not in the repository).
def font(weight, size):
    files = {
        "regular": "Inter-Regular.otf",
        "medium": "Inter-Medium.otf",
        "semi": "Inter-SemiBold.otf",
        "bold": "Inter-ExtraBold.otf",
        "black": "Inter-Black.otf",
    }
    return ImageFont.truetype(str(INTER / files[weight]), round(size * SCALE))

canvas = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), BG)
draw = ImageDraw.Draw(canvas)

def put(content, x, y, size, weight="regular", fill=NAVY):
    f = font(weight, size)
    draw.text((round(x * SCALE), round(y * SCALE)), content, fill=fill, font=f, anchor="lt")
    return x + draw.textlength(content, font=f) / SCALE

# Convert favicon.svg directly, so social logo can never drift from site logo.
svg = (ROOT / "favicon.svg").read_bytes()
raw = cairosvg.svg2png(bytestring=svg, output_width=68*SCALE, output_height=68*SCALE)
logo = Image.open(io.BytesIO(raw)).convert("RGBA")
canvas.paste(logo, (60*SCALE, 54*SCALE), logo)

# Keep the wordmark's period directly after 'things', aligned to its baseline.
end = put("the little things", 147, 67, 26, "bold")
put(".", end-1.6, 86, 26, "bold", BLUE)
put("W E B S I T E   D E S I G N", 148, 106, 10, "semi")

put("THE DIFFERENCE BETWEEN GOOD AND GREAT IS", 68, 194, 20)
put("THE LITTLE", 52, 266, 115, "black")
end = put("THINGS", 52, 385, 130, "black")
put(".", end-5, 458, 130, "black")
put("THOUGHTFUL WEBSITES. BUILT WITH INTENTION.", 65, 575, 14, "medium")
put("TLT-STUDIOS.COM", 968, 575, 14, "semi")

finished = canvas.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
finished.quantize(colors=16, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(
    ROOT / "social-preview.png", optimize=True, compress_level=9
)

homepage = ROOT / "index.html"
markup = homepage.read_text()
markup = re.sub(r"social-preview\.png\?v=\d+", "social-preview.png?v=5", markup)
homepage.write_text(markup)
