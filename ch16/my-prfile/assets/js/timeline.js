/**
 * Career & Education Timeline Module
 * Renders chronological roadmap of software engineering milestones.
 */

export const timelineData = [
  {
    period: "2026.08",
    title: "빅데이터 GIS & 클라우드 업무 자동화 (Ch 15)",
    role: "Data & Cloud Automation Lead",
    description: "전국 240만 건 소상공인 상가 데이터 Parquet 컬럼형 변환 및 VWorld 국토공간정보 오픈플랫폼 연동(Commercial Pulse), Google Apps Script 기반 영수증 OCR 가계부 자동화 시스템 구축."
  },
  {
    period: "2026.08",
    title: "TDD 풀스택 개발 & 맞춤형 에이전트 스킬 (Ch 11)",
    role: "Fullstack & Agent Engineer",
    description: "Pytest 기반 TDD 풀스택 투두리스트(Vibe TodoList)를 개발하여 100% 테스트 커버리지 달성 및 실시간 주식/날씨 자동 분석 리포트 에이전트 스킬 파이프라인 완성."
  },
  {
    period: "2026.08",
    title: "실시간 AI 어시스턴트 플랫폼 Jemini 개발 (Ch 10)",
    role: "Fullstack AI Specialist",
    description: "Google Gemini 2.0 모델 기반 FastAPI SSE 스트리밍 백엔드와 React 19 FSD 프론트엔드 구축. Supabase PostgreSQL 연동 및 Render 클라우드 배포 파이프라인 완성."
  },
  {
    period: "2026.08",
    title: "멀티 에이전트 오케스트레이션 시스템 구축 (Ch 09)",
    role: "AI Agent Architect",
    description: "Architect, Planner, Backend, Frontend, Reviewer 5대 전문 서브에이전트 역할 분담 및 워크플로우 자동화 파이프라인 설계."
  },
  {
    period: "2026.08",
    title: "스마트 커피 키오스크 & 주문 웹 앱 개발 (Ch 07)",
    role: "Frontend Engineer",
    description: "Next.js 15 & Zustand 기반의 옵션 커스터마이징, 실시간 장바구니 및 영수증 티켓 결제 주문 시스템 설계 및 개발."
  },
  {
    period: "2026.08",
    title: "크로스플랫폼 노션 클론 Mytion 개발 (Ch 05)",
    role: "Desktop & Web Engineer",
    description: "Next.js 15 & Rust Tauri v2를 활용한 블록 기반 문서 편집기 및 10MB 미만 초경량 네이티브 데스크톱 앱 빌드."
  },
  {
    period: "2026.08",
    title: "2.5D 인터랙티브 이력서 & 웹 기초 인터랙션 (Ch 01 ~ 04)",
    role: "Frontend Creative Developer",
    description: "3D 마우스 틸트 패럴랙스 카드, 파티클 배경 캔버스 및 웹 슬라이드 자동 생성 스킬(make-slide) 구축."
  }
];

export function initTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = `
    <div class="timeline-line"></div>
    ${timelineData.map(item => `
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div class="timeline-meta">
            <span class="timeline-period">${item.period}</span>
            <span class="timeline-role">${item.role}</span>
          </div>
          <div class="timeline-title">${item.title}</div>
          <p class="timeline-desc">${item.description}</p>
        </div>
      </div>
    `).join('')}
  `;
}
