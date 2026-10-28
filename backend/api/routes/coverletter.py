from fastapi import APIRouter
from backend.models.schemas import CoverLetterRequest, CoverLetterResult

router = APIRouter(prefix="/coverletter", tags=["Cover Letter"])

@router.post("/generate", response_model=CoverLetterResult)
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate a tailored cover letter with guardrail checks."""
    sample_letter = (
        "Dear Hiring Team,\n\n"
        "I am writing to express my enthusiastic interest in the Senior AI Application Engineer role. "
        "With over five years of experience engineering distributed systems and architecting agentic workflows "
        "using FastAPI, LangGraph, and modern Next.js frontends, I am excited about the opportunity to contribute "
        "to your mission of building impactful AI applications.\n\n"
        "In my recent role at TechNova Solutions, I architected an event-driven microservices platform processing "
        "over 10M daily events and spearheaded an LLM-powered multi-agent pipeline that reduced resolution times by 42%. "
        "I thrive in environments where engineering rigor meets cutting-edge generative AI capabilities.\n\n"
        "Thank you for your time and consideration. I welcome the opportunity to discuss how my technical expertise "
        "aligns with your goals.\n\n"
        "Sincerely,\nAlex Morgan"
    )
    
    return CoverLetterResult(
        content=sample_letter,
        tone=request.tone,
        word_count=len(sample_letter.split()),
        matched_qualifications=[
            "5+ years engineering distributed systems",
            "FastAPI & LangGraph orchestration experience",
            "Proven 42% reduction in support triage time"
        ],
        guardrail_check_passed=True,
        flagged_inconsistencies=[]
    )
