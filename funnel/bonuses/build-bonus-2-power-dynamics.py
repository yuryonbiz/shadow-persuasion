#!/usr/bin/env python3
"""
Bonus #2: The Power Dynamics Cheatsheet (rev2)

Rebuilt per user feedback:
- Cover: tighter vertical balance, title in 2 lines (was 3), subtitle
  in 2 natural lines (was 4 choppy ones)
- Cheatsheet: plain English throughout (no jargon like BATNA),
  5 chronological sections (BEFORE / OPEN / DURING / IF LOSING / END)
  with one accent color instead of five different colors.
- Each item rewritten for clarity: no tactic names, no cryptic
  shorthand. Just 'this is what you do and why' in clear language.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION_START
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

REPO = Path(__file__).resolve().parents[2]
LOGO = REPO / "public" / "logo.png"
FONT_TTF = REPO / "funnel" / "assets" / "SpecialElite-Regular.ttf"
COVER_OUT = REPO / "funnel" / "assets" / "cover-bonus-2.png"
DOCX_OUT = REPO / "funnel" / "exports" / "bonus-2-power-dynamics-cheatsheet.docx"

BODY_FONT = "Georgia"
TITLE_FONT = "Georgia"

# Brand colors
CREAM = (0xF4, 0xEC, 0xD8)
DARK = (0x1A, 0x1A, 0x1A)
BROWN = (0x5C, 0x3A, 0x1E)
GOLD = (0xD4, 0xA0, 0x17)

DARK_RGB = RGBColor(0x1A, 0x1A, 0x1A)
BROWN_RGB = RGBColor(0x5C, 0x3A, 0x1E)
GOLD_RGB = RGBColor(0xD4, 0xA0, 0x17)
GRAY_RGB = RGBColor(0x6B, 0x5B, 0x3E)


# ========== COVER ==========

def build_cover():
    WIDTH, HEIGHT = 1800, 2700
    img = Image.new("RGB", (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(img)

    label_font = ImageFont.truetype(str(FONT_TTF), 40)
    title_font = ImageFont.truetype(str(FONT_TTF), 110)
    subtitle_font = ImageFont.truetype(str(FONT_TTF), 62)
    author_font = ImageFont.truetype(str(FONT_TTF), 52)

    # Logo — 900px wide, centered, starts at y=380 (same as bonus 3/4)
    logo = Image.open(str(LOGO)).convert("RGBA")
    scale = 900 / logo.width
    logo_resized = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.LANCZOS)
    logo_x = (WIDTH - logo_resized.width) // 2
    logo_y = 380
    img.paste(logo_resized, (logo_x, logo_y), logo_resized)

    # Bonus label — exactly like bonus 3/4 (logo bottom + 80)
    label_text = "// FREE BONUS  02 //"
    bbox = draw.textbbox((0, 0), label_text, font=label_font)
    label_y = logo_y + logo_resized.height + 80
    draw.text(((WIDTH - (bbox[2] - bbox[0])) // 2, label_y), label_text, fill=BROWN, font=label_font)

    # Title — 3 lines to match the rhythm of bonus 3 (which has 3 title lines)
    title_y = label_y + 120
    title_line_spacing = 135

    title_lines = ["THE POWER", "DYNAMICS", "CHEATSHEET"]
    for i, line in enumerate(title_lines):
        bbox = draw.textbbox((0, 0), line, font=title_font)
        draw.text(((WIDTH - (bbox[2] - bbox[0])) // 2, title_y + i * title_line_spacing),
                  line, fill=DARK, font=title_font)

    # Gold rule
    rule_y = title_y + (len(title_lines) * title_line_spacing) + 60
    draw.rectangle([(WIDTH // 2 - 200, rule_y), (WIDTH // 2 + 200, rule_y + 3)], fill=GOLD)

    # Subtitle — 3 lines, more breathing room to fill vertical space
    subtitle_lines = [
        "The One-Page Reference",
        "For Any Conversation",
        "That Actually Matters",
    ]
    sub_y = rule_y + 100
    for line in subtitle_lines:
        bbox = draw.textbbox((0, 0), line, font=subtitle_font)
        draw.text(((WIDTH - (bbox[2] - bbox[0])) // 2, sub_y), line, fill=BROWN, font=subtitle_font)
        sub_y += 110

    # Tagline closer to where author would normally sit — reduces dead gap
    tagline_font = ImageFont.truetype(str(FONT_TTF), 44)
    tagline_text = "PULL IT UP. READ IT. WIN THE ROOM."
    bbox = draw.textbbox((0, 0), tagline_text, font=tagline_font)
    draw.text(((WIDTH - (bbox[2] - bbox[0])) // 2, sub_y + 180), tagline_text, fill=GOLD, font=tagline_font)

    # Author — bottom (same as bonus 3/4)
    author_text = "NATE HARLAN"
    bbox = draw.textbbox((0, 0), author_text, font=author_font)
    draw.text(((WIDTH - (bbox[2] - bbox[0])) // 2, HEIGHT - 280), author_text, fill=DARK, font=author_font)

    # Border
    draw.rectangle([(60, 60), (WIDTH - 60, HEIGHT - 60)], outline=BROWN, width=2)

    COVER_OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(COVER_OUT), "PNG", dpi=(300, 300))
    print(f"Cover saved: {COVER_OUT}")


# ========== DOCX HELPERS ==========

def add_page_number(paragraph):
    run = paragraph.add_run()
    el = OxmlElement("w:fldChar")
    el.set(qn("w:fldCharType"), "begin")
    run._r.append(el)
    it = OxmlElement("w:instrText")
    it.set(qn("xml:space"), "preserve")
    it.text = "PAGE"
    run._r.append(it)
    el = OxmlElement("w:fldChar")
    el.set(qn("w:fldCharType"), "end")
    run._r.append(el)
    run.font.name = BODY_FONT
    run.font.size = Pt(10)
    run.font.color.rgb = BROWN_RGB


def set_page_background_cream(doc):
    background = OxmlElement("w:background")
    background.set(qn("w:color"), "F4ECD8")
    doc.element.insert(0, background)
    settings = doc.settings.element
    display_bg = OxmlElement("w:displayBackgroundShape")
    settings.append(display_bg)


# ========== CHEATSHEET CONTENT (plain English, no jargon) ==========

SECTIONS = [
    {
        "title": "1.  BEFORE YOU WALK IN",
        "subtitle": "Three things to settle in your own head.",
        "items": [
            "Know what you'll do if the conversation fails. Without a clear backup plan, you'll give in under pressure.",
            "Pick ONE thing you want to focus on doing during the conversation. Not three. One.",
            "Decide your bottom line (the worst outcome you'd still accept). Keep this number in your head. Never say it out loud.",
        ],
    },
    {
        "title": "2.  THE FIRST 30 SECONDS",
        "subtitle": "The opening determines everything that follows.",
        "items": [
            "Match their energy level. If they're calm, be calm. Don't be more excited than they are.",
            "Skip the polite openers like \"thanks for making time.\" Those are the exact words everyone else uses. Everyone else loses.",
            "Start with something specific about them, not a pitch. A real observation. Something that shows you paid attention.",
        ],
    },
    {
        "title": "3.  DURING THE CONVERSATION",
        "subtitle": "The small moves that quietly shift the dynamic in your favor.",
        "items": [
            "After they make a statement, pause for four full seconds before you respond. They'll often fill the silence themselves.",
            "When you don't know what to say, ask a \"how\" question. \"How would that work?\" \"How did you arrive at that?\" It keeps them talking.",
            "Let them suggest the next step, not you. The person who names the next move has more control.",
            "Don't explain things they didn't ask about. Over-explaining is the most common way people give away leverage.",
        ],
    },
    {
        "title": "4.  IF YOU'RE LOSING GROUND",
        "subtitle": "Recovery moves. Use in this order.",
        "items": [
            "First: stop talking. Count to four in your head. Do not break the silence.",
            "Second: ask a question. Any question. It slows the pace and puts them back in the work of answering.",
            "Third: repeat your main point using the exact same words you used earlier. Not new arguments. Same sentence.",
            "If none of that works: \"Let me think about this. I'll follow up Monday.\" Leave. Re-engage when you're ready.",
        ],
    },
    {
        "title": "5.  HOW TO END",
        "subtitle": "The last thirty seconds matter as much as the first.",
        "items": [
            "If they agree to what you wanted, do not celebrate. Move to a different topic. Celebrating reminds them they just agreed to something.",
            "Send a short email within 24 hours. Two sentences, maximum. Long emails give them something to reconsider.",
            "Don't recap what was agreed. The recap is when people start finding things they wish they'd negotiated harder on.",
            "The emotional state you leave them in is what they'll remember. Choose it on purpose. Don't just drift out.",
        ],
    },
]


# ========== DOCX BUILD ==========

def build_docx():
    doc = Document()
    # NOTE: do NOT call set_page_background_cream() here. The PNG cover already
    # has cream baked in, and the <w:background> element causes Word to render
    # a top gap above the cover image. Bonuses 1, 3, 4 omit it and render correctly.
    # set_page_background_cream(doc)  # ← this was the top-gap bug

    # ==== SECTION 1: COVER (full-bleed) ====
    cover_section = doc.sections[0]
    cover_section.page_width = Inches(6)
    cover_section.page_height = Inches(9)
    cover_section.top_margin = Inches(0)
    cover_section.bottom_margin = Inches(0)
    cover_section.left_margin = Inches(0)
    cover_section.right_margin = Inches(0)
    cover_section.header_distance = Inches(0)
    cover_section.footer_distance = Inches(0)

    # NOTE: do NOT set alignment here. Setting jc="left" makes Word add
    # vertical line-height padding above the inline image. Bonus 3/4 omit
    # alignment entirely and render flush to top — match that exactly.
    cover_p = doc.add_paragraph()
    cover_p.paragraph_format.space_before = Pt(0)
    cover_p.paragraph_format.space_after = Pt(0)
    cover_p.paragraph_format.line_spacing = 1.0
    run = cover_p.add_run()
    run.add_picture(str(COVER_OUT), width=Inches(6), height=Inches(9))

    # ==== SECTION 2: THE CHEATSHEET ====
    body = doc.add_section(WD_SECTION_START.NEW_PAGE)
    body.page_width = Inches(6)
    body.page_height = Inches(9)
    body.top_margin = Inches(0.6)
    body.bottom_margin = Inches(0.5)
    body.left_margin = Inches(0.6)
    body.right_margin = Inches(0.6)
    body.header_distance = Inches(0.2)
    body.footer_distance = Inches(0.3)
    body.header.is_linked_to_previous = False
    body.footer.is_linked_to_previous = False

    # Footer: just the domain
    f = body.footer.paragraphs[0]
    f.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = f.add_run("SHADOWPERSUASION.COM")
    r.font.name = BODY_FONT
    r.font.size = Pt(8)
    r.font.color.rgb = BROWN_RGB

    # === Header block on cheatsheet page ===
    # Logo
    logo_p = doc.add_paragraph()
    logo_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    logo_p.paragraph_format.space_before = Pt(0)
    logo_p.paragraph_format.space_after = Pt(6)
    run = logo_p.add_run()
    run.add_picture(str(LOGO), width=Inches(1.3))

    # Title
    t = doc.add_paragraph()
    t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    t.paragraph_format.space_after = Pt(2)
    r = t.add_run("POWER DYNAMICS CHEATSHEET")
    r.font.name = TITLE_FONT
    r.font.size = Pt(16)
    r.bold = True
    r.font.color.rgb = DARK_RGB

    # Subtitle
    s = doc.add_paragraph()
    s.alignment = WD_ALIGN_PARAGRAPH.CENTER
    s.paragraph_format.space_after = Pt(14)
    r = s.add_run("Pull this up on your phone before any conversation that matters.")
    r.font.name = TITLE_FONT
    r.font.size = Pt(9.5)
    r.italic = True
    r.font.color.rgb = BROWN_RGB

    # === The five sections ===
    for idx, section in enumerate(SECTIONS):
        # Section number + title
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(1)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(section["title"])
        r.font.name = TITLE_FONT
        r.font.size = Pt(11.5)
        r.bold = True
        r.font.color.rgb = DARK_RGB

        # Section subtitle
        sub = doc.add_paragraph()
        sub.paragraph_format.space_after = Pt(4)
        sub.paragraph_format.keep_with_next = True
        sub.paragraph_format.left_indent = Inches(0.08)
        r = sub.add_run(section["subtitle"])
        r.font.name = TITLE_FONT
        r.font.size = Pt(8.5)
        r.italic = True
        r.font.color.rgb = GRAY_RGB

        # Items
        for i, item in enumerate(section["items"]):
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.first_line_indent = Inches(-0.15)
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.keep_with_next = (i < len(section["items"]) - 1)
            r1 = p.add_run("\u2022  ")
            r1.font.name = BODY_FONT
            r1.font.size = Pt(9)
            r1.bold = True
            r1.font.color.rgb = GOLD_RGB
            r2 = p.add_run(item)
            r2.font.name = BODY_FONT
            r2.font.size = Pt(9)
            r2.font.color.rgb = DARK_RGB

    # Bottom attribution
    foot = doc.add_paragraph()
    foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    foot.paragraph_format.space_before = Pt(16)
    r = foot.add_run("From Shadow Persuasion by Nate Harlan")
    r.font.name = TITLE_FONT
    r.font.size = Pt(8)
    r.italic = True
    r.font.color.rgb = BROWN_RGB

    DOCX_OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(DOCX_OUT))
    print(f"Docx saved: {DOCX_OUT}")
    print(f"Size: {DOCX_OUT.stat().st_size} bytes")


if __name__ == "__main__":
    build_cover()
    build_docx()
