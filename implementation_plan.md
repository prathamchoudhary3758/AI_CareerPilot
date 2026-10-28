# AI Career Co-Pilot — Multi-Agent Job Prep & Application Platform

A step-by-step implementation plan for building a production-quality, multi-agent system with an orchestrated LangGraph backend, FastAPI server, and a polished Next.js frontend.

---

## Overview

The platform lets a user upload their resume and receive an end-to-end AI-powered pipeline:
1. **Resume analysis & scoring** against a target job description
2. **Ranked job matches** with semantic reasoning
3. **Tailored cover letter generation** + application answers
4. **Mock interview sessions** with rubric-based feedback
5. **Live agent activity feed** (observability dashboard)

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                          │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐ ┌───────────────┐ │
│  │ Resume   │ │ Job Match │ │ Cover Letter │ │  Interview    │ │
│  │ Upload   │ │  Cards    │ │  Generator   │ │  Chat/Voice   │ │
│  └──────────┘ └───────────┘ └──────────────┘ └───────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Live Agent Activity Feed (SSE)                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTP + SSE
┌───────────────────────────────▼──────────────────────────────────┐
│                        FastAPI Backend                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Orchestrator Agent (LangGraph)            │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │  StateGraph:                                         │   │ │
│  │  │  start → resume_analyzer → job_matcher              │   │ │
│  │  │       → cover_letter_agent → interview_prep          │   │ │
│  │  │       → END  (conditional edges based on user goal)  │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐  │
│  │Resume Agent  │ │Job Match     │ │Cover Letter│ │Interview │  │
│  │(PyMuPDF+RAG) │ │Agent(Embed.) │ │Agent (LLM) │ │Prep Agent│  │
│  └──────────────┘ └──────────────┘ └────────────┘ └──────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ChromaDB (resume tips RAG) │ Redis (session state)        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack (Final Decisions)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | **Next.js 14** (App Router) + Tailwind + shadcn/ui | Modern, SSE-friendly, evaluator-recognized |
| Backend | **FastAPI** (Python 3.11+) | Native async, great for SSE streaming |
| Orchestration | **LangGraph** | Explicit state graph = showable trace |
| LLM | **Claude (claude-3-5-sonnet)** via Anthropic API | Tool calling, long context |
| Embeddings | `text-embedding-3-small` (OpenAI) | Cost-effective |
| Vector DB | **ChromaDB** (local, persistent) | Zero infra cost for dev |
| PDF Parsing | **PyMuPDF** (`fitz`) | Fast, accurate |
| Session/State | **Redis** (or in-memory dict for dev) | State handoff between agents |
| Auth | **NextAuth.js** (optional, email magic link) | |
| Deployment | **Vercel** (FE) + **Railway** (BE) | |

---

## Project Structure

```
AI Career Co-Pilot/
├── frontend/                  # Next.js 14 app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing/Dashboard
│   │   ├── resume/page.tsx    # Upload & analysis
│   │   ├── jobs/page.tsx      # Job match cards
│   │   ├── coverletter/page.tsx
│   │   ├── interview/page.tsx
│   │   └── activity/page.tsx  # Live agent feed
│   ├── components/
│   │   ├── ResumeUpload.tsx
│   │   ├── JobCard.tsx
│   │   ├── AgentActivityFeed.tsx
│   │   ├── InterviewChat.tsx
│   │   └── ...
│   └── lib/
│       └── api.ts             # API client
│
├── backend/                   # FastAPI app
│   ├── main.py                # FastAPI entry point
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── orchestrator.py    # LangGraph StateGraph
│   │   ├── resume_agent.py    # Resume parsing + RAG scoring
│   │   ├── job_match_agent.py # Job ranking + reasoning
│   │   ├── cover_letter_agent.py
│   │   └── interview_agent.py
│   ├── tools/
│   │   ├── pdf_parser.py      # PyMuPDF
│   │   ├── embeddings.py      # OpenAI embed util
│   │   ├── rag.py             # ChromaDB RAG
│   │   └── job_api.py         # JSearch/Adzuna API wrapper
│   ├── models/
│   │   └── schemas.py         # Pydantic models
│   ├── api/
│   │   ├── routes/
│   │   │   ├── resume.py
│   │   │   ├── jobs.py
│   │   │   ├── coverletter.py
│   │   │   ├── interview.py
│   │   │   └── stream.py      # SSE agent activity stream
│   ├── core/
│   │   ├── config.py          # Settings (env vars)
│   │   └── state.py           # Shared session state manager
│   └── requirements.txt
│
├── data/
│   └── resume_best_practices/ # RAG knowledge base docs
│
└── docker-compose.yml         # Redis + Chroma (optional)
```

---

## 5-Phase Implementation Roadmap

### Phase 1: Foundation, Full-Stack Scaffolding & Design System
- **Backend**: FastAPI app setup, CORS, health check, directory structure, core config & session state manager.
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Lucide icons + responsive dark glassmorphic design system.
- **Data Models**: Pydantic schemas for Resumes, Job Descriptions, Scores, Cover Letters, and Interview Sessions.
- **UI Shell**: Application navigation, dashboard layout, and placeholder views for all sub-modules.
- **Deliverable**: Runnable full-stack skeleton with interconnected API health check and modern UI shell.

### Phase 2: Resume Ingestion, Extraction & RAG Scoring Engine
- **Parser Engine**: PyMuPDF (`fitz`) text extraction for PDF/DOCX resumes.
- **Profile Extraction**: Structured candidate profile generation (skills, work history, education, achievements).
- **RAG Knowledge Base**: Local ChromaDB instance seeded with resume best practices and ATS optimization rules.
- **Scoring & Rewrites**: 0–100 match scoring against target JD with sub-scores, gap analysis, and AI bullet rewrites.
- **Frontend UI**: Drag-and-drop resume upload zone, extracted profile preview, visual ATS score gauge, and interactive rewrite suggestions.
- **Deliverable**: Working Resume Analyzer module where users upload a resume and get instant deep analysis.

### Phase 3: Semantic Job Matching & AI Reasoning Engine
- **Job Source**: Structured job dataset & API integration (JSearch / Adzuna with mock fallback for offline dev).
- **Semantic Matching**: Embeddings generation (`text-embedding-3-small` / local) and cosine similarity ranking.
- **AI Fit Reasoning**: LLM explanation generating "Why you're a fit", identified skill gaps, and quick-apply tips.
- **Frontend UI**: Job discovery board with match percentages, fit tags, filters, expandable reasoning, and job selection for downstream agents.
- **Deliverable**: Interactive Job Matcher recommending tailored jobs based on the parsed resume.

### Phase 4: Application Materials & Mock Interview Prep Agents
- **Cover Letter Agent**: Tailored cover letter generator calibrated to the candidate profile and selected JD.
- **Hallucination Guardrails**: Cross-verification of generated claims against parsed resume facts.
- **Application Q&A**: Generation of top 5 behavioral/technical screening question responses.
- **Interview Prep Agent**: Role-specific STAR-method question generator, interactive turn-by-turn chat, and rubric-based response evaluation.
- **Frontend UI**: Markdown cover letter editor with copy/download, and an interactive mock interview chat interface with instant feedback scores.
- **Deliverable**: Complete application toolkit (cover letter + Q&A) and real-time interview simulator.

### Phase 5: LangGraph Multi-Agent Orchestration, Live Observability Feed & Polish
- **LangGraph Orchestrator**: `StateGraph` linking Resume Analyzer -> Job Matcher -> Cover Letter -> Interview Prep with conditional branching.
- **Streaming Observability (SSE)**: Real-time agent event stream emitting agent transitions, tool invocations, and thinking states.
- **Frontend Live Feed**: Collapsible live agent activity stream panel showing execution traces, step latencies, and status badges.
- **End-to-End Hardening**: Comprehensive error handling, sample demo data, Docker Compose, and deployment scripts.
- **Deliverable**: Production-grade, fully orchestrated multi-agent platform ready for demo and deployment.

---

## Open Questions

> [!IMPORTANT]
> **Which LLM provider do you want to use?**
> - Claude (Anthropic) — longer context, strong instruction-following
> - GPT-4o (OpenAI) — widely available, cheaper embeddings in same SDK
> - Both (Claude for generation, OpenAI for embeddings) — most common production pattern
>
> *Recommended: Claude for generation + OpenAI `text-embedding-3-small` for embeddings*

> [!IMPORTANT]
> **Job data source?**
> - **JSearch API** (RapidAPI, free tier available) — real-time LinkedIn/Indeed scrape
> - **Adzuna API** (free tier, 250 req/day) — structured job board
> - **Mock/static dataset** — no API key needed, good for dev/demo
>
> *Recommended: Start with mock dataset, wire real API behind a feature flag*

> [!IMPORTANT]
> **Do you want voice for the Interview Prep agent?**
> - Text-only (simpler, ships faster)
> - Voice (Whisper STT + browser TTS or ElevenLabs) — impressive but adds complexity
>
> *Recommended: Text-first, voice as Phase 9 stretch goal*

> [!IMPORTANT]
> **Authentication?**
> - No auth (single-user demo mode) — simplest for a portfolio project
> - NextAuth with Google OAuth — realistic, not much extra work
>
> *Recommended: No auth for Phase 1, add OAuth later*

> [!NOTE]
> **Phase order**: We'll build one phase at a time so you see working software at every step. Each phase ends with a runnable demo.

---

## Verification Plan

### Per-Phase Checks
- Backend routes tested with `curl` / Swagger UI (`/docs`)
- Frontend pages hot-reload and render correctly in browser
- Agent outputs logged to console + SSE stream visible in browser DevTools

### End-to-End
- Upload a real PDF resume → full pipeline runs → all 5 sections populated
- SSE activity feed shows every agent handoff in real time
- Cover letter guardrail flags a hallucinated company name
