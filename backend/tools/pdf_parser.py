"""Resume document parser supporting PDF, DOCX, and TXT files."""

import io
import re
from typing import Dict, Any, List, Optional


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyMuPDF (fitz) or fallback."""
    try:
        try:
            import pymupdf as fitz
        except ImportError:
            import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_text = page.get_text("text")
            if page_text:
                text_parts.append(page_text)
        doc.close()
        return "\n\n".join(text_parts).strip()
    except Exception as e:
        # Fallback rudimentary extraction if fitz fails or is not available
        try:
            # Fallback simple string decoding for plain text embedded streams
            decoded = file_bytes.decode("utf-8", errors="ignore")
            # Filter ascii printable chars
            clean = re.sub(r"[^\x20-\x7E\n\r\t]", " ", decoded)
            return clean.strip()
        except Exception:
            return ""


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract raw text from DOCX bytes using python-docx."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)
        return "\n\n".join(paragraphs).strip()
    except Exception as e:
        # Fallback simple text decode
        return file_bytes.decode("utf-8", errors="ignore").strip()


def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """Unified entry point to extract text from PDF, DOCX, or TXT."""
    filename_lower = filename.lower()
    if filename_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        # Plain text
        return file_bytes.decode("utf-8", errors="ignore").strip()


def parse_resume_sections(raw_text: str) -> Dict[str, str]:
    """Segment raw resume text into standard sections (summary, experience, education, skills, projects)."""
    section_patterns = {
        "summary": r"(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me|objective)",
        "experience": r"(?:work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history)",
        "skills": r"(?:technical\s+skills|core\s+competencies|skills\s+&\s+competencies|skills|technologies|tools)",
        "education": r"(?:education|academic\s+background|academics|qualifications)",
        "projects": r"(?:projects|key\s+projects|personal\s+projects|open\s+source)",
        "certifications": r"(?:certifications|certificates|licenses|courses)"
    }

    # Build regex to split sections
    combined_headings = "|".join(
        rf"(?P<{key}>^[ \t]*(?:[#*=-]{{0,3}}[ \t]*)?{pattern}(?:\s*[:\-])?[ \t]*$)"
        for key, pattern in section_patterns.items()
    )
    heading_regex = re.compile(combined_headings, re.IGNORECASE | re.MULTILINE)

    matches = list(heading_regex.finditer(raw_text))
    if not matches:
        return {"general": raw_text.strip()}

    sections: Dict[str, str] = {}
    
    # Text before first section is header / contact info
    first_start = matches[0].start()
    if first_start > 0:
        sections["header"] = raw_text[:first_start].strip()

    for idx, match in enumerate(matches):
        # Identify which group matched
        matched_sec = None
        for key in section_patterns.keys():
            if match.group(key):
                matched_sec = key
                break
        if not matched_sec:
            continue

        start_pos = match.end()
        end_pos = matches[idx + 1].start() if idx + 1 < len(matches) else len(raw_text)
        content = raw_text[start_pos:end_pos].strip()
        sections[matched_sec] = content

    return sections
