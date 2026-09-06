# Vibe Todo List - Backend 🐍

이 디렉터리는 Vibe Todo List 애플리케이션의 백엔드 API 서버를 포함하고 있습니다. **Python**과 **FastAPI**를 기반으로 구축되었습니다.

## 🛠️ 기술 스택

- **프레임워크**: FastAPI
- **패키지 관리자**: `uv` (초고속 파이썬 패키지 매니저)
- **데이터 검증**: Pydantic (V2)
- **테스트**: `pytest`

## 🚀 실행 방법

### 1. 의존성 설치
이 프로젝트는 `uv`를 사용하여 의존성을 관리합니다. (사전에 `uv` 설치가 필요합니다)
새로운 패키지를 추가할 때는 다음 명령어를 사용합니다:
```bash
uv add <package_name>
```

### 2. 개발 서버 실행
다음 명령어를 통해 FastAPI 개발 서버를 실행할 수 있습니다. (코드를 수정하면 자동으로 재시작됩니다)
```bash
uv run uvicorn main:app --reload
```
서버가 실행되면 `http://127.0.0.1:8000/docs`에서 Swagger UI API 문서를 확인할 수 있습니다.

## 🧪 테스트 (TDD)

이 프로젝트는 **테스트 주도 개발(TDD)**을 지향합니다. 새로운 기능을 추가하기 전에 항상 `tests/` 디렉터리에 테스트 코드를 먼저 작성하거나 업데이트해야 합니다.

```bash
uv run pytest
```
> **참고**: 기본적으로 테스트 시에는 데이터베이스가 Mocking되어 실제 DB에 영향을 주지 않습니다.

## 📝 주요 코딩 컨벤션

- **의존성 주입**: 데이터베이스 연결(`get_db`) 등은 FastAPI의 `Depends`를 활용합니다.
- **데이터 검증**: Pydantic 모델(`models.py`)을 사용하며, V2 방식의 `ConfigDict`를 사용합니다.
- **시간 처리**: 시간 생성 시 만료된 `datetime.utcnow()` 대신 반드시 **`datetime.now(timezone.utc)`**를 사용합니다.
- **라우팅 규칙**: CORS 문제나 307 리다이렉트 방지를 위해 엔드포인트 정의 시 **후행 슬래시(trailing slash)를 금지**합니다. (예: `@router.post("/")` ❌ -> `@router.post("")` ✅)
