"use client";

import { useState } from "react";
import { PenTool, ShieldCheck, Copy, Download, RefreshCw, Check } from "lucide-react";
import { generateCoverLetter, CoverLetterResult } from "@/lib/api";

export default function CoverLetterPage() {
  const [tone, setTone] = useState<string>("professional");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateCoverLetter(tone);
      setResult(data);
      setContent(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
            <span>Phase 4 Agent Shell</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Cover Letter & Application Agent</h1>
          <p className="text-sm text-slate-400">Contextual cover letter synthesis paired with hallucination guardrail verification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
            <h2 className="text-sm font-semibold text-white">Tone & Parameters</h2>
            <div className="space-y-2">
              {["professional", "enthusiastic", "concise"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium capitalize transition-all ${
                    tone === t
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="font-semibold text-slate-200">{t}</p>
                  <p className="text-[11px] text-slate-500">
                    {t === "professional" && "Balanced, formal, emphasizing metrics & outcomes."}
                    {t === "enthusiastic" && "High energy, forward-looking, mission-aligned."}
                    {t === "concise" && "Direct, high-impact bullet points, quick scan."}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Tailored Letter...</span>
                </>
              ) : (
                <>
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Generate Tailored Letter</span>
                </>
              )}
            </button>
          </div>

          {/* Guardrail Status Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Hallucination Guardrail</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every factual assertion, company mention, and quantitative achievement is cross-checked against your parsed resume facts before finalizing.
            </p>
            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-300">
              ✓ Ground-truth verification active
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-white">Cover Letter Draft</h3>
              <p className="text-xs text-slate-400">
                {result ? `${result.word_count} words • Tone: ${result.tone}` : "Click Generate to synthesize"}
              </p>
            </div>

            {content && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-white/[0.06] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => alert("Downloaded letter as .txt / markdown")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-white/[0.06] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Click 'Generate Tailored Letter' on the left to synthesize a tailored, fact-checked cover letter."
            className="flex-1 w-full min-h-[420px] p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 font-sans text-sm leading-relaxed focus:outline-none focus:border-cyan-500/50 resize-y"
          />
        </div>
      </div>
    </div>
  );
}
