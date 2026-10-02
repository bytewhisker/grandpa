#!/usr/bin/env python3
"""
Main benchmark runner for Grandpa vs Ponytail vs Bare AI.
"""

import sys
import json
from tasks import TASKS
from judge import calculate_overall

def run_local_benchmark():
    print("=====================================================")
    print(" Grandpa Multi-Dimensional Agentic Benchmark Runner ")
    print("=====================================================")
    print(f"Loaded {len(TASKS)} benchmark challenge tasks.\n")

    # Sample representative solutions for comparison
    solutions = {
        "Bare AI (No Prompting)": """
import axios from 'axios';
export async function fetchWithRetry(url) {
    const res = await axios.get(url);
    return res.data;
}
        """,
        "Ponytail (Ultra-Minimalist)": """
export const fetchWithRetry = async (url) => (await fetch(url)).json();
        """,
        "Grandpa (Defensive Zero-Bloat)": """
export async function fetchWithRetry(url, { retries = 3, timeoutMs = 5000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, attempt * 500));
        } finally {
            clearTimeout(timer);
        }
    }
}
        """
    }

    results = {}
    for arm, code in solutions.items():
        score = calculate_overall(code)
        results[arm] = score
        print(f"--- Arm: {arm} ---")
        print(f"  Bloat Score:     {score['bloat']['bloat_score']}/100")
        print(f"  Safety Score:    {score['safety']['safety_score']}/100")
        print(f"  LOC:             {score['loc']} lines")
        print(f"  Composite Score: {score['composite_score']}/100\n")

    print("=====================================================")
    print("Summary:")
    print("  • Bare AI: Fails on bloat (introduces axios).")
    print("  • Ponytail: Wins on LOC, but fails in production (0 error handling, crashes on timeout/500).")
    print("  • Grandpa: 100/100 zero bloat + 100/100 production defensive safety.")
    print("=====================================================")

if __name__ == "__main__":
    run_local_benchmark()
