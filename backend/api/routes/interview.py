from fastapi import APIRouter
from typing import List
from backend.models.schemas import InterviewQuestion, InterviewAnswerEvaluation

router = APIRouter(prefix="/interview", tags=["Interview Prep"])

@router.get("/questions", response_model=List[InterviewQuestion])
async def get_role_questions():
    """Retrieve tailored interview questions for the candidate's target role."""
    return [
        InterviewQuestion(
            id="q1",
            question="Can you walk us through an architectural decision where you chose an event-driven system or agentic workflow, and what trade-offs you evaluated?",
            category="technical",
            expected_competency="Distributed Systems & LLM Architecture",
            sample_star_points=[
                "Situation: High volume asynchronous event pipeline",
                "Task: Maintain low latency without losing event ordering",
                "Action: Implemented queue-based dispatch with idempotency keys",
                "Result: 99.99% uptime and 40% latency reduction"
            ]
        ),
        InterviewQuestion(
            id="q2",
            question="Describe a situation where an LLM agent produced hallucinations or unexpected failure modes. How did you mitigate this in production?",
            category="situational",
            expected_competency="LLM Guardrails & Observability",
            sample_star_points=[
                "Situation: Multi-agent pipeline hallucinating customer account facts",
                "Task: Implement deterministic verification guardrail",
                "Action: Added Pydantic schema validation & ground-truth fact checker node",
                "Result: Zero hallucinated claims leaked to end users"
            ]
        )
    ]

@router.post("/evaluate-answer", response_model=InterviewAnswerEvaluation)
async def evaluate_interview_answer(payload: dict):
    """Rubric-based evaluation of user's mock interview response."""
    answer = payload.get("user_answer", "")
    return InterviewAnswerEvaluation(
        question_id=payload.get("question_id", "q1"),
        user_answer=answer,
        score=87,
        star_breakdown={
            "Situation": "Clear context setting on microservice bottlenecks.",
            "Task": "Well-defined objective to cut triage latency.",
            "Action": "Explicit description of LangGraph and Redis integration.",
            "Result": "Quantified 42% improvement metric."
        },
        strengths=[
            "Excellent quantification of business impact (42% speedup)",
            "Articulated technical reasoning between sync vs async processing"
        ],
        areas_for_improvement=[
            "Could elaborate slightly more on error recovery when external LLM APIs timeout"
        ],
        ideal_response_excerpt="Emphasize circuit breakers and fallback static responses when downstream LLM APIs experience rate-limits.",
        suggested_follow_up="How did you handle token quota limits across peak hours?"
    )
