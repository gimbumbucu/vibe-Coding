---
trigger: always_on
---

You must ALWAYS use uv for all Python environment management, package installations, and script executions. Never use standard pip or venv. Always prefix Python commands with uv run (e.g., uv run python, uv run main.py).