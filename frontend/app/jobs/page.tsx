"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  Check,
  Target,
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react";
import { fetchJobMatches, selectTargetJob, fetchCandidateProfile, JobMatchResult, CandidateProfile } from "@/lib/api";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobMatchResult[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [minMatch, setMinMatch] = useState<number>(0);
  const [selectedJobId, setSelectedJobId] = useState<string | null>("job-101");
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({
    "job-101": true,
  });

  useEffect(() => {
    loadCandidateProfile();
    loadJobs();
  }, []);

  const loadCandidateProfile = async () => {
    try {
      const prof = await fetchCandidateProfile("default-session");
      setCandidate(prof);
    } catch {
      // If no profile uploaded yet, backend defaults to demo profile
    }
  };

  const loadJobs = async (filterQuery?: string, filterRemote?: boolean, filterMinMatch?: number) => {
    setLoading(true);
    try {
      const q = filterQuery !== undefined ? filterQuery : searchQuery;
      const r = filterRemote !== undefined ? filterRemote : remoteOnly;
      const m = filterMinMatch !== undefined ? filterMinMatch : minMatch;

      const data = await fetchJobMatches({
        sessionId: "default-session",
        query: q || undefined,
        remoteOnly: r,
        minMatch: m > 0 ? m : undefined,
      });
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleToggleRemote = () => {
    const nextRemote = !remoteOnly;
    setRemoteOnly(nextRemote);
    loadJobs(searchQuery, nextRemote, minMatch);
  };

  const handleMinMatchChange = (val: number) => {
    setMinMatch(val);
    loadJobs(searchQuery, remoteOnly, val);
  };

  const handleSelectJob = async (jobId: string, jobTitle: string) => {
    setSelectingId(jobId);
    try {
      await selectTargetJob(jobId, "default-session");
      setSelectedJobId(jobId);
      setNotification(`Target role set to '${jobTitle}'.`);
      setTimeout(() => setNotification(""), 3500);
    } catch (err) {
      console.error("Failed to set active job:", err);
    } finally {
      setSelectingId(null);
    }
  };

  const toggleExpand = (jobId: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const getMatchBadgeStyle = (pct: number) => {
    if (pct >= 85) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (pct >= 70) return "bg-blue-50 text-blue-800 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 mb-2">
            <span>Job Matching & Role Fit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Matched Roles & Skill Fit
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Compare open positions against your extracted profile. Review overlap, missing requirements, and application tips.
          </p>
        </div>

        <button
          onClick={() => loadJobs()}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-300 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Candidate Profile Context Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              Matching Profile: <span className="text-blue-600">{candidate?.full_name || "Alex Morgan"}</span>
            </p>
            <p className="text-slate-500">
              {candidate?.headline || "Senior Full-Stack & AI Systems Engineer"} •{" "}
              {candidate?.skills.length || 26} extracted skills indexed
            </p>
          </div>
        </div>

        <Link
          href="/resume"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          <span>Update Resume</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or technology (e.g. FastAPI, Next.js, Python, AWS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs"
          >
            Filter
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> Filters:
            </span>

            <button
              onClick={handleToggleRemote}
              className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                remoteOnly
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Remote Only
            </button>

            {[
              { label: "All Matches", val: 0 },
              { label: "80%+ Match", val: 80 },
              { label: "85%+ High Fit", val: 85 },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => handleMinMatchChange(f.val)}
                className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                  minMatch === f.val
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500">
            Showing <strong className="text-slate-800 font-semibold">{jobs.length}</strong> available roles
          </div>
        </div>
      </div>

      {/* Main Jobs Listing */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-xs">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-sm font-medium text-slate-700">Calculating profile alignment and ranking positions...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3 shadow-xs">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-base font-semibold text-slate-900">No matching jobs found</p>
          <p className="text-xs text-slate-500">Try broadening your search term or clearing filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setRemoteOnly(false);
              setMinMatch(0);
              loadJobs("", false, 0);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((item) => {
            const isTarget = selectedJobId === item.job.id;
            const isExpanded = !!expandedReasoning[item.job.id];

            return (
              <div
                key={item.job.id}
                className={`bg-white p-6 rounded-xl border transition-all space-y-4 shadow-xs ${
                  isTarget
                    ? "border-slate-400 ring-1 ring-slate-400"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Header Row: Title, Company, Badges, Action Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{item.job.title}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getMatchBadgeStyle(item.match_percentage)}`}>
                        {item.match_percentage}% Match
                      </span>
                      {isTarget && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 text-white">
                          <Target className="w-3 h-3" />
                          <span>Active Target</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-600">{item.job.company}</p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.job.location}</span>
                      </span>
                      {item.job.salary_range && (
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.job.salary_range}</span>
                        </span>
                      )}
                      {item.job.employment_type && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.job.employment_type}</span>
                        </span>
                      )}
                      {item.job.posted_date && (
                        <span className="text-slate-400">Posted {item.job.posted_date}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSelectJob(item.job.id, item.job.title)}
                      disabled={isTarget || selectingId === item.job.id}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isTarget
                          ? "bg-slate-100 text-slate-700 border border-slate-200 cursor-default"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                      }`}
                    >
                      {isTarget ? (
                        <>
                          <Check className="w-3 h-3 text-slate-700" />
                          <span>Selected</span>
                        </>
                      ) : selectingId === item.job.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Setting...</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-3 h-3" />
                          <span>Set Target</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/coverletter?jobId=${item.job.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors shadow-xs"
                    >
                      <span>Draft Letter</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      href={`/interview?jobId=${item.job.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors shadow-xs"
                    >
                      <span>Practice</span>
                    </Link>
                  </div>
                </div>

                {/* Job Description Excerpt */}
                <p className="text-xs text-slate-600 leading-relaxed">{item.job.description}</p>

                {/* Requirements Pills */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.job.requirements.map((req, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fit Analysis Accordion */}
                <div className="border border-slate-200 rounded-lg bg-slate-50/70 overflow-hidden">
                  <button
                    onClick={() => toggleExpand(item.job.id)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-800">
                      Match Breakdown & Application Advice
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-slate-200 space-y-3.5 text-xs">
                      {/* Summary callout */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                        {item.reasoning.fit_summary}
                      </div>

                      {/* Strengths vs Missing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Matched Profile Skills</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.reasoning.matched_skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Missing Requirements</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.reasoning.missing_critical_skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tailoring & Application Tips */}
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Application Strategy:
                        </p>
                        <ul className="space-y-1 text-slate-600">
                          {item.reasoning.tailoring_tips.map((tip, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1.5">
                              <span className="text-slate-400 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
