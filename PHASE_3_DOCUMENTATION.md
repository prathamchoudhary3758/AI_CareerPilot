# 📘 AI Career Co-Pilot — Phase 3 Documentation

Welcome to the comprehensive documentation of **Phase 3: Semantic Job Matching & AI Reasoning Engine** for the **AI Career Co-Pilot** platform.

---

## 1. Executive Summary & Accomplishments in Phase 3

Phase 3 implements high-dimensional semantic matching, vector cosine ranking, and an automated AI fit reasoning engine to connect candidate profiles to relevant job requisitions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (Phase 3 UI)                   │
│  - Real-time search by job title & technology stack (FastAPI, Next.js) │
│  - Filter controls: Remote-only toggle, Min Match % thresholds         │
│  - Candidate context banner showing active profile & indexed skills    │
│  - Interactive Job Match Cards: match percentage gauges, salary, tags  │
│  - Expandable AI Semantic Match Rationale: narrative fit summary,      │
│    matched candidate strengths, identified skill gaps, tailoring tips  │
│  - One-click actions: "Set Target Role", "Tailor Letter", "Interview"  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST + Query Params
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FastAPI Async Backend                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             Job Match Agent (backend/agents/job_match_agent.py)  │  │
│  │  - Candidate profile representation builder                      │  │
│  │  - Multi-factor match percentage (55% vector + 45% skill overlap)│  │
│  │  - AI Fit Reasoning synthesis (Summary, Gaps, Tailoring tips)    │  │
│  │  - Target role selection synchronization into session state      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│         │                                        │                     │
│         ▼                                        ▼                     │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │ Embeddings Engine       │          │ Job Source & Catalog        │  │
│  │ (backend/tools/         │          │ (backend/tools/job_api.py)  │  │
│  │  embeddings.py)         │          │ - Curated benchmark roles   │  │
│  │ - OpenAI 3-small &      │          │ - Multi-attribute search    │  │
│  │   384-dim TF-IDF unit   │          │ - External API connector    │  │
│  │ - Cosine similarity     │          │   (JSearch / Adzuna)        │  │
│  └─────────────────────────┘          └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Components Delivered in Phase 3

### 2.1 Semantic Vector Embeddings Engine ([backend/tools/embeddings.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/tools/embeddings.py))
- **Hybrid Embedding Pipeline**:
  - Automatically queries OpenAI `text-embedding-3-small` when `OPENAI_API_KEY` is configured.
  - Seamlessly falls back to a deterministic 384-dimensional sub-word token hashing and term-frequency vectorizer with $L_2$ unit normalization:
    $$\|\mathbf{v}\|_2 = \sqrt{\sum_{i=1}^{d} v_i^2} = 1.0$$
- **Cosine Similarity Formulation**:
  $$\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
  - Returns a strictly normalized similarity score bounded in $[0.0, 1.0]$.

---

### 2.2 Job Source & Catalog Engine ([backend/tools/job_api.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/tools/job_api.py))
- **Curated Tech Job Requisitions**:
  - Curated database of tech roles spanning AI Application Engineering, Full-Stack Solutions Architecture, Distributed Systems Backend, DevOps & Cloud Architecture, Senior Frontend, and Machine Learning Fine-Tuning.
- **Search & Filtering**:
  - Multi-attribute query filtering supporting keyword tokens, geographic locations, and `remote_only` flags.
  - Pluggable interface for external job search APIs (JSearch via RapidAPI, Adzuna).

---

### 2.3 Semantic Job Matcher Agent ([backend/agents/job_match_agent.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/agents/job_match_agent.py))
- **Candidate-to-Job Representation**:
  - Synthesizes candidate headline, executive summary, categorized skills, and work history into dense vector representations.
- **Composite Match Percentage Formulation**:
  - Combines high-dimensional semantic similarity (55% weight) with exact required skill coverage (45% weight):
    $$\text{Match Percentage} = \text{round}\Big(100 \times \big(0.55 \times \text{Similarity} + 0.45 \times \text{SkillRatio}\big)\Big)$$
  - Formatted and bounded between $40\%$ and $97\%$.
- **AI Fit Reasoning Generation**:
  - `fit_summary`: High-level narrative explaining the candidate's alignment with the role.
  - `matched_skills`: List of candidate skills directly matching the job requirements.
  - `missing_critical_skills`: Gaps between candidate history and job requirements.
  - `potential_challenges`: Specific hurdles the candidate is likely to encounter in technical screening.
  - `tailoring_tips`: Actionable resume and interview strategies to maximize conversion.
- **Telemetry & Downstream Synchronization**:
  - Broadcasts `job_matching_started`, `job_matching_completed`, and `target_job_selected` events to the SSE event bus.
  - Updates `session["target_job"]` for Cover Letter and Interview Prep agents.

---

### 2.4 REST API Endpoints ([backend/api/routes/jobs.py](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/backend/api/routes/jobs.py))
| Endpoint | Method | Description |
|---|---|---|
| `/api/jobs/matches` | `GET` | Retrieves ranked job matches for the session candidate profile with query, location, remote, and min-match filters. |
| `/api/jobs/match-profile` | `POST` | Matches an explicitly provided `CandidateProfile` payload against the job catalog. |
| `/api/jobs/{job_id}` | `GET` | Retrieves a specific job description by ID. |
| `/api/jobs/select` | `POST` | Sets a selected job as the active target job for downstream cover letter and interview agents. |

---

### 2.5 Next.js 14 Job Discovery Board ([frontend/app/jobs/page.tsx](file:///c:/Users/prath/Desktop/AI%20Career%20Co-Pilot/frontend/app/jobs/page.tsx))
- **Live Search & Filter Bar**:
  - Real-time search by keyword/technology with filter pills (*Remote Only*, *All Matches*, *80%+ Match*, *85%+ High Fit*).
- **Candidate Profile Context Banner**:
  - Displays the active candidate profile being evaluated (*e.g. Alex Morgan • 26 skills indexed*) with a quick link to update the resume.
- **Interactive Job Cards**:
  - Visual match percentage badges (Emerald $\ge 85\%$, Amber $\ge 70\%$, Indigo $< 70\%$).
  - Expandable accordion displaying the **AI Semantic Match Rationale**.
  - One-click **Set Target Role** button with live feedback notification.
  - Direct navigation links to `/coverletter?jobId=...` and `/interview?jobId=...`.

---

## 3. Automated Test Suite & Verification

Phase 3 was verified with comprehensive automated tests covering vector embeddings, job catalog filtering, ranking algorithms, and API endpoints:

```
============================= test session starts =============================
platform win32 -- Python 3.11.5, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Users\prath\Desktop\AI Career Co-Pilot
collected 10 items

backend/tests/test_phase2.py::test_pdf_extraction PASSED                 [ 10%]
backend/tests/test_phase2.py::test_resume_sections_parsing PASSED        [ 20%]
backend/tests/test_phase2.py::test_rag_retrieval_and_heuristics PASSED   [ 30%]
backend/tests/test_phase2.py::test_candidate_profile_extraction PASSED   [ 40%]
backend/tests/test_phase2.py::test_resume_agent_full_analysis PASSED     [ 50%]
backend/tests/test_phase2.py::test_resume_api_endpoints PASSED           [ 60%]
backend/tests/test_phase3.py::test_embeddings_generation_and_cosine PASSED [ 70%]
backend/tests/test_phase3.py::test_job_source_catalog_and_search PASSED  [ 80%]
backend/tests/test_phase3.py::test_job_match_agent_ranking_and_reasoning PASSED [ 90%]
backend/tests/test_phase3.py::test_job_api_endpoints PASSED              [100%]

============================= 10 passed in 1.02s ==============================
```

### Next.js Production Build:
```
✓ Compiled successfully in 1810ms
✓ Finished TypeScript in 2.3s
✓ Generating static pages (9/9) in 537ms
Route (app)
┌ ○ /
├ ○ /activity
├ ○ /coverletter
├ ○ /interview
├ ○ /jobs
└ ○ /resume
```

---

## 4. How to Run Phase 3

### 1. Start the FastAPI Backend
```powershell
.\.venv\Scripts\uvicorn backend.main:app --reload --port 8000
```
- Open Swagger documentation at: `http://127.0.0.1:8000/docs`
- Test the `/api/jobs/matches` and `/api/jobs/select` endpoints.

### 2. Start the Next.js Frontend
```powershell
npm --prefix frontend run dev
```
- Open `http://localhost:3000/jobs` to discover semantically ranked job matches, inspect the AI fit reasoning, and select target roles.
