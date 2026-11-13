"use client";

import { useEffect, useState, useRef } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Settings
} from "lucide-react";
import {
  fetchSampleAnalysis,
  uploadResume,
  analyzeResumeText,
  ResumeAnalysisResult,
  CandidateProfile
} from "@/lib/api";

const PRESET_JOBS = [
  {
    title: "Senior AI Application Engineer",
    company: "Anthropic Ecosystem Partner",
    description: "Design and implement production-grade multi-agent LLM systems, scalable async APIs using FastAPI/Python, and responsive modern UIs using Next.js/TypeScript. Leverage RAG architectures and vector databases.",
    requirements: ["Python", "FastAPI", "Next.js", "TypeScript", "LangChain or LangGraph", "RAG Architecture", "Docker & Kubernetes", "Microservices Architecture"]
  },
  {
    title: "Full-Stack Software Engineer",
    company: "CloudScale Systems",
    description: "Build robust cloud-native web applications, distributed APIs, and performant user interfaces using TypeScript, React/Next.js, Python, and PostgreSQL.",
    requirements: ["TypeScript", "React", "Next.js", "Python", "PostgreSQL", "REST APIs", "Docker", "CI/CD Pipelines"]
  },
  {
    title: "DevOps & Cloud Engineer",
    company: "Enterprise Cloud Ops",
    description: "Manage scalable cloud infrastructure on AWS/GCP, orchestrate containerized workloads with Kubernetes, and maintain high-throughput CI/CD pipelines.",
    requirements: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD Pipelines", "Linux", "Git", "Python"]
  }
];

export default function ResumePage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("Alex_Morgan_Resume.pdf");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedJobIndex, setSelectedJobIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"analysis" | "profile">("analysis");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadInitialAnalysis();
  }, []);

  const loadInitialAnalysis = async () => {
    setLoading(true);
    setStatusMessage("Fetching ATS analysis...");
    try {
      const data = await fetchSampleAnalysis();
      setAnalysis(data);
      setStatusMessage("");
    } catch (err) {
      console.error("Failed to load initial analysis:", err);
      setStatusMessage("Failed to reach backend. Check if FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setUploading(true);
      setStatusMessage("Extracting layout & text with PyMuPDF...");

      try {
        const activeJob = PRESET_JOBS[selectedJobIndex];
        const result = await uploadResume(
          file,
          "default-session",
          activeJob.title,
          activeJob.description
        );
        setAnalysis(result);
        setStatusMessage("Analysis complete!");
        setTimeout(() => setStatusMessage(""), 2500);
      } catch (err: any) {
        console.error("Upload failed:", err);
        setStatusMessage(err.message || "Upload and parsing failed.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleJobChange = async (index: number) => {
    setSelectedJobIndex(index);
    if (!analysis) return;

    setLoading(true);
    setStatusMessage(`Re-scoring resume against '${PRESET_JOBS[index].title}'...`);
    try {
      const job = PRESET_JOBS[index];
      const result = await analyzeResumeText({
        sessionId: "default-session",
        targetJobTitle: job.title,
        targetJobDescription: job.description,
        targetRequirements: job.requirements,
        rawResumeText: analysis.profile.raw_text || undefined
      });
      setAnalysis(result);
      setStatusMessage("");
    } catch (err) {
      console.error("Re-scoring failed:", err);
      setStatusMessage("Re-scoring failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 65) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const getSkillCategoryBadge = (category: string) => {
    switch (category) {
      case "domain":
        return "bg-purple-500/15 border-purple-500/30 text-purple-300";
      case "tool":
        return "bg-amber-500/15 border-amber-500/30 text-amber-300";
      case "soft":
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
      default:
        return "bg-cyan-500/15 border-cyan-500/30 text-cyan-300";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Phase 2: Ingestion, Extraction & RAG Scoring</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Resume Ingestion & RAG Scoring Engine</h1>
          <p className="text-sm text-slate-400 mt-1">
            Extracts candidate profiles with PyMuPDF, scores layout & skill compatibility via ATS RAG rules, and rewrites bullets with quantified impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInitialAnalysis}
            disabled={loading || uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-white/[0.08] transition-all hover:border-cyan-500/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Reload Analysis</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Target Role Context */}
        <div className="space-y-6">
          {/* Resume Upload Dropzone */}
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Resume Upload</span>
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">PyMuPDF</span>
            </div>

            <label
              className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/60 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className={`w-6 h-6 text-cyan-400 ${uploading ? "animate-pulse" : ""}`} />
              </div>
              <p className="text-sm font-medium text-slate-200 mb-1">
                {uploading ? "Extracting & Scoring with RAG..." : "Drop resume here or browse"}
              </p>
              <p className="text-xs text-slate-500">Supports PDF, DOCX, or TXT up to 10MB</p>
            </label>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span>Active File:</span>
              <span className="font-mono text-cyan-300 truncate max-w-[180px]">{selectedFileName}</span>
            </div>
          </div>

          {/* Target Role Selector */}
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Target Role Benchmark</span>
              </h3>
              <span className="text-[10px] text-slate-400">RAG Context</span>
            </div>
            <p className="text-xs text-slate-400">
              Select a target role to benchmark candidate skills, experience relevance, and keyword density:
            </p>

            <div className="space-y-2">
              {PRESET_JOBS.map((job, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJobChange(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-1 ${
                    selectedJobIndex === idx
                      ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-200 shadow-sm shadow-cyan-950"
                      : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{job.title}</span>
                    {selectedJobIndex === idx && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{job.company}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ATS Optimization Rules Seeded from RAG */}
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Active ATS Rubric Guidelines</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <p className="font-medium text-slate-200">Google XYZ Impact Metric</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Accomplished [X] as measured by [Y], by doing [Z].</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <p className="font-medium text-slate-200">Strong Technical Action Verbs</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Penalizes passive verbs like 'worked on' or 'helped with'.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <p className="font-medium text-slate-200">Single-Column Parsability</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ensures no tables or complex columns break parser ingestion.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Results or Extracted Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "analysis"
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ATS Match & Scoring
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Extracted Profile ({analysis?.profile.skills.length || 0} skills)
              </button>
            </div>

            {analysis && (
              <span className="text-xs text-slate-400">
                Candidate: <strong className="text-slate-200">{analysis.profile.full_name}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div className="glass-panel p-16 rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">Evaluating resume against ATS benchmarks...</p>
              <p className="text-xs text-slate-500">Retrieving RAG rules & computing sub-score vectors</p>
            </div>
          ) : analysis ? (
            activeTab === "analysis" ? (
              <>
                {/* Overall Score Banner */}
                <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-slate-900/70 to-indigo-950/30 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-4xl font-extrabold text-cyan-400">
                      {analysis.score_breakdown.overall_score}%
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Overall Match</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-200">
                      {analysis.score_breakdown.skills_match}%
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Skills Coverage</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-200">
                      {analysis.score_breakdown.experience_relevance}%
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Relevance</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-200">
                      {analysis.score_breakdown.ats_readability}%
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">ATS Parsability</p>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <p className="text-2xl font-bold text-slate-200">
                      {analysis.score_breakdown.action_verbs_metric}%
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Impact Verbs</p>
                  </div>
                </div>

                {/* Strengths & Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3">
                    <h3 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Identified Strengths</span>
                    </h3>
                    <ul className="space-y-2">
                      {analysis.key_strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3">
                    <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Skill Gaps for Target Role</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Technologies found in JD but missing in resume:</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysis.missing_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Bullet Rewrite Suggestions */}
                <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>AI Bullet Rewrite Suggestions</span>
                      </h3>
                      <p className="text-xs text-slate-400">Rewritten using Google XYZ formula & strong action verbs</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      STAR + Metrics
                    </span>
                  </div>

                  <div className="space-y-3">
                    {analysis.bullet_suggestions.map((sug, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <span>Original Weak Bullet</span>
                          </p>
                          <p className="text-xs text-slate-400 line-through pl-1">{sug.original_bullet}</p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <span>Optimized High-Impact Bullet</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-300">
                                Quantified Metric
                              </span>
                            </p>
                            <button
                              onClick={() => copyToClipboard(sug.improved_bullet, idx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-100 font-medium pl-1 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
                            {sug.improved_bullet}
                          </p>
                        </div>

                        <p className="text-[11px] text-slate-400 italic pl-1">
                          💡 <span className="font-semibold text-slate-300">Rationale:</span> {sug.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ATS Readability Feedback */}
                <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>ATS Parsability & Formatting Feedback</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                    {analysis.ats_feedback.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Profile Tab */
              <div className="space-y-6">
                {/* Header Profile Card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{analysis.profile.full_name}</h2>
                      <p className="text-sm text-cyan-300">{analysis.profile.headline || "Engineering Professional"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {analysis.profile.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{analysis.profile.email}</span>
                        </span>
                      )}
                      {analysis.profile.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{analysis.profile.phone}</span>
                        </span>
                      )}
                      {analysis.profile.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{analysis.profile.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {analysis.profile.summary && (
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Executive Summary</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{analysis.profile.summary}</p>
                    </div>
                  )}
                </div>

                {/* Categorized Skills Section */}
                <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>Extracted Skills Taxonomy ({analysis.profile.skills.length})</span>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">Technical</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">Domain</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">Tool</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Soft</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {analysis.profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 text-xs rounded-xl border font-medium flex items-center gap-1.5 ${getSkillCategoryBadge(
                          skill.category
                        )}`}
                      >
                        <span>{skill.name}</span>
                        {skill.years_experience && (
                          <span className="text-[10px] opacity-75">{skill.years_experience}y</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Work Experience Section */}
                <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>Work Experience ({analysis.profile.experience.length})</span>
                  </h3>

                  <div className="space-y-4">
                    {analysis.profile.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="font-semibold text-slate-100 text-sm">{exp.title}</p>
                          <span className="text-xs text-cyan-400 font-mono">
                            {exp.start_date || "2022"} — {exp.end_date || "Present"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{exp.company} • {exp.location || "United States"}</p>
                        
                        <ul className="space-y-1.5 pt-2">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Section */}
                {analysis.profile.education.length > 0 && (
                  <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <span>Education</span>
                    </h3>
                    <div className="space-y-2">
                      {analysis.profile.education.map((edu, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-slate-200">{edu.degree}</p>
                            <p className="text-slate-400">{edu.institution} {edu.field_of_study ? `• ${edu.field_of_study}` : ""}</p>
                          </div>
                          {edu.graduation_year && (
                            <span className="text-xs text-slate-400 font-mono">{edu.graduation_year}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
