from fastapi import APIRouter
from typing import List
from backend.models.schemas import JobMatchResult, JobDescription, JobMatchReasoning

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/matches", response_model=List[JobMatchResult])
async def get_matched_jobs():
    """Retrieve matched jobs with semantic fit reasoning."""
    return [
        JobMatchResult(
            job=JobDescription(
                id="job-101",
                title="Senior AI Application Engineer",
                company="Anthropic Ecosystem Partner",
                location="Remote / San Francisco, CA",
                description="We are looking for an AI Application Engineer to architect agentic workflows, orchestrate LLM systems using LangGraph and FastAPI, and build intuitive user experiences.",
                requirements=[
                    "5+ years of software engineering experience",
                    "Strong proficiency in Python, FastAPI, and async programming",
                    "Experience with LangGraph / LangChain or similar agent frameworks",
                    "Familiarity with Next.js or React frontend systems"
                ],
                salary_range="$165,000 - $195,000",
                employment_type="Full-time",
                posted_date="2 days ago",
                apply_url="https://example.com/jobs/101"
            ),
            match_percentage=94,
            reasoning=JobMatchReasoning(
                fit_summary="Exceptional match across Python/FastAPI backend foundations, modern Next.js frontends, and hands-on agent orchestration.",
                matched_skills=["Python", "FastAPI", "LangGraph", "React/Next.js", "Docker"],
                missing_critical_skills=["Enterprise observability (Datadog/LangSmith)"],
                potential_challenges=["Role emphasizes heavy production prompt evaluation pipelines."],
                tailoring_tips=[
                    "Highlight production latency benchmarks achieved in your FastAPI microservices.",
                    "Mention specific evaluation rubrics you've applied to LLM agent workflows."
                ]
            )
        ),
        JobMatchResult(
            job=JobDescription(
                id="job-102",
                title="Full-Stack AI Solutions Architect",
                company="ScaleAI Partner Labs",
                location="San Francisco, CA (Hybrid)",
                description="Build production-grade multi-agent platforms and evaluation testbeds for Fortune 500 enterprise clients.",
                requirements=[
                    "Deep knowledge of distributed systems and event streams",
                    "Expertise in Python, TypeScript, and modern vector databases (Chroma/Pinecone)",
                    "Strong background in API security and rate-limiting"
                ],
                salary_range="$175,000 - $210,000",
                employment_type="Full-time",
                posted_date="1 day ago",
                apply_url="https://example.com/jobs/102"
            ),
            match_percentage=88,
            reasoning=JobMatchReasoning(
                fit_summary="Strong match for full-stack engineering and vector/RAG systems, with slight gap in client-facing solution architecture.",
                matched_skills=["Python", "TypeScript", "Next.js", "Vector Databases"],
                missing_critical_skills=["Client architecture consulting"],
                potential_challenges=["Requires navigating complex enterprise customer integration calls."],
                tailoring_tips=["Emphasize your experience mentoring engineers and explaining technical trade-offs."]
            )
        )
    ]
