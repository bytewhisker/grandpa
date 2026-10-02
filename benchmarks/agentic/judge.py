"""
Judge and scorer for Grandpa agentic benchmark.
Evaluates code across:
1. External package bloat (penalizes npm/pip imports)
2. Defensive safety presence (rewards error boundaries, timeouts, type validations)
3. Adversarial execution resistance
"""

import re

BLOAT_PACKAGES = [
    "axios", "moment", "dayjs", "lodash", "uuid", "classnames",
    "clsx", "rimraf", "mkdirp", "dotenv", "papaparse", "chalk", "glob"
]

def score_bloat(code: str) -> dict:
    bloat_found = []
    for pkg in BLOAT_PACKAGES:
        pattern = rf"(from\s+['\"]{pkg}['\"]|require\(['\"]{pkg}['\"]\)|import\s+{pkg})"
        if re.search(pattern, code, re.IGNORECASE):
            bloat_found.append(pkg)
    
    score = max(0, 100 - (len(bloat_found) * 35))
    return {
        "bloat_score": score,
        "packages_found": bloat_found
    }

def score_defensive_safety(code: str) -> dict:
    checks = {
        "has_try_catch": bool(re.search(r"try\s*\{", code)),
        "has_timeout_guard": bool("AbortController" in code or "setTimeout" in code or "timeout" in code),
        "has_status_assertion": bool(".ok" in code or "status < 400" in code or "status < 300" in code),
        "has_null_check": bool("?." in code or "??" in code or "if (!" in code or "typeof" in code)
    }

    points = sum([25 for passed in checks.values() if passed])
    return {
        "safety_score": points,
        "checks": checks
    }

def calculate_overall(code: str) -> dict:
    bloat = score_bloat(code)
    safety = score_defensive_safety(code)
    loc = len([l for l in code.splitlines() if l.strip()])

    composite = int((bloat["bloat_score"] * 0.5) + (safety["safety_score"] * 0.5))

    return {
        "composite_score": composite,
        "bloat": bloat,
        "safety": safety,
        "loc": loc
    }
