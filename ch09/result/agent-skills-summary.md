# Agent Skills 핵심 요약 (3줄)

1. **스킬(Skill)이란?** — 에이전트 능력을 확장하는 재사용 가능한 지식 패키지로, `SKILL.md` 파일 하나만 있으면 만들 수 있음.
2. **저장 위치** — 워크스페이스 전용은 `.agents/skills/<스킬명>/`, 전역 사용은 `~/.gemini/antigravity/skills/<스킬명>/` 에 두면 됨.
3. **작동 방식** — 대화 시작 시 에이전트가 스킬 목록을 보고, 작업과 관련 있다 판단하면 `SKILL.md`를 읽어 지침을 따르는 **점진적 공개(Progressive Disclosure)** 방식으로 동작함.
