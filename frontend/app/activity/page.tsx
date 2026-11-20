"use client";

import { useEffect, useState } from "react";
import { Radio, Play, Terminal, Trash2 } from "lucide-react";
import { subscribeToAgentEvents, AgentEvent } from "@/lib/api";

export default function ActivityPage() {
  const [events, setEvents] = useState<AgentEvent[]>([
    {
      timestamp: "2026-10-28T12:00:00Z",
      session_id: "default-session",
      event_type: "system_init",
      message: "Agent Orchestration Pipeline initialized. Ready for execution.",
      data: { orchestrator: "LangGraph", nodes_registered: 4 },
    },
  ]);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToAgentEvents("default-session", (event) => {
      setEvents((prev) => [event, ...prev]);
      setConnected(true);
    });

    return () => unsubscribe();
  }, []);

  const simulateStep = async (type: string, message: string) => {
    try {
      await fetch("http://127.0.0.1:8000/api/stream/test-event/default-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: type,
          message,
          data: { triggered_by: "Demo Action", time: new Date().toLocaleTimeString() },
        }),
      });
    } catch {
      // In case backend endpoint is called when offline, append locally
      setEvents((prev) => [
        {
          timestamp: new Date().toISOString(),
          session_id: "default-session",
          event_type: type,
          message,
        },
        ...prev,
      ]);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "resume_analyzer":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "job_matcher":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "guardrail_check":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "interview_coach":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 mb-2">
            <span>System Observability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pipeline Activity & Event Log
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time trace of parsing operations, embedding index updates, and evaluation steps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-xs font-medium">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`}></span>
            <span>Stream: {connected ? "Connected" : "Listening..."}</span>
          </div>
          <button
            onClick={() => setEvents([])}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors shadow-xs"
            title="Clear Feed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Quick Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mr-2">
          <Play className="w-3.5 h-3.5 text-slate-400" />
          <span>Test Event:</span>
        </span>
        <button
          onClick={() => simulateStep("resume_analyzer", "Resume parsed: 14 technical skills extracted from document stream.")}
          className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
        >
          Resume Parser
        </button>
        <button
          onClick={() => simulateStep("job_matcher", "Semantic match: Generated 94% fit score for Senior AI Engineer.")}
          className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
        >
          Job Matcher
        </button>
        <button
          onClick={() => simulateStep("guardrail_check", "Guardrail verification: All factual metrics cross-checked against resume history.")}
          className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
        >
          Guardrail Check
        </button>
        <button
          onClick={() => simulateStep("interview_coach", "STAR rubric generated: 87/100 readiness score with feedback tips.")}
          className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
        >
          Interview Coach
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-medium text-slate-700 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Event History ({events.length} records)</span>
          </span>
          <span className="text-[11px] text-slate-500">SSE Feed Active</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
          {events.map((evt, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
              <div className="pt-0.5 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getEventBadge(evt.event_type)}`}>
                  {evt.event_type}
                </span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs text-slate-800 font-medium leading-relaxed">{evt.message}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  <span>Session: {evt.session_id}</span>
                </div>

                {evt.data && Object.keys(evt.data).length > 0 && (
                  <pre className="mt-2 p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono overflow-x-auto">
                    {JSON.stringify(evt.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
