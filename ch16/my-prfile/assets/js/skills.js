/**
 * Skills & Tech Stack Matrix Module
 * Contains skill definitions, category filter tabs, and animated progress bars.
 */

export const skillsData = [
  // Frontend
  {
    category: 'frontend',
    categoryName: '프론트엔드',
    name: 'React 19 & Next.js 15',
    level: 95,
    exp: 'App Router, Server Actions, FSD 아키텍처, 실시간 SSE 토큰 스트리밍 연동'
  },
  {
    category: 'frontend',
    categoryName: '프론트엔드',
    name: 'TypeScript',
    level: 92,
    exp: '엄격한 정적 타입 안전성, 제네릭 설계, Zod 스키마 검증 및 인터페이스 모델링'
  },
  {
    category: 'frontend',
    categoryName: '프론트엔드',
    name: 'Tailwind CSS & CSS System',
    level: 96,
    exp: '디자인 토큰 기반 스타일링, 에디토리얼 레이아웃, 다크/라이트 테마 및 키프레임 애니메이션'
  },
  {
    category: 'frontend',
    categoryName: '프론트엔드',
    name: 'State Management (Zustand)',
    level: 90,
    exp: '옵션 해시 기반 상태 분리, 미들웨어 로컬스토리지 영속성 및 전역 상태 최적화'
  },

  // Backend & AI
  {
    category: 'backend',
    categoryName: '백엔드 & AI',
    name: 'Python 3.12 & FastAPI',
    level: 94,
    exp: '비동기 Async API, Pydantic v2 유효성 검사, Uvicorn 및 RESTful 엔드포인트'
  },
  {
    category: 'backend',
    categoryName: '백엔드 & AI',
    name: 'Google Gemini 2.0 Flash / Pro',
    level: 92,
    exp: 'Google GenAI SDK, 멀티턴 세션 관리, SSE 타자기 스트리밍, 프롬프트 엔지니어링'
  },
  {
    category: 'backend',
    categoryName: '백엔드 & AI',
    name: 'Pytest (TDD 방법론)',
    level: 90,
    exp: '테스트 주도 개발(TDD) 워크플로우, 단위/통합 테스트 커버리지 100% 달성'
  },
  {
    category: 'backend',
    categoryName: '백엔드 & AI',
    name: 'SQLAlchemy & SQLite / PostgreSQL',
    level: 88,
    exp: 'ORM 데이터 모델링, 세션 트랜잭션 핸들링, 마이그레이션 관리'
  },

  // Database & Cloud
  {
    category: 'data_cloud',
    categoryName: '데이터 & 클라우드',
    name: 'Apache Parquet & DuckDB',
    level: 90,
    exp: '전국 240만 건 공간 빅데이터 압축 인덱싱, 메모리 매핑 기반 100ms 이하 초고속 쿼리'
  },
  {
    category: 'data_cloud',
    categoryName: '데이터 & 클라우드',
    name: 'Supabase (PostgreSQL)',
    level: 89,
    exp: 'PostgreSQL 스키마 설계, 세션/대화 로그 실시간 동기화, RLS 보안 정책'
  },
  {
    category: 'data_cloud',
    categoryName: '데이터 & 클라우드',
    name: 'Cloud PaaS (Render / Vercel)',
    level: 88,
    exp: 'render.yaml 기반 IaC 환경 구성, 프론트/백엔드 분리 배포 파이프라인'
  },
  {
    category: 'data_cloud',
    categoryName: '데이터 & 클라우드',
    name: 'Google Apps Script (GAS) & Clasp',
    level: 91,
    exp: 'Google Drive OCR 파싱, Sheets API 실시간 연동, TypeScript & Clasp 기반 자동화'
  },

  // Desktop & Agent
  {
    category: 'desktop_agent',
    categoryName: '데스크톱 & 에이전트',
    name: 'Tauri v2 (Rust Native)',
    level: 85,
    exp: '웹 기술 기반 10MB 미만 초경량 Windows 네이티브 실행 파일 빌드 및 패키징'
  },
  {
    category: 'desktop_agent',
    categoryName: '데스크톱 & 에이전트',
    name: 'PySide6 (Qt for Python)',
    level: 88,
    exp: 'HTTP 헤더 밀리초 정밀 서버시간 동기화 매크로 GUI 및 백그라운드 스레드 제어'
  },
  {
    category: 'desktop_agent',
    categoryName: '데스크톱 & 에이전트',
    name: 'AI Agent Architecture & Skills',
    level: 95,
    exp: '5대 서브에이전트(Architect/Planner/Dev 등) 오케스트레이션 및 전용 스킬 구축'
  },
  {
    category: 'desktop_agent',
    categoryName: '데스크톱 & 에이전트',
    name: 'GIS & VWorld OpenPlatform',
    level: 87,
    exp: '국토공간정보 오픈플랫폼 2D/3D 배경지도 연동, Leaflet.js 기반 대용량 마커 클러스터링'
  }
];

export function initSkills() {
  const container = document.getElementById('skills-container');
  const tabs = document.querySelectorAll('.skills-tab-btn');
  if (!container) return;

  const jacksonColors = ['#2c98f0', '#ec5453', '#f9bf3f', '#a84cb8', '#2fa499', '#40acff'];

  function renderSkills(category = 'all') {
    const filtered = category === 'all'
      ? skillsData
      : skillsData.filter(s => s.category === category);

    container.innerHTML = filtered.map((skill, index) => {
      const color = jacksonColors[index % jacksonColors.length];
      return `
        <div class="skill-card reveal" data-category="${skill.category}">
          <div class="skill-header">
            <div class="skill-info">
              <div class="skill-name">${skill.name}</div>
            </div>
            <span class="skill-percent" style="color: ${color};">${skill.level}%</span>
          </div>
          <div class="skill-progress-track">
            <div class="skill-progress-fill" style="background-color: ${color}; width: 0%;" data-level="${skill.level}%"></div>
          </div>
          <p class="skill-exp-desc">${skill.exp}</p>
        </div>
      `;
    }).join('');

    // Animate progress bars
    setTimeout(animateProgressBars, 50);
  }

  function animateProgressBars() {
    const progressFills = container.querySelectorAll('.skill-progress-fill');
    progressFills.forEach(fill => {
      const targetWidth = fill.getAttribute('data-level');
      fill.style.width = targetWidth;
    });
  }

  // Tab click events
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-category');
      renderSkills(category);
    });
  });

  // Initial render
  renderSkills('all');
}
