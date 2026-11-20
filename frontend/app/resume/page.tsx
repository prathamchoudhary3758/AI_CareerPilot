"use client";

import { useEffect, useState, useRef } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import {
  fetchSampleAnalysis,
  uploadResume,
  analyzeResumeText,
  ResumeAnalysisResult
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
    setStatusMessage("Loading sample analysis...");
    try {
      const data = await fetchSampleAnalysis();
      setAnalysis(data);
      setStatusMessage("");
    } catch (err) {
      console.error("Failed to load initial analysis:", err);
      setStatusMessage("Failed to reach backend. Make sure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setUploading(true);
      setStatusMessage("Parsing document and auditing ATS compatibility...");

      try {
        const activeJob = PRESET_JOBS[selectedJobIndex];
        const result = await uploadResume(
          file,
          "default-session",
          activeJob.title,
          activeJob.description
        );
        setAnalysis(result);
        setStatusMessage("Analysis complete.");
        setTimeout(() => setStatusMessage(""), 2500);
      } catch (err: unknown) {
        console.error("Upload failed:", err);
        const msg = err instanceof Error ? err.message : "Upload and parsing failed.";
        setStatusMessage(msg);
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

  const getSkillCategoryBadge = (category: string) => {
    switch (category) {
      case "domain":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "tool":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "soft":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 mb-2">
            <span>Resume Review & ATS Compatibility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Resume Audit & Improvement Feedback
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Check formatting compliance, identify missing role requirements, and review suggested bullet point improvements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInitialAnalysis}
            disabled={loading || uploading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-300 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Analysis</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2 font-medium">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & Target Role Context */}
        <div className="space-y-6">
          {/* Resume Upload Dropzone */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-slate-600" />
                <span>Upload Document</span>
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                PDF or Word
              </span>
            </div>

            <label className="relative border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100/60 group">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2.5 shadow-xs">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs font-medium text-slate-800 mb-0.5">
                {uploading ? "Extracting and analyzing..." : "Click to upload or drag & drop"}
              </p>
              <p className="text-[11px] text-slate-500">PDF, DOCX, or TXT up to 10MB</p>
            </label>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Active file:</span>
              <span className="font-medium text-slate-800 truncate max-w-[180px]">{selectedFileName}</span>
            </div>
          </div>

          {/* Target Role Selector */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-600" />
                <span>Target Role Benchmark</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select a position to calculate requirement match and skill gaps:
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {PRESET_JOBS.map((job, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJobChange(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs space-y-0.5 ${
                    selectedJobIndex === idx
                      ? "bg-blue-50/70 border-blue-300 text-blue-900 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{job.title}</span>
                    {selectedJobIndex === idx && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{job.company}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ATS Rubric Guidelines */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Evaluation Criteria
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-medium text-slate-800">Quantified Outcomes (XYZ Formula)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Accomplished [X] as measured by [Y], by doing [Z].</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-medium text-slate-800">Clear Action Verbs</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Prefers precise verbs over passive phrases like 'worked on'.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-medium text-slate-800">Clean Formatting</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Standard headers and linear single-column structure for reliable parsing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Results or Extracted Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "analysis"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Score Breakdown
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Extracted Data ({analysis?.profile.skills.length || 0} skills)
              </button>
            </div>

            {analysis && (
              <span className="text-xs text-slate-500">
                Candidate: <strong className="text-slate-800 font-semibold">{analysis.profile.full_name}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
              <p className="text-sm font-medium text-slate-700">Evaluating resume against benchmarks...</p>
              <p className="text-xs text-slate-400">Auditing keywords, impact phrasing, and formatting readability</p>
            </div>
          ) : analysis ? (
            activeTab === "analysis" ? (
              <>
                {/* Overall Score Summary */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center divide-x divide-slate-100">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-slate-900">
                        {analysis.score_breakdown.overall_score}%
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Overall Match</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-semibold text-slate-800">
                        {analysis.score_breakdown.skills_match}%
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Skills</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-semibold text-slate-800">
                        {analysis.score_breakdown.experience_relevance}%
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Relevance</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-semibold text-slate-800">
                        {analysis.score_breakdown.ats_readability}%
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Parsability</p>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <p className="text-2xl font-semibold text-slate-800">
                        {analysis.score_breakdown.action_verbs_metric}%
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Impact Verbs</p>
                    </div>
                  </div>
                </div>

                {/* Strengths & Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Key Strengths</span>
                    </h3>
                    <ul className="space-y-2">
                      {analysis.key_strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Missing Target Skills</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Skills in the job posting not detected on your resume:</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysis.missing_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bullet Suggestions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Suggested Bullet Point Revisions
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Examples of how to rewrite your bullets to include concrete numbers and stronger action verbs.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {analysis.bullet_suggestions.map((sug, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Original Bullet
                          </p>
                          <p className="text-xs text-slate-500 line-through pl-1">{sug.original_bullet}</p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                              <span>Recommended Revision</span>
                            </p>
                            <button
                              onClick={() => copyToClipboard(sug.improved_bullet, idx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-[11px] font-medium text-slate-700 border border-slate-300 transition-colors shadow-xs"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-500" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-900 font-medium pl-1 bg-white p-2.5 rounded border border-emerald-200/80">
                            {sug.improved_bullet}
                          </p>
                        </div>

                        <p className="text-[11px] text-slate-500 pl-1">
                          <span className="font-semibold text-slate-700">Why this works:</span> {sug.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ATS Formatting Checklist */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Formatting & Structure Checklist</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                    {analysis.ats_feedback.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
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
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{analysis.profile.full_name}</h2>
                      <p className="text-xs text-slate-500">{analysis.profile.headline || "Engineering Professional"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {analysis.profile.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{analysis.profile.email}</span>
                        </span>
                      )}
                      {analysis.profile.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{analysis.profile.phone}</span>
                        </span>
                      )}
                      {analysis.profile.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{analysis.profile.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {analysis.profile.summary && (
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Summary</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{analysis.profile.summary}</p>
                    </div>
                  )}
                </div>

                {/* Categorized Skills */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Detected Skills ({analysis.profile.skills.length})
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysis.profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 text-xs rounded-md border font-medium flex items-center gap-1.5 ${getSkillCategoryBadge(
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

                {/* Experience */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Work History ({analysis.profile.experience.length})
                  </h3>

                  <div className="space-y-4">
                    {analysis.profile.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="font-semibold text-slate-900 text-sm">{exp.title}</p>
                          <span className="text-xs text-slate-500 font-mono">
                            {exp.start_date || "2022"} — {exp.end_date || "Present"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{exp.company} • {exp.location || "United States"}</p>
                        
                        <ul className="space-y-1.5 pt-2">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="text-slate-400 mt-0.5">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                {analysis.profile.education.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-600" />
                      <span>Education</span>
                    </h3>
                    <div className="space-y-2">
                      {analysis.profile.education.map((edu, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-slate-800">{edu.degree}</p>
                            <p className="text-slate-500">{edu.institution} {edu.field_of_study ? `• ${edu.field_of_study}` : ""}</p>
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
