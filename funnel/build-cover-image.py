#!/usr/bin/env python3
"""
Generate the Shadow Persuasion book cover as a PNG image.

6 x 9 inches at 300 DPI = 1800 x 2700 px.
Cream background (#F4ECD8) matching shadowpersuasion.com.
Logo centered, title/subtitle/author in Special Elite font to match website.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LOGO = REPO / "public" / "logo.png"
FONT = REPO / "funnel" / "assets" / "SpecialElite-Regular.ttf"
OUT = REPO / "funnel" / "assets" / "cover.png"

# Cover dimensions: 6 x 9 inches @ 300 DPI
WIDTH = 1800
HEIGHT = 2700

# Colors from shadowpersuasion.com
BG_COLOR = (0xF4, 0xEC, 0xD8)          # cream
TEXT_DARK = (0x1A, 0x1A, 0x1A)         # near-black
TEXT_SECONDARY = (0x5C, 0x3A, 0x1E)    # dark brown
TEXT_ACCENT = (0xD4, 0xA0, 0x17)       # gold

def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Load fonts
    title_font = ImageFont.truetype(str(FONT), 120)      # SHADOW PERSUASION
    subtitle_font = ImageFont.truetype(str(FONT), 44)    # subtitle lines
    author_font = ImageFont.truetype(str(FONT), 52)      # NATE HARLAN
    tag_font = ImageFont.truetype(str(FONT), 28)         # small tagline

    # ---------- LOGO ----------
    logo = Image.open(str(LOGO)).convert("RGBA")
    # Scale logo to ~3.5 inches wide = 1050 px
    target_w = 1050
    scale = target_w / logo.width
    new_size = (int(logo.width * scale), int(logo.height * scale))
    logo_resized = logo.resize(new_size, Image.LANCZOS)

    # Place logo with top at y = 360 (about 1.2 inches from top), horizontally centered
    logo_x = (WIDTH - logo_resized.width) // 2
    logo_y = 360
    img.paste(logo_resized, (logo_x, logo_y), logo_resized)

    # ---------- TITLE ----------
    title_text = "SHADOW PERSUASION"
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_w = title_bbox[2] - title_bbox[0]
    title_x = (WIDTH - title_w) // 2
    title_y = logo_y + logo_resized.height + 180

    draw.text((title_x, title_y), title_text, fill=TEXT_DARK, font=title_font)

    # ---------- DECORATIVE RULE UNDER TITLE ----------
    rule_y = title_y + 150
    draw.rectangle(
        [(WIDTH // 2 - 180, rule_y), (WIDTH // 2 + 180, rule_y + 3)],
        fill=TEXT_ACCENT
    )

    # ---------- SUBTITLE (three lines) ----------
    subtitle_lines = [
        "The 47 Counterintuitive",
        "Conversation Tactics That Make People",
        "Say Yes Without Realizing Why",
    ]
    sub_y = rule_y + 80
    for line in subtitle_lines:
        line_bbox = draw.textbbox((0, 0), line, font=subtitle_font)
        line_w = line_bbox[2] - line_bbox[0]
        line_x = (WIDTH - line_w) // 2
        draw.text((line_x, sub_y), line, fill=TEXT_SECONDARY, font=subtitle_font)
        sub_y += 68

    # ---------- CLASSIFICATION TAG (small, near bottom) ----------
    tag_text = "FIELD MANUAL  //  117 PAGES  //  47 TACTICS"
    tag_bbox = draw.textbbox((0, 0), tag_text, font=tag_font)
    tag_w = tag_bbox[2] - tag_bbox[0]
    tag_x = (WIDTH - tag_w) // 2
    tag_y = HEIGHT - 420
    draw.text((tag_x, tag_y), tag_text, fill=TEXT_SECONDARY, font=tag_font)

    # ---------- AUTHOR (bottom) ----------
    author_text = "NATE HARLAN"
    author_bbox = draw.textbbox((0, 0), author_text, font=author_font)
    author_w = author_bbox[2] - author_bbox[0]
    author_x = (WIDTH - author_w) // 2
    author_y = HEIGHT - 280

    draw.text((author_x, author_y), author_text, fill=TEXT_DARK, font=author_font)

    # ---------- THIN BORDER AT PAGE EDGE ----------
    border_inset = 60
    draw.rectangle(
        [(border_inset, border_inset), (WIDTH - border_inset, HEIGHT - border_inset)],
        outline=TEXT_SECONDARY,
        width=2
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(OUT), "PNG", dpi=(300, 300))
    print(f"Saved: {OUT} ({img.width}x{img.height})")


if __name__ == "__main__":
    main()
