"""
Completion handler for agentic runs.
"""

def handle_completion(run_data: dict) -> dict:
    return {
        "status": "completed",
        "task_id": run_data.get("task_id"),
        "metrics": run_data.get("metrics", {})
    }
