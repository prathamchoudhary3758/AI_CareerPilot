import os
import pytest
from backend.tools.pdf_parser import extract_text_from_pdf, parse_resume_sections, extract_text_from_bytes
from backend.tools.rag import ATSKnowledgeBase, ats_knowledge_base
from backend.agents.resume_agent import ResumeAgent, resume_agent, DEFAULT_TARGET_JOB
from backend.models.schemas import CandidateProfile, ResumeAnalysisResult

SAMPLE_PDF_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data", "sample_resumes", "alex_morgan_resume.pdf"
)

SAMPLE_TXT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data", "sample_resumes", "alex_morgan_resume.txt"
)


def test_pdf_extraction():
    """Verify PyMuPDF extracts text from resume PDF."""
    assert os.path.exists(SAMPLE_PDF_PATH), "Sample PDF should exist"
    with open(SAMPLE_PDF_PATH, "rb") as f:
        content = f.read()
    text = extract_text_from_pdf(content)
    assert "Alex Morgan" in text
    assert "alex.morgan@example.com" in text
    assert "FastAPI" in text


def test_resume_sections_parsing():
    """Verify section segmentation divides resume into logical blocks."""
    with open(SAMPLE_TXT_PATH, "r", encoding="utf-8") as f:
        raw_text = f.read()
    sections = parse_resume_sections(raw_text)
    assert "experience" in sections or "skills" in sections or "summary" in sections


def test_rag_retrieval_and_heuristics():
    """Verify RAG ATS rules retrieval and action verb / metric heuristics."""
    kb = ATSKnowledgeBase()
    rules = kb.retrieve_relevant_rules("FastAPI Next.js Microservices ATS layout", top_k=3)
    assert len(rules) >= 1

    # Test Action Verbs
    bullets = [
        "Architected scalable microservices processing 10M+ events.",
        "Worked on bug fixes and assisted team with tickets."
    ]
    verb_res = kb.analyze_action_verbs(bullets)
    assert verb_res["strong_count"] >= 1
    assert verb_res["weak_count"] >= 1

    # Test Impact Metrics
    metric_res = kb.analyze_impact_metrics(bullets)
    assert metric_res["metric_bullets_count"] >= 1


def test_candidate_profile_extraction():
    """Verify profile extraction builds structured candidate object."""
    with open(SAMPLE_TXT_PATH, "r", encoding="utf-8") as f:
        raw_text = f.read()
    profile = resume_agent.extract_candidate_profile(raw_text)
    assert profile.full_name == "Alex Morgan"
    assert profile.email == "alex.morgan@example.com"
    assert len(profile.skills) > 5
    skill_names = [s.name for s in profile.skills]
    assert "Python" in skill_names
    assert "FastAPI" in skill_names
    assert len(profile.experience) >= 1


def test_resume_agent_full_analysis():
    """Verify end-to-end resume scoring against target job."""
    import asyncio
    with open(SAMPLE_TXT_PATH, "r", encoding="utf-8") as f:
        raw_text = f.read()
    result = asyncio.run(resume_agent.analyze_resume(raw_text, session_id="test-pytest-session"))
    assert isinstance(result, ResumeAnalysisResult)
    assert 0 <= result.score_breakdown.overall_score <= 100
    assert 0 <= result.score_breakdown.skills_match <= 100
    assert 0 <= result.score_breakdown.ats_readability <= 100
    assert len(result.key_strengths) >= 1
    assert len(result.bullet_suggestions) >= 1
    assert result.bullet_suggestions[0].improved_bullet != ""


def test_resume_api_endpoints():
    """Verify resume routes return structured analysis and profile."""
    import asyncio
    from backend.api.routes.resume import get_sample_analysis, get_candidate_profile, get_session_analysis
    
    sample = asyncio.run(get_sample_analysis())
    assert sample.score_breakdown.overall_score > 0
    assert sample.profile.full_name == "Alex Morgan"

    profile = asyncio.run(get_candidate_profile("test-pytest-session"))
    assert profile.full_name == "Alex Morgan"

    analysis = asyncio.run(get_session_analysis("test-pytest-session"))
    assert analysis.score_breakdown.overall_score > 0

