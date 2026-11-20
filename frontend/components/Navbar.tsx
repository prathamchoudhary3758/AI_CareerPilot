"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Terminal, Activity } from "lucide-react";
import BackendStatusBadge from "./BackendStatusBadge";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/resume", label: "Resume Review" },
    { href: "/jobs", label: "Job Matches" },
    { href: "/coverletter", label: "Cover Letter" },
    { href: "/interview", label: "Interview Practice" },
    { href: "/activity", label: "Activity Log", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-medium shadow-xs">
            <Briefcase className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                Career Co-Pilot
              </span>
              <span className="px-1.5 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-600 border border-slate-200">
                v0.3
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Application & Interview Workspace</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status & Docs */}
        <div className="flex items-center gap-2.5">
          <BackendStatusBadge />
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>API Docs</span>
          </a>
        </div>
      </div>
    </header>
  );
}
