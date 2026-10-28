const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  timestamp: string;
}

export interface CandidateProfile {
  full_name: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills: Array<{ name: string; category: string; years_experience?: number }>;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study?: string;
    graduation_year?: string;
  }>;
}

export interface ResumeAnalysisResult {
  profile: CandidateProfile;
  score_breakdown: {
    overall_score: number;
    skills_match: number;
    experience_relevance: number;
    ats_readability: number;
    action_verbs_metric: number;
  };
  key_strengths: string[];
  missing_skills: string[];
  bullet_suggestions: Array<{
    original_bullet: string;
    improved_bullet: string;
    reason: string;
    impact_metric_added: boolean;
  }>;
  ats_feedback: string[];
}

export interface JobMatchResult {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary_range?: string;
    employment_type?: string;
    posted_date?: string;
    apply_url?: string;
  };
  match_percentage: number;
  reasoning: {
    fit_summary: string;
    matched_skills: string[];
    missing_critical_skills: string[];
    potential_challenges: string[];
    tailoring_tips: string[];
  };
}

export interface CoverLetterResult {
  content: string;
  tone: string;
  word_count: number;
  matched_qualifications: string[];
  guardrail_check_passed: boolean;
  flagged_inconsistencies: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  expected_competency: string;
  sample_star_points: string[];
}

export interface InterviewEvaluation {
  question_id: string;
  user_answer: string;
  score: number;
  star_breakdown: Record<string, string>;
  strengths: string[];
  areas_for_improvement: string[];
  ideal_response_excerpt: string;
  suggested_follow_up?: string;
}

export interface AgentEvent {
  timestamp: string;
  session_id: string;
  event_type: string;
  message: string;
  data?: Record<string, unknown>;
}

// API methods
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed with status: ${res.status}`);
  return res.json();
}

export async function fetchSampleAnalysis(): Promise<ResumeAnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/resume/sample-analysis`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch sample analysis: ${res.status}`);
  return res.json();
}

export async function fetchJobMatches(): Promise<JobMatchResult[]> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/matches`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch job matches: ${res.status}`);
  return res.json();
}

export async function generateCoverLetter(tone: string = "professional"): Promise<CoverLetterResult> {
  const res = await fetch(`${API_BASE_URL}/api/coverletter/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: "default-session", tone }),
  });
  if (!res.ok) throw new Error(`Failed to generate cover letter: ${res.status}`);
  return res.json();
}

export async function fetchInterviewQuestions(): Promise<InterviewQuestion[]> {
  const res = await fetch(`${API_BASE_URL}/api/interview/questions`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch interview questions: ${res.status}`);
  return res.json();
}

export async function evaluateInterviewAnswer(questionId: string, answer: string): Promise<InterviewEvaluation> {
  const res = await fetch(`${API_BASE_URL}/api/interview/evaluate-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: questionId, user_answer: answer }),
  });
  if (!res.ok) throw new Error(`Failed to evaluate answer: ${res.status}`);
  return res.json();
}

export function subscribeToAgentEvents(sessionId: string, onEvent: (event: AgentEvent) => void): () => void {
  const eventSource = new EventSource(`${API_BASE_URL}/api/stream/agent-events/${sessionId}`);
  
  eventSource.onmessage = (e) => {
    try {
      const data: AgentEvent = JSON.parse(e.data);
      onEvent(data);
    } catch (err) {
      console.error("Failed to parse SSE event:", err);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE connection error:", err);
  };

  return () => {
    eventSource.close();
  };
}
