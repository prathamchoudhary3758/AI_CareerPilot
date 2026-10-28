"use client";

import { useEffect, useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, FileText, ArrowRight } from "lucide-react";
import { fetchSampleAnalysis, ResumeAnalysisResult } from "@/lib/api";

export default function ResumePage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("Alex_Morgan_Resume.pdf");

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const data = await fetchSampleAnalysis();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        loadAnalysis();
      }, 1200);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300 mb-2">
            <span>Phase 2 Agent Shell</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Resume Ingestion & RAG Scoring</h1>
          <p className="text-sm text-slate-400">Extracts candidate profiles, performs ATS scoring against target JDs, and generates impact rewrites.</p>
        </div>

        <button
          onClick={loadAnalysis}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/[0.08] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upload Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Resume Upload (PDF / DOCX)</span>
            </h2>
            
            <label className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/40 group">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleSimulatedUpload}
              />
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-sm font-medium text-slate-200 mb-1">
                {uploading ? "Analyzing resume with PyMuPDF..." : "Drop resume here or browse"}
              </p>
              <p className="text-xs text-slate-500">PDF, DOCX, or TXT up to 10MB</p>
            </label>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Active File:</span>
              <span className="font-mono text-cyan-300 truncate max-w-[180px]">{selectedFileName}</span>
            </div>
          </div>

          {/* Quick Target JD Context */}
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
            <h3 className="text-sm font-semibold text-white">Target Role Context</h3>
            <p className="text-xs text-slate-400">Analysis is scored against your active target job:</p>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <p className="font-medium text-slate-200">Senior AI Application Engineer</p>
              <p className="text-slate-400">Anthropic Ecosystem Partner • Remote</p>
            </div>
          </div>
        </div>

        {/* Right: Scores & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="glass-panel p-12 rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading candidate profile & ATS rubric breakdown...</p>
            </div>
          ) : analysis ? (
            <>
              {/* Overall Score Banner */}
              <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-indigo-950/20 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-3xl font-extrabold text-cyan-400">{analysis.score_breakdown.overall_score}%</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Overall Match</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-200">{analysis.score_breakdown.skills_match}%</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Skills Match</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-200">{analysis.score_breakdown.experience_relevance}%</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Relevance</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-200">{analysis.score_breakdown.ats_readability}%</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">ATS Parsability</p>
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <p className="text-2xl font-bold text-slate-200">{analysis.score_breakdown.action_verbs_metric}%</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Impact Verbs</p>
                </div>
              </div>

              {/* Strengths & Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Identified Key Strengths</span>
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
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Impact Bullet Rewrites */}
              <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>AI Bullet Rewrite Suggestions</span>
                  </h3>
                  <span className="text-xs text-slate-400">STAR + Metric Enhancement</span>
                </div>

                {analysis.bullet_suggestions.map((sug, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Original Bullet</p>
                      <p className="text-xs text-slate-400 line-through">{sug.original_bullet}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <span>Optimized Bullet</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-300">Quantified Impact</span>
                      </p>
                      <p className="text-xs text-slate-100 font-medium">{sug.improved_bullet}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">Rationale: {sug.reason}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
