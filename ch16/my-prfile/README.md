# ⚡ 모던 인터랙티브 포트폴리오 웹사이트 (Portfolio Website)

> **"근본에 충실하며, 몰입을 통해 문제를 해결하고, 지식의 나눔과 협력으로 사용자와 팀 모두에게 지속 가능한 가치를 전달합니다."**

세련된 사이버 다크(기본) & 클린 미니멀 라이트 모드, 글래스모피즘(Glassmorphism), 한글 타이핑 효과, 숫자 카운트업, 인터랙티브 프로젝트 갤러리 및 상세 트러블슈팅 모달을 갖춘 모던 단일 페이지 포트폴리오 웹사이트입니다.

---

## 🌟 주요 기능 및 특징

1. **🎨 듀얼 테마 시스템 (Dual Theme)**
   - 사이버 다크 모드 (기본) & 클린 미니멀 라이트 모드
   - `localStorage` 상태 저장 및 시스템 테마 연동

2. **✨ 인터랙티브 애니메이션 & 비주얼**
   - 부드러운 한글 멀티 문장 타이핑 애니메이션
   - 앰비언트 네온 오라 효과 및 회전하는 아바타 링
   - IntersectionObserver 기반 통계 지표(Counter) 스무스 카운트업
   - 스크롤 트리거 리빌(Reveal) 애니메이션

3. **📖 개발 철학 섹션 (`DEVELOPMENT_PHILOSOPHY.md` 연동)**
   - 5대 핵심 원칙 카드: 지적 하드 워킹, 기본기 중시, 프로테제 효과, 사회적 구성주의, 사용자 중심

4. **🛠️ 실전 기술 스택 매트릭스**
   - 카테고리 탭 필터링 (프론트엔드, 백엔드&AI, 데이터&클라우드, 데스크톱&에이전트)
   - 숙련도 프로그레스 바 애니메이션

5. **💼 프로젝트 쇼케이스 & 트러블슈팅 모달**
   - 카테고리 필터 (전체, 대표 프로젝트, AI&빅데이터, 풀스택, 웹, 자동화)
   - 상세 보기 클릭 시 **[프로젝트 개요] - [핵심 성과] - [엔지니어링 챌린지 & 해결 방안] - [시스템 아키텍처 다이어그램]** 팝업 모달 제공

6. **📝 기술 아티클 & 엔지니어링 인사이트 (Tech Insights)**
   - Jackson의 Blog 섹션을 벤치마킹한 실전 문제 해결 아티클 4종 카드
   - 카테고리 뱃지, 소요 시간, 태그, 핵심 요약문 제공

7. **📬 문의 & 피드백 시스템**
   - 실시간 구직/협업 가능 펄싱 인디케이터
   - 이메일 주소 원클릭 클립보드 복사
   - 실시간 유효성 검사 및 토스트 알림 연동 문의 폼

---

## 📁 디렉토리 구조

```
ch16/
├── index.html              # 메인 단일 페이지 구조 & SEO 메타 태그
├── assets/
│   ├── css/
│   │   ├── style.css       # 테마 변수, 전역 스타일, 리셋, 폰트
│   │   ├── components.css  # 컴포넌트별 스타일 (네비, 카드, 폼, 모달, 타임라인, 아티클)
│   │   └── animations.css  # 키프레임 애니메이션 및 스크롤 등장 효과
│   └── js/
│       ├── main.js         # 통합 초기화 및 네비게이션/스크롤스파이
│       ├── theme.js        # 다크/라이트 테마 전환
│       ├── typing.js       # 한글 타이핑 효과
│       ├── counter.js      # 통계 숫자 카운트업
│       ├── skills.js       # 기술 스택 매트릭스 렌더링 및 탭 필터
│       ├── projects.js     # 프로젝트 데이터 및 상세 모달 제어
│       ├── timeline.js     # 경력/타임라인 렌더링
│       ├── insights.js     # 기술 아티클/인사이트 렌더링
│       └── contact.js      # 문의 폼 검증 및 토스트 알림
├── src/
│   ├── DEVELOPMENT_PHILOSOPHY.md      # 엔지니어링 5대 원칙 명세
│   └── workspace_projects_analysis.md # 전수 프로젝트 심층 분석 보고서
├── implementation_plan.md  # 초기 구현 계획서
└── README.md               # 포트폴리오 안내서
```

---

## 🚀 로컬 실행 방법

본 프로젝트는 표준 ES 모듈을 사용하는 프론트엔드 웹사이트입니다.

### 방법 1: VS Code Live Server
1. VS Code에서 `ch16/index.html`을 우클릭합니다.
2. `Open with Live Server`를 선택합니다.

### 방법 2: Python 내장 서버
```bash
cd d:\wsh\vibe-workspace\ch16
python -m http.server 8080
```
브라우저에서 `http://localhost:8080` 접속

### 방법 3: Node.js (npx serve)
```bash
cd d:\wsh\vibe-workspace\ch16
npx serve .
```

---

## ⚙️ 커스터마이징 가이드

- **프로필/소개 수정**: `index.html` 내의 Hero 섹션 및 `assets/js/typing.js`의 문구 수정
- **프로젝트 추가/수정**: `assets/js/projects.js`의 `projectsData` 배열에 프로젝트 항목 추가
- **기술 스택 변경**: `assets/js/skills.js`의 `skillsData` 배열 수정
- **타임라인 수정**: `assets/js/timeline.js`의 `timelineData` 배열 수정
- **이메일 주소 변경**: `index.html`의 `#email-address-text` 내용 수정
