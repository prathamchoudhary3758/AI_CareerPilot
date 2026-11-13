"""RAG Knowledge Base Engine for ATS Optimization and Resume Best Practices."""

import os
import re
import math
from typing import List, Dict, Any, Optional

# Pre-defined curated ATS rules in case directory is missing or on fresh install
DEFAULT_ATS_RULES = [
    {
        "id": "ats_layout_single_column",
        "category": "layout",
        "title": "Standard Single-Column Layout",
        "rule": "Use standard single-column layouts for maximum parser compatibility. Avoid tables, multi-column text boxes, and non-standard graphics.",
        "weight": 15
    },
    {
        "id": "ats_clear_headings",
        "category": "structure",
        "title": "Standard Section Headings",
        "rule": "Use standard section headings: Professional Summary, Core Competencies/Technical Skills, Experience, Education. Do not invent non-standard headers.",
        "weight": 10
    },
    {
        "id": "ats_contact_info",
        "category": "contact",
        "title": "Parseable Contact Information",
        "rule": "Place email address, phone number, and location in body text rather than headers or footers, so ATS parsers reliably extract candidate identity.",
        "weight": 10
    },
    {
        "id": "star_xyz_formula",
        "category": "impact",
        "title": "Google XYZ Impact Formula",
        "rule": "Every bullet should follow the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Include numerical metrics (% improvements, volume, latency).",
        "weight": 25
    },
    {
        "id": "action_verbs_strong",
        "category": "verbiage",
        "title": "Strong Action Verbs",
        "rule": "Begin each bullet with a strong action verb (Architected, Spearheaded, Engineered, Automated, Streamlined) rather than passive verbs (Worked on, Assisted, Helped with).",
        "weight": 20
    },
    {
        "id": "keyword_contextual_density",
        "category": "skills",
        "title": "Contextual Skill Mention",
        "rule": "Mention primary technologies and domain keywords from the target job description both in the skills section and contextualized inside actual experience bullets.",
        "weight": 20
    }
]

STRONG_ACTION_VERBS = {
    "architected", "spearheaded", "engineered", "built", "designed", "deployed",
    "developed", "automated", "optimized", "implemented", "scaled", "orchestrated",
    "led", "reduced", "increased", "accelerated", "streamlined", "eliminated",
    "refactored", "integrated", "benchmarked", "mentored", "delivered", "transformed",
    "championed", "formulated", "pioneered", "maximized", "minimized", "enhanced"
}

WEAK_VERBS = {
    "worked on", "assisted with", "assisted", "helped", "helped with", "handled",
    "responsible for", "participated in", "supported", "involved in", "did", "made"
}


class ATSKnowledgeBase:
    """Retrieval-Augmented Generation Knowledge Base for ATS benchmarks."""

    def __init__(self, data_dir: Optional[str] = None):
        self.rules: List[Dict[str, Any]] = []
        if not data_dir:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            data_dir = os.path.join(base_dir, "data", "resume_best_practices")
        self.data_dir = data_dir
        self.load_rules()

    def load_rules(self):
        """Loads and parses rules from the markdown documentation or defaults."""
        self.rules = list(DEFAULT_ATS_RULES)
        if os.path.exists(self.data_dir):
            for filename in os.listdir(self.data_dir):
                if filename.endswith(".md"):
                    file_path = os.path.join(self.data_dir, filename)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            # Parse sections from markdown
                            chunks = re.split(r"\n##\s+", content)
                            for idx, chunk in enumerate(chunks):
                                if not chunk.strip():
                                    continue
                                lines = chunk.strip().split("\n")
                                heading = lines[0].strip("# ")
                                body = "\n".join(lines[1:]).strip()
                                self.rules.append({
                                    "id": f"{filename}_{idx}",
                                    "category": "guide",
                                    "title": heading,
                                    "rule": body,
                                    "weight": 10
                                })
                    except Exception:
                        pass

    def retrieve_relevant_rules(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Semantic BM25 / token-overlap retrieval for ATS rules."""
        query_tokens = set(re.findall(r"\w+", query.lower()))
        scored_rules = []
        
        for rule in self.rules:
            rule_text = f"{rule['title']} {rule['rule']}".lower()
            rule_tokens = set(re.findall(r"\w+", rule_text))
            overlap = len(query_tokens.intersection(rule_tokens))
            score = overlap / (math.sqrt(len(query_tokens) + 1) * math.sqrt(len(rule_tokens) + 1))
            scored_rules.append((score, rule))

        scored_rules.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_rules[:top_k]]

    def analyze_action_verbs(self, bullets: List[str]) -> Dict[str, Any]:
        """Calculates action verb score and flags weak verbs."""
        if not bullets:
            return {"score": 70, "strong_count": 0, "weak_count": 0, "weak_examples": []}

        strong_count = 0
        weak_count = 0
        weak_examples = []

        for bullet in bullets:
            b_lower = bullet.strip().lower()
            first_words = " ".join(b_lower.split()[:2])
            first_word = b_lower.split()[0] if b_lower.split() else ""

            is_weak = False
            for weak in WEAK_VERBS:
                if b_lower.startswith(weak):
                    weak_count += 1
                    weak_examples.append(bullet)
                    is_weak = True
                    break

            if not is_weak:
                if first_word in STRONG_ACTION_VERBS:
                    strong_count += 1
                else:
                    # Neutral verb
                    pass

        total = len(bullets)
        # Score calculation: 100 base adjusted for ratio
        ratio = (strong_count - (weak_count * 1.5)) / max(total, 1)
        score = int(max(30, min(100, 60 + ratio * 40)))

        return {
            "score": score,
            "strong_count": strong_count,
            "weak_count": weak_count,
            "weak_examples": weak_examples[:3]
        }

    def analyze_impact_metrics(self, bullets: List[str]) -> Dict[str, Any]:
        """Detects whether bullets have quantifiable numbers, metrics, or percentages."""
        if not bullets:
            return {"score": 65, "metric_bullets_count": 0, "unquantified": []}

        # Patterns for percentages, numbers, $ amounts, k/m/b scales, times
        metric_pattern = re.compile(
            r"(\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+[kKmMbB]\+?|\b\d+\+?\s*(?:users|clients|events|rps|ms|seconds|minutes|hours|team members|engineers|projects))"
        )

        metric_count = 0
        unquantified = []

        for b in bullets:
            if metric_pattern.search(b):
                metric_count += 1
            else:
                if len(b.split()) > 4: # Only consider substantive bullets
                    unquantified.append(b)

        ratio = metric_count / max(len(bullets), 1)
        score = int(max(35, min(100, 45 + ratio * 55)))

        return {
            "score": score,
            "metric_bullets_count": metric_count,
            "total_bullets": len(bullets),
            "unquantified": unquantified
        }


ats_knowledge_base = ATSKnowledgeBase()
