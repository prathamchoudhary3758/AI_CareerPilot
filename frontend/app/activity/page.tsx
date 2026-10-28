"use client";

import { useEffect, useState } from "react";
import { Bot, Radio, Zap, Shield, Play, Terminal, Trash2 } from "lucide-react";
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
          data: { triggered_by: "UI Demo Action", time: new Date().toLocaleTimeString() },
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 mb-2">
            <span>Phase 5 Live Observability</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Live Agent Activity Feed (SSE)</h1>
          <p className="text-sm text-slate-400">Real-time trace of LangGraph node executions, tool invocations, and guardrail validations.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SSE Stream: {connected ? "Connected" : "Listening..."}</span>
          </div>
          <button
            onClick={() => setEvents([])}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-white/[0.06] transition-colors"
            title="Clear Feed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Quick Action Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mr-2">
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          <span>Simulate Agent Event:</span>
        </span>
        <button
          onClick={() => simulateStep("resume_analyzer", "Resume parsed: 14 technical skills extracted from PyMuPDF text stream.")}
          className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
        >
          Resume Node
        </button>
        <button
          onClick={() => simulateStep("job_matcher", "Semantic match: Generated 94% fit score for Senior AI Engineer.")}
          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
        >
          Job Match Node
        </button>
        <button
          onClick={() => simulateStep("guardrail_check", "Guardrail verification: All factual metrics cross-checked against resume history.")}
          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
        >
          Guardrail Pass
        </button>
        <button
          onClick={() => simulateStep("interview_coach", "STAR rubric generated: 87/100 readiness score with feedback tips.")}
          className="px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-medium transition-colors"
        >
          Interview Coach
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-slate-900/60">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Telemetry Trace ({events.length} events recorded)</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400">SSE Protocol Active</span>
        </div>

        <div className="divide-y divide-white/[0.04] p-2 max-h-[560px] overflow-y-auto">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-slate-900/40 rounded-xl transition-colors space-y-2 font-mono"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                    {evt.event_type}
                  </span>
                  <span className="text-slate-200 text-xs font-sans font-medium">{evt.message}</span>
                </div>
                <span suppressHydrationWarning className="text-[10px] text-slate-500 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {evt.data && (
                <pre className="text-[11px] p-2.5 rounded-lg bg-black/40 text-slate-400 overflow-x-auto border border-white/[0.03]">
                  {JSON.stringify(evt.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
