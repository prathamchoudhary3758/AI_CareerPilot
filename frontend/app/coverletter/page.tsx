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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 mb-2">
            <span>Cover Letter Writer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Tailored Cover Letter
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate role-specific application letters matching your verified background and experience.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Tone & Format</h2>
            <div className="space-y-2">
              {[
                { id: "professional", label: "Professional", desc: "Balanced and formal, emphasizing outcomes and metrics." },
                { id: "enthusiastic", label: "Engaged", desc: "Expresses strong interest in company mission and tech stack." },
                { id: "concise", label: "Concise", desc: "Short, bullet-oriented structure for quick reading." }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    tone === t.id
                      ? "bg-blue-50/70 border-blue-300 text-blue-900 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{t.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting Letter...</span>
                </>
              ) : (
                <>
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Generate Letter</span>
                </>
              )}
            </button>
          </div>

          {/* Guardrail Status Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Fact-Checking Standard</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every factual assertion and technical skill mentioned in the letter is checked against your resume before finalizing.
            </p>
            <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
              ✓ Ground-truth cross-check enabled
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Application Letter Draft</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {result ? `${result.word_count} words • Tone: ${result.tone}` : "Click Generate to create a tailored draft"}
              </p>
            </div>

            {content && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-300 transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => alert("Letter ready to export")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-300 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Click 'Generate Letter' on the left to create a draft tailored to your target position."
            className="flex-1 w-full min-h-[400px] p-4 rounded-lg bg-slate-50/50 border border-slate-200 text-slate-900 font-sans text-sm leading-relaxed focus:outline-none focus:bg-white focus:border-slate-400 transition-colors resize-y"
          />
        </div>
      </div>
    </div>
  );
}
