# 🚀 AI Career Co-Pilot

> An end-to-end, multi-agent job preparation and application acceleration platform featuring an orchestrated LangGraph backend, FastAPI async core, and a polished Next.js 14 frontend.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

**AI Career Co-Pilot** transforms job hunting into an automated, high-precision workflow:
1. **Resume Analysis & Scoring**: Ingests resumes (PDF/DOCX) using PyMuPDF, maps candidate profiles to structured JSON, and scores against target job descriptions using local ChromaDB RAG seeded with ATS best practices.
2. **Semantic Job Matching**: Computes vector embeddings and cosine similarity against real-world roles, generating AI reasoning badges (*"Why you fit"* vs *"Critical skill gaps"*).
3. **Tailored Application Materials**: Generates contextual cover letters with anti-hallucination guardrails that cross-check claims against verified resume facts.
4. **Mock Interview Simulation**: Generates role-specific questions with real-time STAR rubric scoring and actionable coaching tips.
5. **Live Agent Activity Feed**: Full multi-agent orchestration via LangGraph `StateGraph`, streaming real-time execution traces over Server-Sent Events (SSE).

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                          │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐ ┌───────────────┐   │
│  │ Resume   │ │ Job Match │ │ Cover Letter │ │  Interview    │   │
│  │ Upload   │ │  Cards    │ │  Generator   │ │  Chat / Voice │   │
│  └──────────┘ └───────────┘ └──────────────┘ └───────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Live Agent Activity Feed (SSE)                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTP + SSE
┌───────────────────────────────▼──────────────────────────────────┐
│                        FastAPI Backend                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Orchestrator Agent (LangGraph)            │ │
│  │  StateGraph:                                                │ │
│  │  start → resume_analyzer → job_matcher                      │ │
│  │       → cover_letter_agent → interview_prep → END           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐   │
│  │Resume Agent  │ │Job Match     │ │Cover Letter│ │Interview │   │
│  │(PyMuPDF+RAG) │ │Agent(Embed.) │ │Agent (LLM) │ │Prep Agent│   │
│  └──────────────┘ └──────────────┘ └────────────┘ └──────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ChromaDB (ATS best-practice RAG) │ Session State (Pub/Sub) │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ 5-Phase Implementation Roadmap

- [x] **Phase 1: Foundation, Full-Stack Scaffolding & Design System**
  - FastAPI async backend with CORS, health checks, unified Pydantic schemas, and session state manager.
  - Next.js 14 App Router, dark glassmorphic styling, ambient gradients, and live backend connection badge.
  - Interactive shell pages for Resume Analyzer, Job Matcher, Cover Letter Generator, Interview Prep, and Live Agent Feed.
  - Containerization (`docker-compose.yml`, Dockerfiles) & automated test suite (`pytest`).
- [ ] **Phase 2: Resume Ingestion, Extraction & RAG Scoring Engine**
- [ ] **Phase 3: Semantic Job Matching & AI Reasoning Engine**
- [ ] **Phase 4: Application Materials & Mock Interview Prep Agents**
- [ ] **Phase 5: LangGraph Multi-Agent Orchestration, Live Observability Feed & Polish**

---

## 📁 Repository Structure

```
AI Career Co-Pilot/
├── frontend/                  # Next.js 14 App Router frontend
│   ├── app/                   # App Router pages (/resume, /jobs, /coverletter, /interview, /activity)
│   ├── components/            # Reusable UI components (Navbar, BackendStatusBadge)
│   ├── lib/                   # Typed API client and SSE stream subscriber
│   └── public/                # Static assets
│
├── backend/                   # FastAPI async application
│   ├── api/routes/            # Route modules (health, resume, jobs, coverletter, interview, stream)
│   ├── core/                  # Configuration (pydantic-settings) & session state manager
│   ├── models/                # Unified Pydantic models (CandidateProfile, JobMatch, etc.)
│   ├── tests/                 # Automated test suite (pytest)
│   ├── main.py                # FastAPI entrypoint
│   └── requirements.txt       # Python dependencies
│
├── data/
│   └── resume_best_practices/ # Seed knowledge documents for ATS RAG engine
│
├── docker-compose.yml         # Containerized local orchestration
├── pytest.ini                 # Pytest configuration
└── implementation_plan.md     # Architectural blueprint and milestones
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/prathamchoudhary3758/AI_CareerPilot.git
cd AI_CareerPilot

# Create and activate virtual environment
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run backend tests
pytest

# Launch FastAPI server
uvicorn backend.main:app --reload --port 8000
```
Interactive API documentation is accessible at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 3. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Launch Next.js dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

To run the automated test suite:
```bash
pytest
```

---

## 📜 License

MIT License. Developed for modern career advancement and autonomous agent workflows.
