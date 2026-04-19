#!/usr/bin/env python3
"""
Build a professionally-formatted Word document for Shadow Persuasion.

Updates in this version:
- Cover page: full-page cover image (cream background, Special Elite font,
  matches shadowpersuasion.com brand)
- Manual TOC with all 16 chapters visible immediately (no F9 update needed)
- Logo in header sits near top of page, more padding between header and body
- All horizontal rules stripped
- No duplicate title block after TOC
- Body in Georgia 11pt justified for readability
- Each chapter starts on a new page
- Footer: centered page numbers
"""

from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.enum.section import WD_SECTION_START
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import re

REPO = Path(__file__).resolve().parent.parent
MANUSCRIPT = REPO / "funnel" / "shadow-persuasion-full-manuscript.md"
LOGO = REPO / "public" / "logo.png"
COVER_IMAGE = REPO / "funnel" / "assets" / "cover.png"
OUT = REPO / "funnel" / "exports" / "shadow-persuasion.docx"

BODY_FONT = "Georgia"
HEADING_FONT = "Georgia"
TITLE_FONT = "Georgia"

# Brand colors
BROWN = RGBColor(0x5C, 0x3A, 0x1E)
DARK = RGBColor(0x1A, 0x1A, 0x1A)
GOLD = RGBColor(0xD4, 0xA0, 0x17)


# ----- Helpers -----

def add_page_number(paragraph):
    """Insert a PAGE field into a paragraph (live page number)."""
    run = paragraph.add_run()
    fldChar1 = OxmlElement("w:fldChar")
    fldChar1.set(qn("w:fldCharType"), "begin")
    instrText = OxmlElement("w:instrText")
    instrText.set(qn("xml:space"), "preserve")
    instrText.text = "PAGE"
    fldChar2 = OxmlElement("w:fldChar")
    fldChar2.set(qn("w:fldCharType"), "end")
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run.font.name = BODY_FONT
    run.font.size = Pt(10)
    run.font.color.rgb = BROWN


def set_page_break_before(paragraph):
    """Force paragraph to start on new page."""
    pPr = paragraph._p.get_or_add_pPr()
    pageBreakBefore = OxmlElement("w:pageBreakBefore")
    pPr.append(pageBreakBefore)


def insert_page_break(paragraph):
    run = paragraph.add_run()
    run.add_break(WD_BREAK.PAGE)


def add_inline_formatted(paragraph, text, font=BODY_FONT, size=11, base_italic=False, color=None):
    """Parse simple markdown inline syntax into runs."""
    tokens = re.split(r"(\*\*[^*]+\*\*|\*[^*]+\*)", text)
    for tok in tokens:
        if not tok:
            continue
        bold = italic = False
        content = tok
        if tok.startswith("**") and tok.endswith("**"):
            bold = True
            content = tok[2:-2]
        elif tok.startswith("*") and tok.endswith("*") and len(tok) >= 2:
            italic = True
            content = tok[1:-1]
        run = paragraph.add_run(content)
        run.font.name = font
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic or base_italic
        if color:
            run.font.color.rgb = color


# ----- Extract chapter list for manual TOC -----

def extract_toc_entries(text):
    """Scan manuscript for H1 headings (chapters) and H2 subheadings."""
    entries = []
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if line.startswith("# ") and not line.startswith("# PART"):
            heading = line[2:].strip()
            # Skip the Introduction heading which is labeled directly "Introduction" later
            entries.append(("chapter", heading))
        elif line.startswith("## "):
            sub = line[3:].strip()
            # Only keep the first H2 per chapter (the chapter title)
            if entries and entries[-1][0] == "chapter" and len(entries[-1]) == 2:
                entries[-1] = ("chapter", entries[-1][1], sub)
        elif line.startswith("# PART "):
            part = line[2:].strip()
            entries.append(("part", part))
    return entries


# ----- Build -----

def build_document():
    doc = Document()

    # Page setup for all sections — 6x9 book trim
    for section in doc.sections:
        section.page_width = Inches(6)
        section.page_height = Inches(9)
        # Slightly larger top margin so header sits higher AND body has more breathing room
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.top_margin = Inches(1.1)
        section.bottom_margin = Inches(0.9)
        # Pull header close to top edge (logo sits high on page, well above body)
        section.header_distance = Inches(0.3)
        section.footer_distance = Inches(0.4)

    section = doc.sections[0]
    # Cover has no header/footer
    section.different_first_page_header_footer = True

    # =========== COVER PAGE — full-page image ===========
    cover_p = doc.add_paragraph()
    cover_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover_p.paragraph_format.space_before = Pt(0)
    cover_p.paragraph_format.space_after = Pt(0)
    run = cover_p.add_run()
    # The cover image is 6x9 at 300dpi. Embed it at the full content width
    # of the page (6 inches minus margins), scaling proportionally.
    # Using 6.5" width pushes it slightly into margins to feel edge-to-edge.
    run.add_picture(str(COVER_IMAGE), width=Inches(6.5))

    # Force next content to new page
    pb = doc.add_paragraph()
    pb.paragraph_format.space_after = Pt(0)
    insert_page_break(pb)

    # =========== HEADER / FOOTER for all subsequent pages ===========
    # Default header (appears on every non-first page of section)
    header = section.header
    header_para = header.paragraphs[0]
    header_para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header_para.paragraph_format.space_before = Pt(0)
    header_para.paragraph_format.space_after = Pt(0)
    hrun = header_para.add_run()
    hrun.add_picture(str(LOGO), width=Inches(0.9))

    # Default footer
    footer = section.footer
    footer_para = footer.paragraphs[0]
    footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_number(footer_para)

    # =========== COPYRIGHT PAGE ===========
    copyright_lines = [
        ("Copyright © 2026 Shadow Persuasion LLC.", 10, False, False),
        ("All rights reserved.", 10, False, False),
        ("", 10, False, False),
        ("No part of this book may be reproduced, stored in a retrieval system, or transmitted in any form or by any means, electronic, mechanical, photocopying, recording, or otherwise, without the prior written permission of the copyright holder, except in the case of brief quotations in critical articles or reviews.", 9, False, True),
        ("", 10, False, False),
        ("Case studies in this book are composites based on real coaching engagements, with names and identifying details modified to protect privacy. Tactical content is grounded in published research where cited.", 9, False, True),
        ("", 10, False, False),
        ("This book is not a substitute for professional legal, medical, financial, or therapeutic advice. Nothing in this book is a guarantee of any specific outcome.", 9, False, True),
        ("", 10, False, False),
        ("First edition.", 10, False, False),
        ("", 10, False, False),
        ("Shadow Persuasion LLC", 10, False, False),
        ("Boulder, Colorado", 10, False, False),
    ]

    for text, size, bold, wrap in copyright_lines:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if text:
            r = p.add_run(text)
            r.font.name = BODY_FONT
            r.font.size = Pt(size)
            r.font.color.rgb = RGBColor(0x3B, 0x2E, 0x1A)
        p.paragraph_format.space_after = Pt(4)

    # Page break to TOC page
    pb = doc.add_paragraph()
    insert_page_break(pb)

    # =========== TABLE OF CONTENTS (manual, always-visible) ===========
    toc_title = doc.add_paragraph()
    toc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tr = toc_title.add_run("CONTENTS")
    tr.font.name = TITLE_FONT
    tr.font.size = Pt(22)
    tr.bold = True
    tr.font.color.rgb = DARK
    toc_title.paragraph_format.space_after = Pt(36)

    # Load the manuscript to pull the chapter list
    source = MANUSCRIPT.read_text()

    # Hardcoded reading-order structure (matches the actual book layout)
    toc_structure = [
        ("entry", "Introduction: How To Read This Book"),
        ("blank", ""),
        ("entry", "Chapter 1. The Dana Meeting"),
        ("entry", "Chapter 2. The Persuasion Detector"),
        ("blank", ""),
        ("part", "PART ONE — Disable The Detector"),
        ("entry", "Chapter 3. The First Thirty Seconds"),
        ("entry", "Chapter 4. Removing the Smell of Sales"),
        ("entry", "Chapter 5. Invisible Calibration"),
        ("blank", ""),
        ("part", "PART TWO — Plant The Conclusion"),
        ("entry", "Chapter 6. The Weight of Silence"),
        ("entry", "Chapter 7. Stories Beat Pitches"),
        ("entry", "Chapter 8. Using Their Words Against Their Resistance"),
        ("entry", "Chapter 9. The Path to Their Own Conclusion"),
        ("blank", ""),
        ("part", "PART THREE — Shift The Frame"),
        ("entry", "Chapter 10. Changing What the Conversation Is About"),
        ("entry", "Chapter 11. Surfacing What's Hidden"),
        ("entry", "Chapter 12. Changing the Dynamics"),
        ("blank", ""),
        ("part", "PART FOUR — Lock In Without Closing"),
        ("entry", "Chapter 13. Don't Close. Conclude."),
        ("entry", "Chapter 14. Commitment Without Asking For It"),
        ("entry", "Chapter 15. The Last Thing They Hear"),
        ("blank", ""),
        ("entry", "Chapter 16. The Daily Practice"),
        ("blank", ""),
        ("entry", "Appendix: Tactics By Situation"),
    ]

    for kind, text in toc_structure:
        if kind == "blank":
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            continue
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.2
        r = p.add_run(text)
        r.font.name = BODY_FONT
        if kind == "part":
            r.bold = True
            r.font.size = Pt(11)
            r.font.color.rgb = BROWN
            p.paragraph_format.space_before = Pt(4)
        else:
            r.font.size = Pt(11)
            r.font.color.rgb = DARK

    # Page break to body
    pb = doc.add_paragraph()
    insert_page_break(pb)

    # =========== BODY CONTENT (from markdown) ===========
    # Strip all horizontal rules
    lines = source.splitlines()
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if re.fullmatch(r"-{3,}", stripped) or re.fullmatch(r"\*{3,}", stripped):
            continue
        cleaned.append(line)
    text = "\n".join(cleaned)

    # Remove front-matter block — we built cover/copyright/TOC manually above
    intro_idx = text.find("# Introduction")
    if intro_idx > 0:
        text = text[intro_idx:]

    paragraphs = text.split("\n\n")
    first_h1_seen = False

    for block in paragraphs:
        block = block.strip()
        if not block:
            continue

        if block.startswith("# "):
            heading_text = block[2:].strip()
            p = doc.add_paragraph()
            # Force page break before every H1 except the very first (Introduction
            # which comes right after TOC break)
            if first_h1_seen:
                set_page_break_before(p)
            first_h1_seen = True

            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(36)
            p.paragraph_format.space_after = Pt(12)
            r = p.add_run(heading_text.upper())
            r.font.name = TITLE_FONT
            r.font.size = Pt(20)
            r.bold = True
            r.font.color.rgb = DARK

        elif block.startswith("## "):
            heading_text = block[3:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(24)
            r = p.add_run(heading_text)
            r.font.name = TITLE_FONT
            r.font.size = Pt(14)
            r.italic = True
            r.font.color.rgb = BROWN

        elif block.startswith("### "):
            heading_text = block[4:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(10)
            r = p.add_run(heading_text)
            r.font.name = TITLE_FONT
            r.font.size = Pt(13)
            r.bold = True
            r.font.color.rgb = DARK

        elif block.startswith("- ") or block.startswith("* "):
            for line in block.splitlines():
                line = line.strip()
                if not line:
                    continue
                content = line.lstrip("-* ").strip()
                p = doc.add_paragraph(style="List Bullet")
                p.paragraph_format.line_spacing = 1.3
                p.paragraph_format.space_after = Pt(4)
                add_inline_formatted(p, content, font=BODY_FONT, size=11)

        else:
            stripped = block.strip()
            if (stripped.startswith("*") and stripped.endswith("*")
                    and stripped.count("\n") < 3 and not stripped.startswith("**")):
                inner = stripped[1:-1].strip()
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(18)
                p.paragraph_format.space_after = Pt(18)
                p.paragraph_format.left_indent = Inches(0.5)
                p.paragraph_format.right_indent = Inches(0.5)
                r = p.add_run(inner)
                r.font.name = BODY_FONT
                r.font.size = Pt(11)
                r.italic = True
                r.font.color.rgb = BROWN
            else:
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p.paragraph_format.line_spacing = 1.35
                p.paragraph_format.space_after = Pt(6)
                p.paragraph_format.first_line_indent = Inches(0.25)
                add_inline_formatted(p, block.replace("\n", " "), font=BODY_FONT, size=11)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUT))
    print(f"Saved: {OUT}")
    print(f"Size: {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    build_document()
