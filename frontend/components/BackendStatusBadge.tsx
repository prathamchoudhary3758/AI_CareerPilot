"use client";

import { useEffect, useState } from "react";
import { fetchHealth, HealthResponse } from "@/lib/api";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function BackendStatusBadge() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Backend unreachable");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health && !error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        <span>Connecting API...</span>
      </div>
    );
  }

  if (error) {
    return (
      <button
        onClick={checkStatus}
        title={`Error: ${error}. Click to retry.`}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 hover:bg-rose-900/50 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>Backend Offline (Retry)</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-700/40 text-xs text-emerald-300">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span>FastAPI v{health?.version} Live</span>
    </div>
  );
}
