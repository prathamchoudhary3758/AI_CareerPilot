from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from backend.models.schemas import (
    ResumeAnalysisResult,
    ResumeAnalysisRequest,
    CandidateProfile,
    ScoreBreakdown,
    BulletRewriteSuggestion
)
from backend.core.state import session_manager
from backend.tools.pdf_parser import extract_text_from_bytes
from backend.agents.resume_agent import resume_agent, DEFAULT_TARGET_JOB

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload", response_model=ResumeAnalysisResult)
async def upload_resume(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form("default-session"),
    target_job_title: Optional[str] = Form("Senior AI Application Engineer"),
    target_job_description: Optional[str] = Form(None)
):
    """Uploads a resume file (PDF, DOCX, or TXT), extracts text with PyMuPDF,

    and runs the RAG ATS scoring agent.
    """
    if not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")
        
    content = await file.read()
    file_size_kb = round(len(content) / 1024, 2)
    
    # Broadcast upload event
    await session_manager.broadcast_event(
        session_id=session_id,
        event_type="resume_uploaded",
        message=f"Received resume '{file.filename}' ({file_size_kb} KB)",
        data={"filename": file.filename, "size_kb": file_size_kb}
    )
    
    # Extract text using PyMuPDF / python-docx
    raw_text = extract_text_from_bytes(content, file.filename)
    if not raw_text or len(raw_text.strip()) < 20:
        raise HTTPException(
            status_code=422,
            detail="Unable to extract readable text from document. Please ensure the file is not an image-only scan or corrupted."
        )

    # Build target job context
    target_job = dict(DEFAULT_TARGET_JOB)
    if target_job_title:
        target_job["title"] = target_job_title
    if target_job_description:
        target_job["description"] = target_job_description

    # Execute Resume Agent workflow
    analysis_result = await resume_agent.analyze_resume(
        raw_text=raw_text,
        session_id=session_id,
        target_job=target_job
    )
    
    return analysis_result


@router.post("/analyze", response_model=ResumeAnalysisResult)
async def analyze_resume_text(request: ResumeAnalysisRequest):
    """Analyzes or re-scores a resume against a target job description."""
    session = session_manager.get_session(request.session_id)
    
    raw_text = request.raw_resume_text
    if not raw_text:
        # Check if text was previously uploaded in session
        existing_profile = session.get("resume_data")
        if existing_profile and existing_profile.get("raw_text"):
            raw_text = existing_profile["raw_text"]
        else:
            raise HTTPException(
                status_code=400,
                detail="No resume text provided and no previously uploaded resume found in this session."
            )

    target_job = dict(DEFAULT_TARGET_JOB)
    if request.target_job_title:
        target_job["title"] = request.target_job_title
    if request.target_job_description:
        target_job["description"] = request.target_job_description
    if request.target_requirements:
        target_job["requirements"] = request.target_requirements

    analysis_result = await resume_agent.analyze_resume(
        raw_text=raw_text,
        session_id=request.session_id,
        target_job=target_job
    )

    return analysis_result


@router.get("/profile/{session_id}", response_model=CandidateProfile)
async def get_candidate_profile(session_id: str):
    """Retrieves the extracted candidate profile for a given session."""
    session = session_manager.get_session(session_id)
    profile_data = session.get("resume_data")
    if not profile_data:
        raise HTTPException(status_code=404, detail=f"No profile found for session '{session_id}'")
    return CandidateProfile(**profile_data)


@router.get("/analysis/{session_id}", response_model=ResumeAnalysisResult)
async def get_session_analysis(session_id: str):
    """Retrieves the analysis result for a given session."""
    session = session_manager.get_session(session_id)
    analysis_data = session.get("analysis_results")
    if not analysis_data:
        raise HTTPException(status_code=404, detail=f"No analysis found for session '{session_id}'")
    return ResumeAnalysisResult(**analysis_data)


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
