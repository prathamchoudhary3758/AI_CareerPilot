from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Health Check ---
class HealthCheckResponse(BaseModel):
    status: str = "ok"
    app_name: str
    version: str
    timestamp: str

# --- Candidate Profile Models ---
class WorkExperience(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    bullets: List[str] = Field(default_factory=list)

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None

class Skill(BaseModel):
    name: str
    category: str = "general" # technical, soft, domain, tool
    years_experience: Optional[float] = None

class CandidateProfile(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    skills: List[Skill] = Field(default_factory=list)
    experience: List[WorkExperience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    raw_text: Optional[str] = None

# --- Job Models ---
class JobDescription(BaseModel):
    id: str
    title: str
    company: str
    location: str
    description: str
    requirements: List[str] = Field(default_factory=list)
    salary_range: Optional[str] = None
    employment_type: Optional[str] = "Full-time"
    posted_date: Optional[str] = None
    apply_url: Optional[str] = None

# --- Resume Analysis & Scoring Models ---
class ScoreBreakdown(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    skills_match: int = Field(..., ge=0, le=100)
    experience_relevance: int = Field(..., ge=0, le=100)
    ats_readability: int = Field(..., ge=0, le=100)
    action_verbs_metric: int = Field(..., ge=0, le=100)

class BulletRewriteSuggestion(BaseModel):
    original_bullet: str
    improved_bullet: str
    reason: str
    impact_metric_added: bool = False

class ResumeAnalysisResult(BaseModel):
    profile: CandidateProfile
    score_breakdown: ScoreBreakdown
    key_strengths: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    bullet_suggestions: List[BulletRewriteSuggestion] = Field(default_factory=list)
    ats_feedback: List[str] = Field(default_factory=list)

# --- Job Match Models ---
class JobMatchReasoning(BaseModel):
    fit_summary: str
    matched_skills: List[str]
    missing_critical_skills: List[str]
    potential_challenges: List[str]
    tailoring_tips: List[str]

class JobMatchResult(BaseModel):
    job: JobDescription
    match_percentage: int = Field(..., ge=0, le=100)
    reasoning: JobMatchReasoning

# --- Cover Letter Models ---
class CoverLetterRequest(BaseModel):
    session_id: str
    job_id: Optional[str] = None
    custom_job_description: Optional[str] = None
    tone: str = "professional" # professional, enthusiastic, concise

class CoverLetterResult(BaseModel):
    content: str
    tone: str
    word_count: int
    matched_qualifications: List[str]
    guardrail_check_passed: bool = True
    flagged_inconsistencies: List[str] = Field(default_factory=list)

# --- Interview Prep Models ---
class InterviewQuestion(BaseModel):
    id: str
    question: str
    category: str # behavioral, technical, situational
    expected_competency: str
    sample_star_points: List[str] = Field(default_factory=list)

class InterviewAnswerEvaluation(BaseModel):
    question_id: str
    user_answer: str
    score: int = Field(..., ge=0, le=100) # Rubric score
    star_breakdown: Dict[str, str] = Field(default_factory=dict) # Situation, Task, Action, Result
    strengths: List[str]
    areas_for_improvement: List[str]
    ideal_response_excerpt: str
    suggested_follow_up: Optional[str] = None

class InterviewSessionState(BaseModel):
    session_id: str
    role_title: str
    questions: List[InterviewQuestion] = Field(default_factory=list)
    history: List[InterviewAnswerEvaluation] = Field(default_factory=list)
    overall_readiness_score: Optional[int] = None

# --- Observability / SSE Models ---
class AgentEventLog(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    session_id: str
    event_type: str # 'node_enter', 'node_exit', 'tool_call', 'llm_thought', 'guardrail_alert'
    message: str
    data: Optional[Dict[str, Any]] = None
