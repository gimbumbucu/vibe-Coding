/**
 * Tech Insights & Engineering Articles Module
 * Jackson-style Blog / Articles section renderer
 */

export const insightsData = [
  {
    id: "parquet-duckdb-optimization",
    title: "240만 건 공간 빅데이터 최적화: CSV에서 Parquet & DuckDB로 100ms 쿼리 달성기",
    category: "Big Data & GIS",
    categoryClass: "tag-data",
    date: "2026.08.28",
    readTime: "5 min read",
    summary: "전국 240만 건 소상공인 상가 공공데이터를 컬럼형 Parquet 포맷으로 변환하여 스토리지 85% 절감 및 메모리 매핑 기반 100ms 이하 초고속 반경 검색을 구현한 실전 튜닝 기록입니다.",
    tags: ["Apache Parquet", "DuckDB", "FastAPI", "VWorld GIS"],
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    link: "src/workspace_projects_analysis.md"
  },
  {
    id: "tauri-mytion-architecture",
    title: "Next.js 15와 Rust Tauri v2로 10MB 미만 초경량 데스크톱 노션 클론 만들기",
    category: "Desktop & Rust",
    categoryClass: "tag-desktop",
    date: "2026.08.25",
    readTime: "6 min read",
    summary: "무거운 Electron 대신 Rust 기반 Tauri v2 네이티브 런타임을 결합하여 10MB 미만의 메모리 친화적 데스크톱 생산성 도구를 설계하고 오프라인 우선 영속성을 확보한 과정입니다.",
    tags: ["Next.js 15", "Tauri v2", "Rust", "Offline-First"],
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    link: "src/workspace_projects_analysis.md"
  },
  {
    id: "gemini-sse-streaming",
    title: "Google Gemini 2.0과 SSE 실시간 토큰 스트리밍: 네트워크 단절 대응과 FSD 아키텍처",
    category: "AI & Fullstack",
    categoryClass: "tag-ai",
    date: "2026.08.20",
    readTime: "7 min read",
    summary: "LLM의 긴 생성 지연을 해소하기 위한 Server-Sent Events(SSE) 파이프라인 설계, TextDecoderStream 기반 프론트엔드 예외 복구, 그리고 FSD 모듈화 전략을 정리했습니다.",
    tags: ["Gemini 2.0", "SSE Streaming", "React 19", "FSD"],
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    link: "src/workspace_projects_analysis.md"
  },
  {
    id: "pytest-tdd-fullstack",
    title: "Pytest TDD 사이클과 100% 테스트 커버리지로 결함 없는 풀스택 서비스 구축",
    category: "TDD & DevOps",
    categoryClass: "tag-devops",
    date: "2026.08.15",
    readTime: "4 min read",
    summary: "'실패하는 테스트 작성 -> 최소 구현 -> 리팩토링'의 엄격한 TDD 사이클을 백엔드 REST API에 적용하여 유지보수성과 배포 안정성을 극대화한 실무 사례입니다.",
    tags: ["TDD", "Pytest", "FastAPI", "Render CI/CD"],
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    link: "src/workspace_projects_analysis.md"
  }
];

export function initInsights() {
  const container = document.getElementById('insights-container');
  if (!container) return;

  container.innerHTML = insightsData.map(article => `
    <article class="insight-card reveal" data-id="${article.id}">
      <div class="insight-header">
        <span class="insight-badge ${article.categoryClass}">${article.category}</span>
        <span class="insight-readtime">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:-1px; margin-right:3px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${article.readTime}
        </span>
      </div>
      
      <div class="insight-title-wrapper">
        <span class="insight-icon" style="color: var(--color-1); display:flex; align-items:center;">${article.icon}</span>
        <h3 class="insight-title">${article.title}</h3>
      </div>

      <p class="insight-summary">${article.summary}</p>

      <div class="insight-footer">
        <div class="insight-tags">
          ${article.tags.map(t => `<span class="insight-tag">#${t}</span>`).join('')}
        </div>
        <div class="insight-date">${article.date}</div>
      </div>
    </article>
  `).join('');
}
