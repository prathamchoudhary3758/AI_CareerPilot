# 📘 AI Career Co-Pilot — Phase 2 Documentation

Welcome to the comprehensive documentation of **Phase 2: Resume Ingestion, Extraction & RAG Scoring Engine** for the **AI Career Co-Pilot** platform.

---

## 1. Executive Summary & Accomplishments in Phase 2

Phase 2 transitions the platform from a scaffolding prototype into an intelligent document ingestion, structural extraction, and retrieval-augmented ATS scoring engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (Phase 2 UI)                   │
│  - Drag-and-drop resume upload zone (PDF, DOCX, TXT)                   │
│  - Target role context switcher (AI Engineer, Full-Stack, DevOps)      │
│  - Dual-mode view: ATS Match & Scoring vs Extracted Profile            │
│  - Visual score gauges: Overall Match + 4 sub-scores (0-100)           │
│  - Identified Strengths (green) & Skill Gaps for Target Role (amber)   │
│  - Interactive AI Bullet Rewrites with Google XYZ formula & Copy action│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Multipart / JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FastAPI Async Backend                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                Resume Agent (backend/agents/resume_agent.py)     │  │
│  │  - Candidate Profile Extractor (Contact, Skills, Exp, Edu)       │  │
│  │  - Multi-tiered Skills Taxonomy Classifier (4 categories)        │  │
│  │  - 5-Metric ATS Weighted Scoring Engine                          │  │
│  │  - Google XYZ / STAR Bullet Rewrite Generator                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│         │                                        │                     │
│         ▼                                        ▼                     │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │ PyMuPDF Parser Engine   │          │ ATS Knowledge Base (RAG)    │  │
│  │ (backend/tools/pdf_parser)│          │ (backend/tools/rag.py)      │  │
│  │ - PDF layout extraction │          │ - BM25 / token retrieval    │  │
│  │ - DOCX/TXT fallback     │          │ - Strong vs weak verb rules │  │
│  │ - Section segmentation  │          │ - Impact metric heuristics  │  │
│  └─────────────────────────┘          └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Components Delivered in Phase 2

### 2.1 Parser Engine ([backend/tools/pdf_parser.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/tools/pdf_parser.py))
- **PyMuPDF (`pymupdf` / `fitz`) Integration**:
  - High-performance binary extraction of layout text from PDF resumes.
  - Page-by-page text assembly with newline normalization and unicode clean-up.
- **DOCX & TXT Support**:
  - `python-docx` parsing for tables and paragraphs.
  - UTF-8 fallback for plain text documents.
- **Section Segmentation**:
  - Multi-pattern regular expressions identifying standard resume sections:
    - `summary`: Professional Summary, Executive Summary, Profile, About Me.
    - `experience`: Work Experience, Professional Experience, Employment History.
    - `skills`: Technical Skills, Core Competencies, Technologies, Tools.
    - `education`: Academic Background, Qualifications, Degrees.
    - `projects`: Key Projects, Open Source, Personal Projects.
    - `certifications`: Certificates, Licenses, Accreditations.

---

### 2.2 Structured Candidate Profile Extraction ([backend/agents/resume_agent.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/agents/resume_agent.py))
- **Contact Info Extraction**:
  - Email addresses, telephone numbers, and geographical locations extracted via regex.
  - Candidate name inference from header lines with exclusion filters.
  - Professional headline detection across 10+ standard technical roles.
- **Categorized Skills Taxonomy**:
  - 40+ technologies classified across four standard categories:
    - `technical`: Python, FastAPI, TypeScript, Next.js, React, Node.js, SQL, PostgreSQL, Redis, GraphQL, REST APIs.
    - `domain`: LangChain, LangGraph, RAG Architecture, OpenAI API, Anthropic Claude, PyTorch, ChromaDB.
    - `tool`: Docker, Kubernetes, AWS, Google Cloud, CI/CD Pipelines, Git, Terraform.
    - `soft`: Engineering Leadership, Mentorship, Agile/Scrum, Cross-functional Collaboration.
  - Automatic estimation of years of experience based on resume seniority indicators.
- **Work Experience & Education Segmentation**:
  - Role title, company name, dates (e.g. `2022-01 — Present`), and individual bullet points.
  - Degree, institution, field of study, and graduation year extraction.

---

### 2.3 RAG Knowledge Base & ATS Optimization Rules ([backend/tools/rag.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/tools/rag.py))
- **Seeded Knowledge Store**:
  - Parses guidelines from `data/resume_best_practices/ats_optimization_guide.md` and `star_impact_metrics.md`.
  - Ingests ATS single-column layout standards, keyword density rules, and Google XYZ impact formulas.
- **Semantic Retrieval**:
  - Fast token-overlap / BM25 similarity search retrieving top-$k$ relevant rules for the active candidate profile and target job description.
- **Verbiage & Metric Heuristics**:
  - **Action Verb Analysis**: Evaluates bullet points against a set of 30+ strong technical action verbs (*Architected, Spearheaded, Engineered, Automated, Optimized, Scaled*) vs passive verbs (*Worked on, Assisted with, Handled, Helped with*).
  - **Impact Metric Detection**: Detects quantifiable business outcomes (percentages, throughput figures, user volume, dollar savings, latency decreases).

---

### 2.4 Composite Scoring & AI Bullet Rewriting
- **0–100 Weighted Score Breakdown**:
  $$\text{Overall Score} = 0.35 \times \text{SkillsMatch} + 0.25 \times \text{Relevance} + 0.20 \times \text{ATSReadability} + 0.20 \times \text{ActionVerbs}$$
  - **Skills Match (0–100)**: Overlap of candidate skills against required and preferred job competencies.
  - **Experience Relevance (0–100)**: Alignment of past responsibilities and bullets with the target job requisition.
  - **ATS Readability (0–100)**: Layout parsability, presence of accessible contact headers, and clean structural hierarchy.
  - **Action Verbs Metric (0–100)**: Ratio of high-impact leadership verbs to passive phrasing.
- **AI Bullet Rewrites**:
  - Converts weak or unquantified bullets into the **Google XYZ Format**:
    $$\text{"Accomplished [X] as measured by [Y], by doing [Z]"}$$
  - Injects measurable metrics, replaces passive verbs, and provides clear rationales.

---

### 2.5 REST Endpoints ([backend/api/routes/resume.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/api/routes/resume.py))
| Endpoint | Method | Description |
|---|---|---|
| `/api/resume/upload` | `POST` | Accepts PDF/DOCX/TXT file upload, runs PyMuPDF extraction, executes Resume Agent, updates session state, and emits live SSE events. |
| `/api/resume/analyze` | `POST` | Re-analyzes resume text against a dynamically selected or custom target job description. |
| `/api/resume/profile/{session_id}` | `GET` | Retrieves the extracted candidate profile for the specified session. |
| `/api/resume/analysis/{session_id}` | `GET` | Retrieves the stored ATS analysis results for the specified session. |
| `/api/resume/sample-analysis` | `GET` | Returns pre-calibrated sample analysis data for instant frontend previews. |

---

### 2.6 Interactive Next.js Frontend ([frontend/app/resume/page.tsx](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/frontend/app/resume/page.tsx))
- **Drag-and-Drop Upload Zone**:
  - Live upload status feedback (*"Extracting layout & text with PyMuPDF..."*).
  - Active file indicator and size validation.
- **Target Role Context Switcher**:
  - One-click switching between pre-configured benchmark roles:
    1. *Senior AI Application Engineer* (Anthropic Ecosystem Partner)
    2. *Full-Stack Software Engineer* (CloudScale Systems)
    3. *DevOps & Cloud Engineer* (Enterprise Cloud Ops)
  - Dynamically triggers `/api/resume/analyze` to re-score the candidate in real-time.
- **Dual Tab Interface**:
  - **ATS Match & Scoring Tab**: Overall score banner, 4 sub-score metrics, identified strengths, skill gap tags, before/after bullet rewrites with "Copy" button, and ATS parsability checklist.
  - **Extracted Profile Tab**: Candidate headline, contact badges, categorized skills taxonomy pills, and chronological work experience blocks.

---

## 3. Automated Test Suite & Verification

The Phase 2 implementation was thoroughly verified with automated pytest tests and Next.js production builds:

```
============================= test session starts =============================
platform win32 -- Python 3.11.5, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Users\prath\Desktop\AI Career Co-Pilot
plugins: anyio-4.15.1
collected 6 items

backend/tests/test_phase2.py::test_pdf_extraction PASSED                 [ 16%]
backend/tests/test_phase2.py::test_resume_sections_parsing PASSED        [ 33%]
backend/tests/test_phase2.py::test_rag_retrieval_and_heuristics PASSED   [ 50%]
backend/tests/test_phase2.py::test_candidate_profile_extraction PASSED   [ 66%]
backend/tests/test_phase2.py::test_resume_agent_full_analysis PASSED     [ 83%]
backend/tests/test_phase2.py::test_resume_api_endpoints PASSED           [100%]

============================== 6 passed in 0.58s ==============================
```

### Next.js Production Build:
```
✓ Compiled successfully in 2.6s
✓ Finished TypeScript in 3.0s
✓ Generating static pages (9/9)
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /activity
├ ○ /coverletter
├ ○ /interview
├ ○ /jobs
└ ○ /resume
```

---

## 4. How to Run Phase 2

### 1. Start the FastAPI Backend
```powershell
.\.venv\Scripts\uvicorn backend.main:app --reload --port 8000
```
- Open Swagger documentation at: `http://127.0.0.1:8000/docs`
- Test the `/api/resume/upload` endpoint with any PDF, DOCX, or TXT file.

### 2. Start the Next.js Frontend
```powershell
npm --prefix frontend run dev
```
- Open `http://localhost:3000/resume` in your browser.
- Drop a resume or select a target role to view instant ATS scoring, skill gaps, and bullet rewrites.
