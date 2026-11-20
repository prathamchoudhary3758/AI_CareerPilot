"""Job data source integrating curated datasets and external Job APIs (JSearch / Adzuna)."""

from typing import List, Dict, Any, Optional
from backend.models.schemas import JobDescription
from backend.core.config import get_settings

settings = get_settings()

# Curated benchmark dataset of diverse tech roles for reliable offline dev & testing
CURATED_JOBS: List[Dict[str, Any]] = [
    {
        "id": "job-101",
        "title": "Senior AI Application Engineer",
        "company": "Anthropic Ecosystem Partner",
        "location": "Remote / San Francisco, CA",
        "description": "Architect agentic workflows, orchestrate LLM systems using LangGraph and FastAPI, and build intuitive user experiences. You will design RAG pipelines and integrate vector stores with low-latency APIs.",
        "requirements": [
            "Python",
            "FastAPI",
            "LangGraph or LangChain",
            "RAG Architecture",
            "TypeScript",
            "Next.js or React",
            "Docker & Kubernetes",
            "Vector Databases"
        ],
        "salary_range": "$165,000 - $195,000",
        "employment_type": "Full-time",
        "posted_date": "1 day ago",
        "apply_url": "https://example.com/jobs/ai-app-eng-101"
    },
    {
        "id": "job-102",
        "title": "Full-Stack AI Solutions Architect",
        "company": "ScaleAI Partner Labs",
        "location": "San Francisco, CA (Hybrid)",
        "description": "Build production-grade multi-agent platforms and evaluation testbeds for Fortune 500 enterprise clients. High emphasis on distributed systems, event streams, and modern React interfaces.",
        "requirements": [
            "Python",
            "TypeScript",
            "Next.js",
            "FastAPI",
            "Distributed Systems",
            "Vector Databases (Chroma / Pinecone)",
            "PostgreSQL",
            "Redis"
        ],
        "salary_range": "$175,000 - $210,000",
        "employment_type": "Full-time",
        "posted_date": "2 days ago",
        "apply_url": "https://example.com/jobs/scale-solutions-102"
    },
    {
        "id": "job-103",
        "title": "Lead Backend Engineer (Python & Distributed Systems)",
        "company": "DataPulse Cloud",
        "location": "Remote / New York, NY",
        "description": "Lead a team of 6 engineers architecting event-driven microservices processing 50M+ daily events. You will optimize Redis caching, PostgreSQL query plans, and automated CI/CD pipelines.",
        "requirements": [
            "Python",
            "FastAPI",
            "Redis",
            "PostgreSQL",
            "Microservices Architecture",
            "Docker",
            "Kubernetes",
            "AWS",
            "System Design"
        ],
        "salary_range": "$170,000 - $205,000",
        "employment_type": "Full-time",
        "posted_date": "3 days ago",
        "apply_url": "https://example.com/jobs/datapulse-lead-103"
    },
    {
        "id": "job-104",
        "title": "DevOps & Cloud Infrastructure Architect",
        "company": "CloudForge Systems",
        "location": "Austin, TX (Remote)",
        "description": "Orchestrate multi-region cloud infrastructure on AWS, manage Kubernetes clusters, automate Terraform provisioning, and ensure 99.99% uptime across production services.",
        "requirements": [
            "Kubernetes",
            "Docker",
            "AWS",
            "Terraform",
            "CI/CD Pipelines",
            "Linux",
            "Python or Go",
            "Monitoring & Observability"
        ],
        "salary_range": "$160,000 - $190,000",
        "employment_type": "Full-time",
        "posted_date": "4 days ago",
        "apply_url": "https://example.com/jobs/cloudforge-devops-104"
    },
    {
        "id": "job-105",
        "title": "Senior Frontend Engineer (Next.js & TypeScript)",
        "company": "Vercel Partner Studio",
        "location": "Remote / Seattle, WA",
        "description": "Craft responsive, accessible, dark-glassmorphic user interfaces using Next.js 14 App Router, TypeScript, and Tailwind CSS. Connect reactive SSE and WebSocket feeds for real-time AI observability.",
        "requirements": [
            "Next.js",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "State Management",
            "SSE / WebSockets",
            "Performance Optimization",
            "REST APIs"
        ],
        "salary_range": "$150,000 - $185,000",
        "employment_type": "Full-time",
        "posted_date": "5 days ago",
        "apply_url": "https://example.com/jobs/vercel-frontend-105"
    },
    {
        "id": "job-106",
        "title": "Machine Learning Engineer (LLM & Fine-Tuning)",
        "company": "CognitiveAI Labs",
        "location": "Boston, MA (Hybrid)",
        "description": "Train, evaluate, and fine-tune open-source models (Llama, Mistral) using PyTorch, Hugging Face, and LoRA/QLoRA. Deploy low-latency inference endpoints with vLLM and FastAPI.",
        "requirements": [
            "Python",
            "PyTorch",
            "Hugging Face",
            "FastAPI",
            "Model Fine-Tuning (LoRA)",
            "Docker",
            "GPU Optimization",
            "Evaluation Metrics"
        ],
        "salary_range": "$180,000 - $220,000",
        "employment_type": "Full-time",
        "posted_date": "6 days ago",
        "apply_url": "https://example.com/jobs/cognitive-ml-106"
    }
]


class JobSourceManager:
    """Manages job retrieval from local repository or external APIs (JSearch / Adzuna)."""

    def __init__(self):
        self._jobs: List[JobDescription] = [JobDescription(**item) for item in CURATED_JOBS]

    def get_all_jobs(self) -> List[JobDescription]:
        """Returns all available jobs in the catalog."""
        return list(self._jobs)

    def get_job_by_id(self, job_id: str) -> Optional[JobDescription]:
        """Finds a specific job by its ID."""
        for job in self._jobs:
            if job.id == job_id:
                return job
        return None

    async def search_jobs(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        remote_only: bool = False
    ) -> List[JobDescription]:
        """Filters jobs based on query keywords, location, or remote preference."""
        results = list(self._jobs)

        if remote_only and isinstance(remote_only, bool):
            results = [j for j in results if "remote" in j.location.lower()]

        if location and isinstance(location, str):
            loc_lower = location.lower()
            results = [j for j in results if loc_lower in j.location.lower()]

        if query and isinstance(query, str):
            q_terms = query.lower().split()
            filtered = []
            for j in results:
                target_str = f"{j.title} {j.description} {' '.join(j.requirements)} {j.company}".lower()
                if any(term in target_str for term in q_terms):
                    filtered.append(j)
            results = filtered

        return results


job_source_manager = JobSourceManager()
