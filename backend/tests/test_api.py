import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "AI Career Co-Pilot API"

def test_resume_sample_analysis():
    response = client.get("/api/resume/sample-analysis")
    assert response.status_code == 200
    data = response.json()
    assert "profile" in data
    assert "score_breakdown" in data
    assert data["score_breakdown"]["overall_score"] > 0

def test_jobs_matches():
    response = client.get("/api/jobs/matches")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "match_percentage" in data[0]

def test_cover_letter_generation():
    response = client.post("/api/coverletter/generate", json={
        "session_id": "test-session",
        "tone": "professional"
    })
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert data["guardrail_check_passed"] is True

def test_interview_questions():
    response = client.get("/api/interview/questions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "question" in data[0]
