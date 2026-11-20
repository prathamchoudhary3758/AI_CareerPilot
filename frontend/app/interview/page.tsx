"use client";

import { useEffect, useState } from "react";
import { Send, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 mb-2">
            <span>Interview Practice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Interview Question Practice & Evaluation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Rehearse behavioral and technical questions, evaluated against the STAR framework (Situation, Task, Action, Result).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Questions selector */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Practice Question Bank</h2>
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveQuestionIndex(idx);
                    setEvaluation(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    activeQuestionIndex === idx
                      ? "bg-blue-50/70 border-blue-300 text-blue-900 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">Question {idx + 1}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{q.category}</span>
                  </div>
                  <p className="line-clamp-2 text-slate-600">{q.question}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interaction Box & Evaluation */}
        <div className="lg:col-span-2 space-y-5">
          {currentQ && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Competency: {currentQ.expected_competency}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  {currentQ.category}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{currentQ.question}</h2>

              {/* STAR guidance hint */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Recommended STAR Structure:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {currentQ.sample_star_points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Answer Input */}
              <div className="space-y-3 pt-1">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your response here. Focus on the situation, the action you personally took, and the measured result..."
                  className="w-full min-h-[140px] p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 text-slate-900 text-sm leading-relaxed focus:outline-none focus:bg-white focus:border-slate-400 transition-colors resize-y"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Tip: Highlight specific percentages, savings, or deliverable dates.
                  </span>
                  <button
                    onClick={handleEvaluate}
                    disabled={evaluating || !answer.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs disabled:opacity-50 transition-colors"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Evaluate Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Result Card */}
          {evaluation && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">STAR Rubric Feedback</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Automated assessment of your answer structure</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{evaluation.score} / 100</p>
                  <p className="text-[10px] uppercase font-medium text-slate-500">Readiness</p>
                </div>
              </div>

              {/* STAR Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(evaluation.star_breakdown).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700">{key}</span>
                    <p className="text-xs text-slate-600">{val}</p>
                  </div>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Effective Points</span>
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Opportunities to Improve</span>
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1">
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
