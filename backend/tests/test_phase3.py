import asyncio
import numpy as np
import pytest
from backend.tools.embeddings import generate_local_embedding, cosine_similarity, get_embedding
from backend.tools.job_api import job_source_manager
from backend.agents.job_match_agent import job_match_agent
from backend.models.schemas import CandidateProfile, JobMatchResult, SelectJobRequest
from backend.api.routes.jobs import get_matched_jobs, select_target_job, get_job_by_id


def test_embeddings_generation_and_cosine():
    """Verify semantic vector generation and cosine similarity calculation."""
    v1 = generate_local_embedding("FastAPI Python backend microservices")
    v2 = generate_local_embedding("FastAPI Python REST API distributed systems")
    v3 = generate_local_embedding("UI UX Graphic Design Adobe Photoshop Illustrator")

    assert len(v1) == 384
    # Check L2 unit normalization
    norm1 = np.linalg.norm(v1)
    assert abs(norm1 - 1.0) < 1e-4

    sim_related = cosine_similarity(v1, v2)
    sim_unrelated = cosine_similarity(v1, v3)

    assert 0.0 <= sim_related <= 1.0
    assert 0.0 <= sim_unrelated <= 1.0
    assert sim_related > sim_unrelated, "Related technical terms must have higher cosine similarity"


def test_job_source_catalog_and_search():
    """Verify job catalog retrieval and multi-attribute search filtering."""
    all_jobs = job_source_manager.get_all_jobs()
    assert len(all_jobs) >= 5

    job_101 = job_source_manager.get_job_by_id("job-101")
    assert job_101 is not None
    assert "AI" in job_101.title

    # Test filtering by remote
    remote_jobs = asyncio.run(job_source_manager.search_jobs(remote_only=True))
    assert all("remote" in j.location.lower() for j in remote_jobs)

    # Test filtering by query
    devops_jobs = asyncio.run(job_source_manager.search_jobs(query="Kubernetes AWS Terraform"))
    assert len(devops_jobs) >= 1
    assert any("DevOps" in j.title or "Kubernetes" in j.requirements for j in devops_jobs)


def test_job_match_agent_ranking_and_reasoning():
    """Verify candidate-to-job matching, percentage bounds, and AI reasoning synthesis."""
    profile = CandidateProfile(
        full_name="Alex Morgan",
        headline="Senior AI Application Engineer",
        summary="Specializing in Python, FastAPI, Next.js, and multi-agent LangGraph workflows.",
        skills=[
            {"name": "Python", "category": "technical", "years_experience": 5.0},
            {"name": "FastAPI", "category": "technical", "years_experience": 3.0},
            {"name": "LangGraph", "category": "domain", "years_experience": 1.5},
            {"name": "Next.js", "category": "technical", "years_experience": 4.0},
            {"name": "Docker", "category": "tool", "years_experience": 3.0}
        ],
        experience=[
            {
                "title": "Lead Software Engineer",
                "company": "TechNova Solutions",
                "bullets": [
                    "Architected event-driven microservices using FastAPI and Redis.",
                    "Integrated LLM multi-agent triage pipelines with LangGraph."
                ]
            }
        ]
    )

    matches = asyncio.run(
        job_match_agent.match_jobs_for_candidate(profile, session_id="test-p3-session")
    )

    assert len(matches) >= 5
    # Should be sorted descending by match percentage
    percentages = [m.match_percentage for m in matches]
    assert percentages == sorted(percentages, reverse=True)

    top_match = matches[0]
    assert 40 <= top_match.match_percentage <= 100
    assert len(top_match.reasoning.matched_skills) >= 1
    assert len(top_match.reasoning.tailoring_tips) >= 1
    assert top_match.reasoning.fit_summary != ""


def test_job_api_endpoints():
    """Verify FastAPI routes for job matching, retrieval, and target job selection."""
    # Test GET /matches
    matches = asyncio.run(get_matched_jobs(session_id="test-p3-session"))
    assert len(matches) >= 1
    assert isinstance(matches[0], JobMatchResult)

    # Test GET /{job_id}
    job = asyncio.run(get_job_by_id("job-101"))
    assert job.id == "job-101"
    assert job.company == "Anthropic Ecosystem Partner"

    # Test POST /select target job
    select_res = asyncio.run(select_target_job(SelectJobRequest(
        session_id="test-p3-session",
        job_id="job-101"
    )))
    assert select_res["status"] == "success"
    assert select_res["selected_job"].id == "job-101"
