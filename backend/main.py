from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://resume-builder-mu-wheat-23.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class ResumeRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    location: str
    linkedin: str
    job_title: str
    job_description: str
    work_experience: list[dict]
    education: list[dict]
    skills: str
    tone: str

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

    return f"""You are a professional resume writer. Generate a complete, polished resume based on the information below.

Tone: {data.tone}
Target Job Title: {data.job_title}
Job Description / Target Role: {data.job_description}

PERSONAL INFO:
Name: {data.full_name}
Email: {data.email}
Phone: {data.phone}
Location: {data.location}
LinkedIn: {data.linkedin}

WORK EXPERIENCE:
{work_block}

EDUCATION:
{edu_block}

SKILLS:
{data.skills}

Instructions:
- Write a compelling professional summary (3-4 sentences)
- Rewrite work experience bullets to be achievement-focused and quantified where possible
- Organize skills into categories
- Output the resume in clean markdown format
- Use this exact structure:

# [Full Name]
[Email] | [Phone] | [Location] | [LinkedIn]

## Professional Summary
...

## Work Experience

### [Role] — [Company] | [Duration]
- ...
- ...

## Education

### [Degree] — [School] | [Year]

## Skills
**[Category]:** skill1, skill2, skill3

Do not add any commentary before or after the resume. Output only the resume.
"""

@app.post("/generate")
async def generate_resume(data: ResumeRequest):
    prompt = build_prompt(data)

    def stream():
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        ) as stream:
            for text in stream.text_stream:
                yield text

    return StreamingResponse(stream(), media_type="text/plain")

@app.get("/health")
def health():
    return {"status": "ok"}