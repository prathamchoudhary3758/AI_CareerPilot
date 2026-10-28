"use client";

import { useEffect, useState } from "react";
import { Mic, Send, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { fetchInterviewQuestions, evaluateInterviewAnswer, InterviewQuestion, InterviewEvaluation } from "@/lib/api";

export default function InterviewPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const qs = await fetchInterviewQuestions();
      setQuestions(qs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluate = async () => {
    if (!answer.trim() || questions.length === 0) return;
    setEvaluating(true);
    try {
      const res = await evaluateInterviewAnswer(questions[activeQuestionIndex].id, answer);
      setEvaluation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = questions[activeQuestionIndex];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-300 mb-2">
            <span>Phase 4 Agent Shell</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mock Interview Prep Agent</h1>
          <p className="text-sm text-slate-400">Interactive STAR-method simulation evaluating structure, impact metrics, and clarity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Questions selector */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
            <h2 className="text-sm font-semibold text-white">Target Role Question Bank</h2>
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveQuestionIndex(idx);
                    setEvaluation(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    activeQuestionIndex === idx
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase text-cyan-400">Q{idx + 1} • {q.category}</span>
                    <span className="text-[10px] text-slate-500">{q.expected_competency}</span>
                  </div>
                  <p className="line-clamp-2 text-slate-300 font-medium">{q.question}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interaction Box & Evaluation */}
        <div className="lg:col-span-2 space-y-6">
          {currentQ && (
            <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-wider text-cyan-400">Active Prompt</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-400 border border-slate-700">
                  Competency: {currentQ.expected_competency}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{currentQ.question}</h2>

              {/* STAR guidance hint */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recommended STAR Talking Points:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  {currentQ.sample_star_points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Answer Input */}
              <div className="space-y-3 pt-2">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your structured answer here (or paste your verbal notes)..."
                  className="w-full min-h-[140px] p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 text-sm leading-relaxed focus:outline-none focus:border-cyan-500/50 resize-y"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Pro-tip: Include specific numbers, percentages, or measurable outcomes.
                  </span>
                  <button
                    onClick={handleEvaluate}
                    disabled={evaluating || !answer.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating Response...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for Rubric Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Result Card */}
          {evaluation && (
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/80 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-base font-bold text-white">STAR Rubric Evaluation</h3>
                  <p className="text-xs text-slate-400">Automated feedback from the Interview Prep Agent</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-cyan-400">{evaluation.score}/100</p>
                  <p className="text-[10px] uppercase font-mono text-slate-500">Readiness Score</p>
                </div>
              </div>

              {/* STAR Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(evaluation.star_breakdown).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{key}</span>
                    <p className="text-xs text-slate-300">{val}</p>
                  </div>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Strong Aspects</span>
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Coach Recommendations</span>
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {evaluation.areas_for_improvement.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
