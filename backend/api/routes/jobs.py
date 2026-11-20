from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.schemas import (
    JobMatchResult,
    JobDescription,
    CandidateProfile,
    SelectJobRequest
)
from backend.tools.job_api import job_source_manager
from backend.agents.job_match_agent import job_match_agent
from backend.core.state import session_manager

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# Default fallback candidate profile if session does not yet have uploaded resume
DEFAULT_CANDIDATE = CandidateProfile(
    full_name="Alex Morgan",
    headline="Senior Full-Stack & AI Systems Engineer",
    summary="5+ years of experience building high-throughput microservices using FastAPI, Next.js, and multi-agent LangGraph workflows.",
    skills=[
        {"name": "Python", "category": "technical", "years_experience": 5.0},
        {"name": "FastAPI", "category": "technical", "years_experience": 3.0},
        {"name": "Next.js", "category": "technical", "years_experience": 4.0},
        {"name": "TypeScript", "category": "technical", "years_experience": 4.0},
        {"name": "LangGraph", "category": "domain", "years_experience": 1.5},
        {"name": "Docker & Kubernetes", "category": "tool", "years_experience": 3.0},
        {"name": "PostgreSQL", "category": "technical", "years_experience": 4.0},
        {"name": "Redis", "category": "technical", "years_experience": 3.0}
    ],
    experience=[
        {
            "title": "Lead Software Engineer",
            "company": "TechNova Solutions",
            "start_date": "2022-01",
            "end_date": "Present",
            "bullets": [
                "Architected an event-driven microservices platform processing 10M+ daily events using FastAPI and Redis.",
                "Integrated LLM agent pipelines reducing customer support triage times by 42%."
            ]
        }
    ]
)


@router.get("/matches", response_model=List[JobMatchResult])
async def get_matched_jobs(
    session_id: str = Query("default-session"),
    query: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    remote_only: bool = Query(False),
    min_match: Optional[int] = Query(None)
):
    """Retrieve ranked job matches computed via vector embeddings and cosine similarity."""
    # Normalize parameters if called as direct Python functions
    clean_session_id = session_id if isinstance(session_id, str) else "default-session"
    clean_query = query if isinstance(query, str) else None
    clean_location = location if isinstance(location, str) else None
    clean_remote = remote_only if isinstance(remote_only, bool) else False
    clean_min_match = min_match if isinstance(min_match, int) else None

    session = session_manager.get_session(clean_session_id)
    profile_data = session.get("resume_data")

    # Load candidate profile
    if profile_data:
        profile = CandidateProfile(**profile_data)
    else:
        profile = DEFAULT_CANDIDATE

    # Filter catalog if criteria provided
    candidate_jobs = await job_source_manager.search_jobs(
        query=clean_query,
        location=clean_location,
        remote_only=clean_remote
    )

    # Execute Job Match Agent
    ranked_matches = await job_match_agent.match_jobs_for_candidate(
        profile=profile,
        session_id=clean_session_id,
        jobs=candidate_jobs
    )

    if clean_min_match is not None:
        ranked_matches = [m for m in ranked_matches if m.match_percentage >= clean_min_match]

    return ranked_matches


@router.post("/match-profile", response_model=List[JobMatchResult])
async def match_custom_profile(
    profile: CandidateProfile,
    session_id: str = "default-session"
):
    """Computes semantic job matches for an explicitly provided candidate profile."""
    return await job_match_agent.match_jobs_for_candidate(
        profile=profile,
        session_id=session_id
    )


@router.get("/{job_id}", response_model=JobDescription)
async def get_job_by_id(job_id: str):
    """Fetch a single job description by ID."""
    job = job_source_manager.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID '{job_id}' not found.")
    return job


@router.post("/select")
async def select_target_job(request: SelectJobRequest):
    """Select a specific job as the active target job for downstream cover letter and interview agents."""
    job = job_source_manager.get_job_by_id(request.job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID '{request.job_id}' not found.")

    session_manager.update_session(request.session_id, "target_job", job.model_dump())

    await session_manager.broadcast_event(
        session_id=request.session_id,
        event_type="target_job_selected",
        message=f"Active target role set to '{job.title}' at {job.company}",
        data={"job_id": job.id, "title": job.title, "company": job.company}
    )

    return {
        "status": "success",
        "session_id": request.session_id,
        "selected_job": job
    }
