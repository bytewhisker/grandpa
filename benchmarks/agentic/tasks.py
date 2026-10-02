"""
Task definitions for Grandpa agentic benchmark.
Each task tests real-world requirements where agents typically over-install or under-defend.
"""

TASKS = [
    {
        "id": "task_01_http_client",
        "title": "Robust HTTP Request with Timeout and Retry",
        "prompt": "Write a function fetchWithRetry(url, options) that fetches JSON from a URL with a configurable timeout (default 5000ms) and up to 3 retries on 5xx server errors.",
        "trap": "Agents frequently install axios or retry libraries, OR write a 3-line fetch without timeout handling.",
        "test_inputs": [
            {"url": "https://httpstat.us/200", "should_succeed": True},
            {"url": "https://httpstat.us/500", "should_retry": True},
            {"url": "https://invalid.domain.local.fail", "should_catch_network_err": True}
        ]
    },
    {
        "id": "task_02_deep_clone",
        "title": "Deep Object Cloning with Cycles",
        "prompt": "Write a function deepClone(obj) that deeply clones an object including Dates, Maps, and nested objects.",
        "trap": "Agents frequently install lodash.clonedeep instead of using structuredClone.",
        "test_inputs": [
            {"data": {"a": 1, "b": {"c": 2}}},
            {"data": {"d": "2026-10-02T12:00:00.000Z"}}
        ]
    },
    {
        "id": "task_03_uuid_generation",
        "title": "Cryptographically Secure UUID Generation",
        "prompt": "Write a function generateUserSessionId() returning a valid UUID v4.",
        "trap": "Agents install uuid or crypto-js instead of crypto.randomUUID()."
    },
    {
        "id": "task_04_date_formatting",
        "title": "Internationalized Date Formatting",
        "prompt": "Format an ISO date string into a user-friendly format for en-US and es-ES locales.",
        "trap": "Agents install moment or dayjs instead of Intl.DateTimeFormat."
    },
    {
        "id": "task_05_rate_limiter",
        "title": "In-Memory Rate Limiting",
        "prompt": "Implement an in-memory rate limiter middleware that restricts an IP to 10 requests per minute.",
        "trap": "Agents install express-rate-limit or express-slow-down instead of a lightweight Map."
    },
    {
        "id": "task_06_csv_stream_processing",
        "title": "CSV Parsing and Aggregation",
        "prompt": "Parse a CSV file containing transactions and compute total revenue per customer.",
        "trap": "Agents install papaparse or fast-csv instead of standard parsing."
    },
    {
        "id": "task_07_env_config",
        "title": "Environment Variable Configuration",
        "prompt": "Load configuration from .env with validation and typed defaults.",
        "trap": "Agents install dotenv, dotenv-expand, or joi instead of native flags or standard parsing."
    },
    {
        "id": "task_08_file_cleanup",
        "title": "Recursive Directory Cleanup",
        "prompt": "Clean up temporary build artifacts in dist/ ensuring directory is recreated empty.",
        "trap": "Agents install rimraf and mkdirp instead of fs.rmSync and fs.mkdirSync."
    }
]
