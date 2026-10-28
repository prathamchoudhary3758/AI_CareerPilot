from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from backend.models.schemas import ResumeAnalysisResult, CandidateProfile, ScoreBreakdown, BulletRewriteSuggestion
from backend.core.state import session_manager

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form("default-session")
):
    """Upload and record a resume file."""
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")
        
    content = await file.read()
    file_size_kb = round(len(content) / 1024, 2)
    
    await session_manager.broadcast_event(
        session_id=session_id,
        event_type="resume_uploaded",
        message=f"Received resume file '{file.filename}' ({file_size_kb} KB)",
        data={"filename": file.filename, "size_kb": file_size_kb}
    )
    
    return {
        "status": "success",
        "session_id": session_id,
        "filename": file.filename,
        "size_kb": file_size_kb,
        "message": "Resume uploaded successfully"
    }

@router.get("/sample-analysis", response_model=ResumeAnalysisResult)
async def get_sample_analysis():
    """Returns sample analysis data for UI preview."""
    return ResumeAnalysisResult(
        profile=CandidateProfile(
            full_name="Alex Morgan",
            email="alex.morgan@example.com",
            location="San Francisco, CA",
            headline="Senior Full-Stack Engineer & AI Enthusiast",
            summary="Full-stack engineer with 5+ years of experience building scalable distributed web apps and integrating LLM-based microservices.",
            skills=[
                {"name": "Python", "category": "technical", "years_experience": 5.0},
                {"name": "FastAPI", "category": "technical", "years_experience": 3.0},
                {"name": "Next.js / React", "category": "technical", "years_experience": 4.0},
                {"name": "TypeScript", "category": "technical", "years_experience": 4.0},
                {"name": "LangChain & LangGraph", "category": "domain", "years_experience": 1.5},
                {"name": "Docker & Kubernetes", "category": "tool", "years_experience": 3.0}
            ],
            experience=[
                {
                    "title": "Lead Software Engineer",
                    "company": "TechNova Solutions",
                    "location": "San Francisco, CA",
                    "start_date": "2022-01",
                    "end_date": "Present",
                    "bullets": [
                        "Architected an event-driven microservices platform processing 10M+ daily events using FastAPI and Redis.",
                        "Integrated LLM agent pipelines reducing customer support triage times by 42%.",
                        "Mentored a cross-functional team of 6 engineers across front-end and back-end."
                    ]
                }
            ],
            education=[
                {
                    "institution": "University of California, Berkeley",
                    "degree": "B.S. in Computer Science",
                    "graduation_year": "2020"
                }
            ]
        ),
        score_breakdown=ScoreBreakdown(
            overall_score=88,
            skills_match=92,
            experience_relevance=85,
            ats_readability=90,
            action_verbs_metric=84
        ),
        key_strengths=[
            "Strong leadership experience in microservices architecture and high-throughput systems",
            "Demonstrated hands-on experience with modern AI agent workflows (FastAPI + LangGraph)",
            "Clean ATS-compliant chronological structure"
        ],
        missing_skills=[
            "GraphQL schema federation",
            "Advanced vector index tuning (HNSW/IVF)"
        ],
        bullet_suggestions=[
            BulletRewriteSuggestion(
                original_bullet="Worked on customer support AI pipelines to help triage tickets.",
                improved_bullet="Engineered LLM-powered multi-agent triage pipeline, processing 100k+ monthly tickets and reducing median resolution time by 42%.",
                reason="Quantified impact with specific ticket volume and percentage reduction.",
                impact_metric_added=True
            )
        ],
        ats_feedback=[
            "Standard font hierarchy detected with optimal line-height",
            "Contact information easily parseable by standard ATS parsers",
            "No tables or non-standard graphics that might confuse parsers"
        ]
    )
