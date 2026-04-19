from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import os
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from io import BytesIO
import base64

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openrouter/auto"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://resume-builder-mu-wheat-23.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

class ResumeRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    location: str
    linkedin: str
    photo: str = ""
    social_link: str = ""
    headline: str = ""
    date_of_birth: str = ""
    civil_status: str = ""
    nationality: str = ""
    job_title: str = ""
    job_description: str = ""
    job_type: str = "Full-time"
    availability: str = ""
    work_experience: list[dict] = []
    education: list[dict] = []
    certifications: list[dict] = []
    languages: list[dict] = []
    skills: str = ""
    tone: str = "Professional"
    references: list[dict] = []
    seminars: list[dict] = []

def build_prompt(data: ResumeRequest) -> str:
    work_block = ""
    for job in data.work_experience:
        work_block += f"""
Company: {job.get('company', '')}
Role: {job.get('role', '')}
Duration: {job.get('duration', '')}
Responsibilities: {job.get('responsibilities', '')}
"""

    edu_block = ""
    for edu in data.education:
        edu_block += f"""
School: {edu.get('school', '')}
Degree: {edu.get('degree', '')}
Year: {edu.get('year', '')}
"""

    cert_block = ""
    for cert in (data.certifications or []):
        cert_block += f"- {cert.get('name', '')} | {cert.get('issuer', '')} | {cert.get('year', '')}\n"

    lang_block = ""
    for lang in (data.languages or []):
        lang_block += f"- {lang.get('language', '')} ({lang.get('proficiency', '')})\n"

    ref_block = ""
    for ref in (data.references or []):
        ref_block += f"- {ref.get('name', '')} | {ref.get('position', '')} | {ref.get('company', '')} | {ref.get('contact', '')}\n"

    seminar_block = ""
    for sem in (data.seminars or []):
        seminar_block += f"- {sem.get('title', '')} | {sem.get('organizer', '')} | {sem.get('year', '')}\n"

    tone_instructions = {
        "Professional": """
- Use formal, polished language
- Focus on achievements, metrics, and measurable impact
- Keep sentences concise and direct
- Use strong action verbs: Managed, Led, Achieved, Delivered, Implemented
- Avoid casual language or personal pronouns
""",
        "Modern": """
- Use clean, contemporary language that feels fresh and confident
- Balance professionalism with personality
- Highlight adaptability, collaboration, and innovation
- Use active voice and dynamic verbs: Drove, Built, Launched, Scaled, Optimized
- Keep it punchy — short impactful sentences
""",
        "Creative": """
- Use expressive, engaging language that shows personality
- Tell a story — make the candidate memorable
- Highlight passion, creativity, and unique perspective
- Use vivid verbs and descriptive language: Crafted, Designed, Pioneered, Transformed, Reimagined
- It should feel human and warm, not corporate
""",
        "Executive": """
- Use authoritative, strategic language befitting senior leadership
- Focus on business impact, revenue, team leadership, and organizational growth
- Emphasize vision, strategy, and high-level decision making
- Use commanding verbs: Spearheaded, Directed, Orchestrated, Championed, Transformed
- Quantify everything — percentages, team sizes, budgets, timelines
""",
    }

    selected_tone = tone_instructions.get(data.tone, tone_instructions["Professional"])

    return f"""You are a professional resume writer in the Philippines. Generate a complete, polished resume.

Tone Style: {data.tone}
Tone Instructions:
{selected_tone}

Target Job Title: {data.job_title}
Job Type: {data.job_type}
Job Description: {data.job_description}
Availability: {data.availability}

PERSONAL INFO:
Name: {data.full_name}
Headline: {data.headline}
Email: {data.email}
Phone: {data.phone}
Location: {data.location}
LinkedIn: {data.linkedin}
Other Link: {data.social_link}
Date of Birth: {data.date_of_birth}
Civil Status: {data.civil_status}
Nationality: {data.nationality}

WORK EXPERIENCE:
{work_block}

EDUCATION:
{edu_block}

CERTIFICATIONS & LICENSES:
{cert_block}

LANGUAGES:
{lang_block}

SKILLS:
{data.skills}

SEMINARS & TRAININGS:
{seminar_block}

CHARACTER REFERENCES:
{ref_block}

Instructions:
- Write a compelling professional summary (3-4 sentences)
- Rewrite work experience bullets to be achievement-focused
- Output in clean markdown using this exact structure:

# [Full Name]
[Email] | [Phone] | [Location] | [LinkedIn]

## Personal Information
**Date of Birth:** ... | **Civil Status:** ... | **Nationality:** ...

## Professional Summary
...

## Work Experience

### [Role] — [Company] | [Duration]
- ...

## Education

### [Degree] — [School] | [Year]

## Certifications & Licenses
- ...

## Skills
**[Category]:** skill1, skill2

## Languages
- ...

## Seminars & Trainings
- ...

## Character References
- ...

Output only the resume. No commentary.
"""

@app.post("/debug")
async def debug(request: Request):
    body = await request.json()
    return body

@app.post("/generate")
async def generate_resume(data: ResumeRequest):
    prompt = build_prompt(data)

    async def stream():
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                async with client.stream(
                    "POST",
                    OPENROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://resume-builder-mu-wheat-23.vercel.app",
                        "X-Title": "AI Resume Builder",
                    },
                    json={
                        "model": MODEL,
                        "stream": True,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                    },
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str.strip() == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                delta = chunk["choices"][0]["delta"].get("content", "")
                                if delta:
                                    yield delta
                            except Exception:
                                continue
        except Exception as e:
            yield f"ERROR: {str(e)}"

    return StreamingResponse(stream(), media_type="text/plain")

@app.post("/generate-pdf")
async def generate_pdf(data: ResumeRequest):
    prompt = build_prompt(data)

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://resume-builder-mu-wheat-23.vercel.app",
                "X-Title": "AI Resume Builder",
            },
            json={
                "model": MODEL,
                "stream": False,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        result = response.json()
        markdown_text = result["choices"][0]["message"]["content"]

    summary_text = ""
    in_summary = False
    for line in markdown_text.split("\n"):
        line = line.strip()
        if line.lower().startswith("## professional summary"):
            in_summary = True
            continue
        if in_summary:
            if line.startswith("##"):
                break
            if line:
                summary_text += line + " "

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0,
        rightMargin=0,
        topMargin=0,
        bottomMargin=0,
    )

    dark = colors.HexColor("#1e293b")
    slate100 = colors.HexColor("#f1f5f9")
    slate500 = colors.HexColor("#64748b")
    slate600 = colors.HexColor("#475569")
    white = colors.white

    styles = getSampleStyleSheet()

    def style(name, **kwargs):
        return ParagraphStyle(name, **kwargs)

    name_style = style("Name", fontName="Helvetica-Bold", fontSize=16,
                       textColor=white, spaceAfter=2, leading=20)
    role_style = style("Role", fontName="Helvetica", fontSize=10,
                       textColor=colors.HexColor("#cbd5e1"), spaceAfter=0)
    sidebar_title_style = style("SidebarTitle", fontName="Helvetica-Bold", fontSize=7,
                                textColor=slate500, spaceAfter=4, leading=10)
    sidebar_text_style = style("SidebarText", fontName="Helvetica", fontSize=8,
                               textColor=slate600, spaceAfter=2, leading=11, wordWrap='CJK')
    main_title_style = style("MainTitle", fontName="Helvetica-Bold", fontSize=9,
                             textColor=dark, spaceAfter=6, leading=12)
    body_style = style("Body", fontName="Helvetica", fontSize=8,
                       textColor=slate600, spaceAfter=2, leading=12)
    job_title_style = style("JobTitle", fontName="Helvetica-Bold", fontSize=9,
                            textColor=dark, spaceAfter=3, leading=12)
    bullet_style = style("Bullet", fontName="Helvetica", fontSize=8,
                         textColor=slate600, spaceAfter=2, leading=11,
                         leftIndent=10, firstLineIndent=-10)

    PAGE_W, PAGE_H = letter
    SIDEBAR_W = 2.2 * inch
    MAIN_W = PAGE_W - SIDEBAR_W
    HEADER_H = 1.1 * inch

    photo_cell = Paragraph("", styles["Normal"])
    if data.photo and data.photo.startswith("data:image"):
        try:
            from reportlab.platypus import Image as RLImage
            header_str = data.photo.split(",", 1)[1]
            img_bytes = base64.b64decode(header_str)
            img_buffer = BytesIO(img_bytes)
            photo_cell = RLImage(img_buffer, width=0.7*inch, height=0.7*inch)
        except Exception:
            pass

    name_cell = [
        Paragraph(data.full_name.upper(), name_style),
        Paragraph(data.job_title or data.headline or "", role_style),
    ]

    header_table = Table(
        [[photo_cell, name_cell]],
        colWidths=[0.9*inch, PAGE_W - 0.9*inch],
        rowHeights=[HEADER_H],
    )
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), dark),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, 0), 16),
        ("LEFTPADDING", (1, 0), (1, 0), 12),
        ("RIGHTPADDING", (-1, 0), (-1, 0), 16),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))

    def sidebar_section(title, items):
        out = []
        if not items:
            return out
        out.append(Paragraph(title.upper(), sidebar_title_style))
        out.append(HRFlowable(width=SIDEBAR_W - 0.4*inch, thickness=0.5,
                              color=colors.HexColor("#cbd5e1"), spaceAfter=4))
        for item in items:
            if item:
                out.append(Paragraph(str(item), sidebar_text_style))
        out.append(Spacer(1, 8))
        return out

    contact_items = [c for c in [data.email, data.phone, data.linkedin,
                                  data.social_link, data.location] if c]
    personal_items = [p for p in [
        f"DOB: {data.date_of_birth}" if data.date_of_birth else "",
        f"Civil Status: {data.civil_status}" if data.civil_status else "",
        f"Nationality: {data.nationality}" if data.nationality else "",
        f"Available: {data.availability}" if data.availability else "",
        f"Job Type: {data.job_type}" if data.job_type else "",
    ] if p]
    skill_items = [s.strip() for s in data.skills.split(",") if s.strip()]
    edu_items = [
        f"{e.get('degree','')} — {e.get('school','')}{' | ' + e.get('year','') if e.get('year') else ''}"
        for e in data.education if e.get("school") or e.get("degree")
    ]
    cert_items = [
        f"{c.get('name','')}{' — ' + c.get('issuer','') if c.get('issuer') else ''}{' (' + c.get('year','')+')' if c.get('year') else ''}"
        for c in data.certifications if c.get("name")
    ]
    lang_items = [
        f"{l.get('language','')}{' (' + l.get('proficiency','') + ')' if l.get('proficiency') else ''}"
        for l in data.languages if l.get("language")
    ]

    sidebar_cells = []
    sidebar_cells += sidebar_section("Contact", contact_items)
    sidebar_cells += sidebar_section("Personal Info", personal_items)
    sidebar_cells += sidebar_section("Skills", skill_items)
    sidebar_cells += sidebar_section("Education", edu_items)
    sidebar_cells += sidebar_section("Certifications", cert_items)
    sidebar_cells += sidebar_section("Languages", lang_items)

    def main_section(title, items):
        out = []
        if not items:
            return out
        out.append(Paragraph(title.upper(), main_title_style))
        out.append(HRFlowable(width=MAIN_W - 0.4*inch, thickness=1,
                              color=dark, spaceAfter=6))
        for item in items:
            if item:
                out.append(item)
        out.append(Spacer(1, 10))
        return out

    summary_items = [Paragraph(summary_text.strip(), body_style)] if summary_text.strip() else []

    exp_items = []
    for j in data.work_experience:
        if not (j.get("company") or j.get("role")):
            continue
        title_parts = []
        if j.get("role"): title_parts.append(j["role"])
        if j.get("company"): title_parts.append(j["company"])
        duration = f" | {j['duration']}" if j.get("duration") else ""
        exp_items.append(Paragraph(f"<b>{' — '.join(title_parts)}{duration}</b>", job_title_style))
        for b in (j.get("responsibilities") or "").split("\n"):
            b = b.strip()
            if b:
                exp_items.append(Paragraph(f"• {b}", bullet_style))
        exp_items.append(Spacer(1, 4))

    seminar_items = []
    for s in data.seminars:
        if not s.get("title"): continue
        text = s["title"]
        if s.get("organizer"): text += f" — {s['organizer']}"
        if s.get("year"): text += f" ({s['year']})"
        seminar_items.append(Paragraph(f"• {text}", bullet_style))

    ref_items = []
    for r in data.references:
        if not r.get("name"): continue
        text = r["name"]
        if r.get("position"): text += f", {r['position']}"
        if r.get("company"): text += f" — {r['company']}"
        if r.get("contact"): text += f" | {r['contact']}"
        ref_items.append(Paragraph(f"• {text}", bullet_style))

    main_cells = []
    main_cells += main_section("Professional Summary", summary_items)
    main_cells += main_section("Work Experience", exp_items)
    main_cells += main_section("Seminars & Trainings", seminar_items)
    main_cells += main_section("Character References", ref_items)

    body_table = Table(
        [[sidebar_cells, main_cells]],
        colWidths=[SIDEBAR_W, MAIN_W],
    )
    body_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), slate100),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 14),
        ("RIGHTPADDING", (0, 0), (0, 0), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING", (1, 0), (1, 0), 16),
        ("RIGHTPADDING", (1, 0), (1, 0), 16),
    ]))

    doc.build([header_table, body_table])

    pdf_bytes = buffer.getvalue()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"}
    )

@app.get("/health")
def health():
    return {"status": "ok"}