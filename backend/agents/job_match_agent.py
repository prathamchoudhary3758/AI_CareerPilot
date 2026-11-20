"""Semantic Job Matching & AI Reasoning Agent.

Computes dense vector embeddings, cosine similarity rankings,
and synthesizes 'Why You Fit' vs 'Skill Gap' reasoning.
"""

from typing import List, Dict, Any, Optional
from backend.models.schemas import (
    CandidateProfile,
    JobDescription,
    JobMatchResult,
    JobMatchReasoning
)
from backend.tools.embeddings import get_embedding, cosine_similarity
from backend.tools.job_api import job_source_manager
from backend.core.state import session_manager


class JobMatchAgent:
    """Agent that ranks job requisitions against a candidate profile

    using vector embeddings and transparent AI fit reasoning.
    """

    async def match_jobs_for_candidate(
        self,
        profile: CandidateProfile,
        session_id: str = "default-session",
        jobs: Optional[List[JobDescription]] = None
    ) -> List[JobMatchResult]:
        """Calculates semantic match percentages and generates fit reasoning for each job."""
        job_pool = jobs if jobs is not None else job_source_manager.get_all_jobs()

        # Broadcast SSE: Job Matching Initiated
        await session_manager.broadcast_event(
            session_id=session_id,
            event_type="job_matching_started",
            message=f"Semantic Job Matcher analyzing {len(job_pool)} positions for candidate '{profile.full_name}'...",
            data={"jobs_count": len(job_pool), "candidate_skills": len(profile.skills)}
        )

        # Build candidate semantic representation text
        candidate_skills_str = " ".join(s.name for s in profile.skills)
        candidate_exp_str = " ".join(
            f"{e.title} at {e.company}: {' '.join(e.bullets)}" for e in profile.experience
        )
        candidate_text = f"{profile.headline or ''} {profile.summary or ''} {candidate_skills_str} {candidate_exp_str}"
        candidate_vec = await get_embedding(candidate_text)

        candidate_skill_names = {s.name.lower() for s in profile.skills}

        results: List[JobMatchResult] = []

        for job in job_pool:
            # Build job representation
            reqs_str = " ".join(job.requirements)
            job_text = f"{job.title} at {job.company}. {job.description} Requirements: {reqs_str}"
            job_vec = await get_embedding(job_text)

            # 1. Vector Cosine Similarity
            vec_sim = cosine_similarity(candidate_vec, job_vec)

            # 2. Exact & Keyword Skill Overlap Analysis
            matched_skills: List[str] = []
            missing_skills: List[str] = []

            for req in job.requirements:
                req_lower = req.lower()
                # Check for overlap in candidate skills or candidate experience text
                is_matched = any(
                    req_lower in s or s in req_lower for s in candidate_skill_names
                ) or (req_lower in candidate_text.lower())

                if is_matched:
                    matched_skills.append(req)
                else:
                    missing_skills.append(req)

            skill_ratio = len(matched_skills) / max(len(job.requirements), 1)

            # 3. Composite Match Percentage (55% vector similarity + 45% skill requirement overlap)
            raw_match = (0.55 * vec_sim + 0.45 * skill_ratio) * 100
            match_percentage = int(min(97, max(45, round(raw_match))))

            # 4. Synthesize AI Fit Reasoning
            reasoning = self._synthesize_reasoning(
                profile=profile,
                job=job,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                match_percentage=match_percentage
            )

            results.append(JobMatchResult(
                job=job,
                match_percentage=match_percentage,
                reasoning=reasoning
            ))

        # Sort jobs by match percentage descending
        results.sort(key=lambda x: x.match_percentage, reverse=True)

        # Store in session state
        session_manager.update_session(
            session_id,
            "matched_jobs",
            [r.model_dump() for r in results]
        )

        top_match = results[0] if results else None
        await session_manager.broadcast_event(
            session_id=session_id,
            event_type="job_matching_completed",
            message=f"Ranked {len(results)} jobs. Top Match: {top_match.job.title} ({top_match.match_percentage}%)",
            data={
                "top_job_id": top_match.job.id if top_match else None,
                "top_match_percentage": top_match.match_percentage if top_match else 0
            }
        )

        return results

    def _synthesize_reasoning(
        self,
        profile: CandidateProfile,
        job: JobDescription,
        matched_skills: List[str],
        missing_skills: List[str],
        match_percentage: int
    ) -> JobMatchReasoning:
        """Synthesizes narrative fit summary, potential challenges, and tailoring tips."""
        top_skills = matched_skills[:3] if matched_skills else ["Software Engineering", "Problem Solving"]
        skills_summary = ", ".join(top_skills)

        if match_percentage >= 85:
            fit_summary = (
                f"Exceptional alignment with {job.company}'s requirements. Candidate demonstrates strong hands-on "
                f"competency in {skills_summary}, directly addressing the core architectural needs of the {job.title} role."
            )
        elif match_percentage >= 70:
            fit_summary = (
                f"Solid foundational match for {job.title}. The candidate brings verified expertise in {skills_summary}, "
                f"though there are a few specialized domain qualifications to bridge."
            )
        else:
            fit_summary = (
                f"Moderate transferable match. While the candidate possesses strong engineering foundations in {skills_summary}, "
                f"the position prioritizes specific tooling not prominent in the candidate's verified history."
            )

        potential_challenges: List[str] = []
        if missing_skills:
            potential_challenges.append(
                f"Role explicitly requires {missing_skills[0]}, which was not directly indexed in your primary resume profile."
            )
        potential_challenges.append(
            f"Technical screening will likely test deep production edge-cases in {job.title} architectures."
        )

        tailoring_tips: List[str] = [
            f"Highlight real-world projects featuring {top_skills[0]} in your top experience bullet points.",
            f"Address {missing_skills[0] if missing_skills else 'distributed scale'} in your cover letter by framing relevant transferable architectures."
        ]

        return JobMatchReasoning(
            fit_summary=fit_summary,
            matched_skills=matched_skills if matched_skills else ["General Software Development"],
            missing_critical_skills=missing_skills[:3] if missing_skills else ["None identified"],
            potential_challenges=potential_challenges,
            tailoring_tips=tailoring_tips
        )


job_match_agent = JobMatchAgent()
