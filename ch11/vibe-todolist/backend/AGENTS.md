# Backend - AGENTS.md

## Dev environment tips
- This project uses `uv` for Python package management.
- Run `uv add <package>` to install dependencies.
- To start the development server, run `uv run uvicorn main:app --reload` from the `backend/` directory.

## Testing instructions
- We strictly follow TDD (Test-Driven Development). Always write or update tests in the `tests/` directory before implementing new features.
- Run tests using `uv run pytest`.
- Ensure all tests pass before completing your task.
- The database is mocked during standard testing unless explicitly configured otherwise in the environment.

## API & Coding Conventions
- Use FastAPI dependency injection (`Depends`) for database connections (`get_db`).
- Pydantic models are used for request/response validation (defined in `models.py`). Use `ConfigDict` for V2 configurations.
- Use `timezone.utc` for datetime generation (e.g., `datetime.now(timezone.utc)`), do NOT use the deprecated `datetime.utcnow()`.
- Endpoints should not contain trailing slashes in the router definitions to avoid 307 redirects and CORS issues (e.g., use `@router.post("")` instead of `@router.post("/")` when a prefix is used).
