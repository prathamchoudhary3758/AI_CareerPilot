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
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-500 font-medium">
        <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <button
        onClick={checkStatus}
        title={`Error: ${error}. Click to retry.`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-700 hover:bg-rose-100 transition-colors font-medium"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block"></span>
        <AlertCircle className="w-3 h-3 text-rose-600" />
        <span>Offline (Retry)</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      <span>API Online (v{health?.version || "1.0"})</span>
    </div>
  );
}
