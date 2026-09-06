/**
 * Projects Portfolio Showcase Module
 * Real workspace dataset from ch01 ~ ch16 with rich modal troubleshooting cases.
 */

export const projectsData = [
  {
    id: "jemini-chat",
    title: "Jemini - 실시간 AI 챗 어시스턴트",
    subtitle: "Google Gemini 2.0 & SSE 스트리밍 기반 풀스택 대화형 AI 플랫폼",
    category: "ai",
    badge: "대표 프로젝트",
    featured: true,
    period: "2026.08",
    tags: ["FastAPI", "Python", "Gemini 2.0", "Supabase", "React 19", "FSD", "SSE", "Render"],
    description: "Google Gemini 2.0 모델을 연동하여 초저지연 실시간 SSE 토큰 스트리밍과 세션별 대화 히스토리 영속성을 제공하는 고성능 풀스택 AI 웹 서비스입니다.",
    highlights: [
      "Server-Sent Events(SSE) 프로토콜을 활용한 초저지연 타자기식 토큰 스트리밍",
      "Supabase PostgreSQL 기반의 세션 생성 및 대화 히스토리 실시간 자동 동기화",
      "Feature-Sliced Design(FSD) 아키텍처 적용으로 프론트엔드 계층별 모듈성 극대화",
      "AI 응답 내 코드 블록 마크다운 구문 강조 및 원클릭 복사 기능 구현",
      "Render PaaS 클라우드 IaC(render.yaml) 환경 구축 및 배포 가이드 완성"
    ],
    troubleshooting: {
      problem: "실시간 SSE 스트리밍 통신 도중 네트워크 순간 끊김이나 대용량 토큰 청크 파싱 실패 시 프론트엔드 UI가 멈추고 렌더링이 중단되는 현상 발생.",
      solution: "프론트엔드에 TextDecoderStream 기반의 SSEClient 추상화 레이어를 구축하여 자동 재연결 및 청크 에러 폴백을 처리하고, 백엔드 FastAPI 제너레이터에 세이프가드 예외 핸들링을 적용하여 무중단 스트리밍 완성."
    },
    architecture: `[React 19 (FSD)] --(SSE Stream)--> [FastAPI Backend]
       |                                   |
(Client State)                    [Google GenAI SDK]
       |                                   |
[Local Storage] <--(History Sync)-- [Supabase PostgreSQL]`,
    links: {
      github: "https://github.com",
      demo: "#",
      doc: "ch10/jemini"
    }
  },
  {
    id: "commercial-pulse",
    title: "Commercial Pulse - 상권 분석 빅데이터 GIS",
    subtitle: "전국 240만 건 상가 데이터 압축 및 VWorld 공간 지도 시각화 플랫폼",
    category: "ai",
    badge: "대표 프로젝트",
    featured: true,
    period: "2026.08",
    tags: ["FastAPI", "Apache Parquet", "DuckDB", "VWorld Map API", "Leaflet.js", "GIS"],
    description: "전국 240만+ 건의 소상공인 상가 공공데이터를 Apache Parquet 컬럼형 포맷으로 최적화하여 100ms 이하의 초고속 반경 공간 검색과 VWorld 2D/3D 지도 시각화를 구현했습니다.",
    highlights: [
      "240만 건 거대 CSV 데이터를 Snappy 압축 Parquet로 변환하여 파일 용량 85% 절감",
      "사용자 지정 반경(Radius) 및 행정동 기반 초고속 업종 밀집도 분석 API 구현",
      "VWorld 국가공간정보 오픈플랫폼 및 Leaflet.js를 결합한 인터랙티브 지도 렌더링",
      "불완전한 주소를 정밀 좌표로 자동 정제하는 전용 지오코딩 AI 에이전트 스킬 통합"
    ],
    troubleshooting: {
      problem: "240만 행(수백 MB)의 원본 CSV 데이터를 기존 RDBMS나 단순 파일 읽기로 탐색 시 수 초 이상의 I/O 지연 및 서버 메모리 병목 발생.",
      solution: "컬럼 지향 저장소 포맷인 Apache Parquet로 변환하고 메모리 매핑 기반 고속 OLAP 엔진인 DuckDB 쿼리 파이프라인을 적용하여 검색 레이턴시를 100ms 이내로 단축."
    },
    architecture: `[Leaflet.js / VWorld Map] <--(GeoJSON Geo-Search)-- [FastAPI API]
            |                                              |
     [Marker Clusters]                           [DuckDB Query Engine]
                                                           |
                                                [2.4M Snappy Parquet]`,
    links: {
      github: "https://github.com",
      demo: "#",
      doc: "ch15/commercial-pulse"
    }
  },
  {
    id: "coffee-kiosk",
    title: "스마트 커피 키오스크 & 주문 웹 앱",
    subtitle: "Next.js 15 & Zustand 기반의 인터랙티브 음료 주문 및 결제 시스템",
    category: "web",
    badge: "대표 프로젝트",
    featured: true,
    period: "2026.08",
    tags: ["Next.js 15", "TypeScript", "Tailwind CSS", "Zustand", "Radix UI"],
    description: "매장 대형 키오스크 및 모바일 주문 환경을 모두 완벽 지원하는 반응형 커머스 웹 앱으로, 음료 커스텀 옵션에 따른 실시간 가격 변동과 정밀한 장바구니 상태 관리를 지원합니다.",
    highlights: [
      "온도(Hot/Ice), 샷 추가, 시럽, 원두, 사이즈 등 정밀한 음료 커스터마이징 모달",
      "Zustand 스토어의 옵션 해시 키 기반 장바구니 분리 엔진 설계",
      "카드/간편결제 UI 플로우 및 주문 완료 인터랙티브 영수증 티켓 렌더링",
      "체계적인 PRD 및 기능 명세서(Feature Specification) 기반 완성도 높은 설계"
    ],
    troubleshooting: {
      problem: "동일한 아메리카노 메뉴라도 'Ice + 샷추가'와 'Hot + 연하게'처럼 옵션이 다른 경우 단일 아이템으로 수량이 합산되어 주문 오류가 발생하는 문제.",
      solution: "음료의 고유 Menu ID와 선택된 옵션 객체를 조합하여 직렬화한 SHA 유사 고유 해시 키(cartItemId) 생성 알고리즘을 도입하여 개별 라인 아이템으로 완전 분리 관리."
    },
    architecture: `[Next.js 15 App Router] <---> [Zustand Global Store (cartStore.ts)]
         |                                     |
[Custom Option Modal]               [LocalStorage Middleware]
         |                                     |
[Realtime Price Engine] <----------> [Checkout & Receipt Ticket]`,
    links: {
      github: "https://github.com",
      demo: "#",
      doc: "ch07/coffee-order-app"
    }
  },
  {
    id: "household-budget",
    title: "가계부 업무 자동화 시스템 (GAS)",
    subtitle: "Google Drive 영수증 OCR 자동 파싱 및 Sheets 실시간 기장 시스템",
    category: "automation",
    badge: "대표 프로젝트",
    featured: true,
    period: "2026.08",
    tags: ["Google Apps Script", "TypeScript", "Clasp", "Drive OCR", "Sheets API"],
    description: "구글 드라이브에 영수증을 업로드하면 OCR로 거래처, 일시, 금액을 자동 인식하여 스프레드시트에 기장하고 사이드바 대시보드를 제공하는 클라우드 자동화 도구입니다.",
    highlights: [
      "Drive OCR 파싱 파이프라인을 통한 수기 영수증 입력 업무 100% 자동화",
      "TypeScript & Clasp CLI를 적용한 Google Apps Script 모던 엔지니어링 환경 구축",
      "스프레드시트 내장 커스텀 HTML/CSS 사이드바 인터페이스 및 예산 대비 지출 차트 제공",
      "이벤트 기반 Time-driven 및 onEdit 자동 트리거 아키텍처"
    ],
    troubleshooting: {
      problem: "영수증 이미지마다 글꼴, 왜곡, 줄바꿈이 상이하여 정규식(Regex) 단일 패턴 매칭 시 금액 및 상호명 오추출 빈도 발생.",
      solution: "단계별 토큰 파서(Date Validator -> Currency Extractor -> Merchant Score Matcher) 다중 휴리스틱 필터링 파이프라인을 구현하여 영수증 인식 정확도를 95% 이상으로 대폭 향상."
    },
    architecture: `[Google Drive Upload] ---> [GAS Drive OCR Engine] ---> [Token Parser]
                                                            |
[GAS Interactive Sidebar] <---> [Google Sheets Database] <---+`,
    links: {
      github: "https://github.com",
      demo: "#",
      doc: "ch15/household-budget"
    }
  },
  {
    id: "mytion-desktop",
    title: "Mytion - 크로스플랫폼 노션 클론",
    subtitle: "Tauri v2 (Rust) & Next.js 15 기반 초경량 데스크톱 문서 도구",
    category: "fullstack",
    badge: "대표 프로젝트",
    featured: true,
    period: "2026.08",
    tags: ["Next.js 15", "React 19", "TypeScript", "Tauri v2", "Rust", "Tailwind CSS"],
    description: "웹 기술과 Rust 네이티브 백엔드를 결합하여 10MB 미만의 초경량 크로스플랫폼 데스크톱 생산성 앱을 구현했습니다.",
    highlights: [
      "다양한 블록(헤딩, 체크리스트, 콜아웃, 코드)을 지원하는 리치 문서 에디터",
      "무한 뎁스 계층형 사이드바 문서 트리 및 즐겨찾기, 빠른 검색 지원",
      "Tauri v2를 활용한 Windows 네이티브 실행 파일 컴파일 및 패키징",
      "오프라인 로컬 저장소(LocalStorage / IndexedDB) 영속성 지원"
    ],
    troubleshooting: {
      problem: "기존 Electron 기반 데스크톱 앱의 고질적인 메모리 과다 점유(300MB+) 및 거대한 바이너리 배포 크기(150MB+) 한계.",
      solution: "Rust Core 기반의 Tauri v2 런타임과 OS 내장 Webview2를 결합하여 메모리 사용량을 50MB 이하로 낮추고 빌드 패키지 크기를 10MB 미만으로 최적화."
    },
    architecture: `[Next.js 15 React 19 Frontend] <--(IPC Channel)--> [Rust Tauri v2 Core]
               |                                             |
     [Block Rich Editor]                             [Native Window/FS]
               |                                             |
     [Hierarchical Tree] <----------------------> [LocalStorage Persistence]`,
    links: {
      github: "https://github.com",
      demo: "#",
      doc: "ch05/mytion"
    }
  },
  {
    id: "vibe-todolist",
    title: "Vibe TodoList - TDD 풀스택 웹 앱",
    subtitle: "FastAPI & React 기반 Pytest 테스트 주도 개발(TDD) 프로젝트",
    category: "fullstack",
    badge: "대표 프로젝트",
    featured: true,
    period: "2026.08",
    tags: ["FastAPI", "SQLite", "SQLAlchemy", "Pytest", "React", "TypeScript", "Render"],
    description: "엄격한 TDD(테스트 주도 개발) 방법론을 적용하여 작성된 안정적인 풀스택 할 일 관리 웹 애플리케이션입니다.",
    highlights: [
      "Pytest를 활용한 백엔드 CRUD API 단위/통합 테스트 커버리지 100% 달성",
      "FastAPI & SQLAlchemy 기반의 견고한 RESTful 비즈니스 로직 및 예외 핸들링",
      "Vite & React 기반의 매끄러운 비동기 상태 갱신 UI 및 실시간 완료율 게이지",
      "Render 클라우드 서비스 연동 분리 배포 파이프라인 구축"
    ],
    troubleshooting: {
      problem: "프론트엔드 비동기 요청과 백엔드 DB 상태 간 시차로 인해 연속 빠른 클릭 시 투두 상태 불일치(Race Condition) 발생.",
      solution: "FastAPI 세션 트랜잭션 원자성(Atomicity) 보장과 프론트엔드 낙관적 업데이트(Optimistic Update) + 롤백 훅을 결합하여 완벽한 동기화 달성."
    },
    architecture: `[React + TypeScript (Vite)] <--(RESTful JSON API)--> [FastAPI Server]
              |                                            |
     [Optimistic UI]                              [SQLAlchemy ORM]
              |                                            |
     [Pytest Test Suite (100% Coverage)] <--------> [SQLite Database]`,
    links: {
      github: "https://github.com",
      demo: "#",
      doc: "ch11/vibe-todolist"
    }
  },
  {
    id: "naver-macro",
    title: "네이버 서버시간 정밀 매크로 GUI",
    subtitle: "PySide6 기반 밀리초 정밀 서버시간 파싱 및 자동화 GUI",
    category: "automation",
    badge: "실전 자동화",
    featured: false,
    period: "2026.08",
    tags: ["Python", "PySide6", "Qt", "HTTP Time Sync", "PyInstaller"],
    description: "타깃 웹 서버의 HTTP 응답 헤더를 밀리초 단위로 파싱하여 로컬 시계와 동기화하고 정각 자동 클릭을 실행하는 데스크톱 GUI 프로그램입니다.",
    highlights: [
      "HTTP Response Header 기반 밀리초 단위 정밀 서버시간 동기화",
      "PySide6 (Qt) 기반 직관적인 컨트롤 패널 및 카운트다운 타이머",
      "PyInstaller 단일 실행 파일(.exe) 패키징 및 배포"
    ],
    troubleshooting: {
      problem: "클라이언트 PC의 로컬 시계 오차(최대 수 초)로 인해 정각 수강신청/예매 실패 현상 발생.",
      solution: "웹 서버와 왕복 지연시간(RTT/2)을 보정 계산하는 정밀 HTTP 헤더 타임스탬프 파싱 알고리즘을 도입하여 50ms 미만의 정밀 동기화 달성."
    },
    architecture: `[Target Server HTTP Header] ---> [RTT Latency Compensator] ---> [Sync Clock]
                                                                        |
[PySide6 Qt Dashboard] <---> [Precision Timer Thread] <----------------+`,
    links: { github: "https://github.com", demo: "#", doc: "ch06/naver_macro_gui" }
  },
  {
    id: "outstargram",
    title: "Outstargram - 소셜 미디어 피드 웹 앱",
    subtitle: "Next.js 15 기반 인스타그램 UI/UX 모바일 최적화 클론",
    category: "web",
    badge: "모바일 웹",
    featured: false,
    period: "2026.08",
    tags: ["Next.js 15", "TypeScript", "Tailwind CSS", "Lucide React"],
    description: "스토리 바, 포스트 피드, 더블 탭 좋아요 및 하단 반응형 탭바를 구현한 소셜 미디어 웹 앱입니다.",
    highlights: [
      "그라데이션 링 스토리 캐러셀 컴포넌트",
      "더블 탭 하트 팝핑 애니메이션 및 인터랙션 피드",
      "모바일 퍼스트 반응형 레이아웃 및 뷰포트 최적화"
    ],
    troubleshooting: {
      problem: "모바일 웹뷰에서 더블 탭 시 브라우저 기본 확대/축소 동작과 충돌하여 좋아요 인터랙션이 씹히는 문제.",
      solution: "touch-action: manipulation CSS 속성 적용 및 커스텀 더블 탭 제스처 타이머 핸들러를 바인딩하여 해결."
    },
    architecture: `[Next.js 15 App Router] ---> [Story Carousel & Feed Widget] ---> [Touch Gestures]`,
    links: { github: "https://github.com", demo: "#", doc: "ch06/outstargram" }
  },
  {
    id: "agent-skills-suite",
    title: "AI 에이전트 스킬 & 리포트 생성기",
    subtitle: "Antigravity 커스텀 스킬 (주식 시세, 날씨 예보, 슬라이드 생성)",
    category: "ai",
    badge: "에이전트 엔지니어링",
    featured: false,
    period: "2026.08",
    tags: ["Antigravity", "Python", "Stock API", "Open-Meteo", "Marp"],
    description: "주식 분석, 기상청 날씨 예보 및 웹 프레젠테이션을 스스로 작성하는 AI 에이전트 전용 확장 도구 모음입니다.",
    highlights: [
      "주식 시세 데이터 수집 및 비교 분석 HTML 리포트 자동 생성",
      "Open-Meteo 기상 데이터 기반 주간 날씨 예보 리포트 파이프라인",
      "Marp 마크다운 및 인터랙티브 웹 슬라이드 자동 생성 스킬(make-slide)"
    ],
    troubleshooting: {
      problem: "AI 에이전트가 외부 비정형 데이터를 가져올 때 포맷 불일치로 인한 스크립트 실행 중단 문제.",
      solution: "엄격한 YAML Frontmatter 스킬 명세서와 Pydantic 기반의 데이터 스키마 유효성 검증을 사전 배치하여 에러율 0% 유지."
    },
    architecture: `[Antigravity Orchestrator] ---> [Custom Skill (SKILL.md)] ---> [Python Data Fetcher]
                                                                        |
[Executive Report Output] <---------------------------------------------+`,
    links: { github: "https://github.com", demo: "#", doc: "ch11/antigravity_skills.md" }
  }
];

export function initProjects() {
  const container = document.getElementById('projects-container');
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const modalBackdrop = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (!container) return;

  function renderProjects(category = 'all') {
    let filtered = projectsData;
    if (category === 'featured') {
      filtered = projectsData.filter(p => p.featured);
    } else if (category !== 'all') {
      filtered = projectsData.filter(p => p.category === category);
    }

    container.innerHTML = filtered.map(project => `
      <div class="project-card reveal ${project.featured ? 'featured-card' : ''}" data-id="${project.id}">
        <div class="project-thumb-box">
          <span class="project-badge-tag">${project.badge}</span>
          ${getProjectSvgVisual(project.id, project.title)}
        </div>
        <div class="project-body">
          <div class="project-title">${project.title}</div>
          <div class="project-subtitle">${project.subtitle}</div>
          <p class="project-desc">${project.description}</p>
          <div class="project-tags">
            ${project.tags.slice(0, 4).map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
            ${project.tags.length > 4 ? `<span class="tag-pill">+${project.tags.length - 4}</span>` : ''}
          </div>
          <div class="project-actions">
            <button class="project-detail-btn" data-project-id="${project.id}">
              상세 보기 <span>→</span>
            </button>
            <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${project.period}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click events for modal open
    container.querySelectorAll('.project-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-project-id');
        openProjectModal(id);
      });
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-filter');
      renderProjects(category);
    });
  });

  // Modal Open Function
  function openProjectModal(id) {
    const project = projectsData.find(p => p.id === id);
    if (!project || !modalBody || !modalBackdrop) return;

    modalBody.innerHTML = `
      <div class="modal-header">
        <div class="modal-tags-bar">
          <span class="tag-pill" style="color: var(--color-1); font-weight: 700;">${project.badge}</span>
          <span class="tag-pill" style="color: var(--text-muted); font-weight: 600;">${project.period}</span>
        </div>
        <h2 class="modal-title">${project.title}</h2>
        <div class="modal-subtitle">${project.subtitle}</div>
      </div>

      <div class="modal-section-title">프로젝트 개요</div>
      <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.8;">${project.description}</p>

      <div class="modal-section-title">핵심 기능 및 성과</div>
      <ul class="philosophy-bullets">
        ${project.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>

      <div class="modal-section-title">기술 스택</div>
      <div class="project-tags" style="margin-bottom: 10px;">
        ${project.tags.map(t => `<span class="tag-pill" style="font-size: 0.85rem; padding: 6px 12px; background: rgba(44,152,240,0.08); border-color: var(--border-subtle); color: var(--text-primary);">${t}</span>`).join('')}
      </div>

      ${project.troubleshooting ? `
        <div class="modal-section-title">엔지니어링 챌린지 & 문제 해결 (Troubleshooting)</div>
        <div class="trouble-case-box">
          <div class="trouble-item">
            <div class="trouble-label">발생한 문제 (Challenge)</div>
            <div class="trouble-text">${project.troubleshooting.problem}</div>
          </div>
          <div class="trouble-item" style="margin-top: 12px;">
            <div class="trouble-label solution">해결 방안 & 성과 (Resolution)</div>
            <div class="trouble-text">${project.troubleshooting.solution}</div>
          </div>
        </div>
      ` : ''}

      ${project.architecture ? `
        <div class="modal-section-title">시스템 아키텍처 다이어그램</div>
        <pre class="architecture-code-box"><code>${project.architecture}</code></pre>
      ` : ''}

      <div style="margin-top: 30px; display: flex; gap: 12px; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" id="modal-inner-close">닫기</button>
      </div>
    `;

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    document.getElementById('modal-inner-close')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalCloseBtn?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });

  // Initial render
  renderProjects('all');
}

/**
 * Generate aesthetic SVG UI Mockup preview for project thumbnails
 */
function getProjectSvgVisual(id, title) {
  const gradientMap = {
    'jemini-chat': { c1: '#2c98f0', c2: '#a84cb8', label: 'AI ASSISTANT' },
    'commercial-pulse': { c1: '#2fa499', c2: '#2c98f0', label: 'GIS BIG DATA' },
    'coffee-kiosk': { c1: '#f9bf3f', c2: '#ec5453', label: 'COMMERCE APP' },
    'household-budget': { c1: '#2fa499', c2: '#40acff', label: 'GAS AUTOMATION' },
    'mytion-desktop': { c1: '#2c98f0', c2: '#a84cb8', label: 'TAURI v2 RUST' },
    'vibe-todolist': { c1: '#a84cb8', c2: '#ec5453', label: 'TDD FULLSTACK' },
    'naver-macro': { c1: '#2fa499', c2: '#2c98f0', label: 'PYSIDE6 GUI' },
    'outstargram': { c1: '#ec5453', c2: '#a84cb8', label: 'MOBILE FEED' },
    'agent-skills-suite': { c1: '#2c98f0', c2: '#2fa499', label: 'AGENT SKILLS' }
  };

  const vectorMap = {
    'jemini-chat': `<path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10a9.96 9.96 0 0 1-5-1.34L2 22l1.34-5A9.96 9.96 0 0 1 2 12C2 6.48 6.48 2 12 2z" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    'commercial-pulse': `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    'coffee-kiosk': `<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    'household-budget': `<ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    'mytion-desktop': `<rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" stroke-width="1.8"/>`,
    'vibe-todolist': `<polyline points="9 11 12 14 22 4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    'naver-macro': `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    'outstargram': `<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2"/>`,
    'agent-skills-suite': `<rect x="2" y="3" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="1.8"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="1.8"/>`
  };

  const config = gradientMap[id] || { c1: '#2c98f0', c2: '#a84cb8', label: 'PROJECT' };
  const vectorShape = vectorMap[id] || `<polyline points="16 18 22 12 16 6" fill="none" stroke="currentColor" stroke-width="1.8"/><polyline points="8 6 2 12 8 18" fill="none" stroke="currentColor" stroke-width="1.8"/>`;

  return `
    <svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${config.c1}" stop-opacity="0.25" />
          <stop offset="100%" stop-color="${config.c2}" stop-opacity="0.08" />
        </linearGradient>
        <linearGradient id="glow-${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${config.c1}" />
          <stop offset="100%" stop-color="${config.c2}" />
        </linearGradient>
      </defs>
      
      <!-- Background Rect -->
      <rect width="400" height="220" fill="url(#grad-${id})" />
      
      <!-- Window Frame Mockup -->
      <g transform="translate(30, 25)">
        <rect width="340" height="170" rx="4" fill="#141c2e" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
        <line x1="0" y1="30" x2="340" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        
        <!-- Window Traffic Dots -->
        <circle cx="16" cy="15" r="3.5" fill="#ec5453" opacity="0.8" />
        <circle cx="27" cy="15" r="3.5" fill="#f9bf3f" opacity="0.8" />
        <circle cx="38" cy="15" r="3.5" fill="#2fa499" opacity="0.8" />
        
        <!-- Window Label -->
        <text x="170" y="19" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle" font-weight="600">${config.label}</text>
        
        <!-- Center Aesthetic Visual -->
        <g transform="translate(170, 95)">
          <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="url(#glow-${id})" stroke-width="1.5" />
          <g transform="translate(-12, -12)" color="${config.c1}">
            ${vectorShape}
          </g>
        </g>
        
        <!-- Code-like Mock Lines -->
        <rect x="25" y="48" width="70" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
        <rect x="25" y="60" width="110" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="25" y="142" width="80" height="4" rx="2" fill="url(#glow-${id})" opacity="0.8" />
        <rect x="240" y="142" width="75" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
      </g>
    </svg>
  `;
}
