# 📸 Outstargram

> 사진과 순간을 공유하는 Instagram 클론 프로젝트

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · next-themes

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📰 피드 | 스크롤 기반 포스트 카드 피드 |
| 📖 스토리 | 상단 스토리 슬라이더 |
| 👥 추천 팔로우 | 우측 사이드바 팔로우 추천 |
| 🌙 다크 / 라이트 모드 | `next-themes` 기반 시스템 테마 자동 감지 + 수동 전환 |
| 📱 반응형 레이아웃 | 데스크톱 사이드바 / 모바일 하단 네비게이션 |

---

## 🗂️ 프로젝트 구조

```
outstargram/
├── app/
│   ├── layout.tsx        # 루트 레이아웃 (ThemeProvider, Sidebar, MobileNav 포함)
│   ├── page.tsx          # 홈 피드 페이지
│   └── globals.css       # 전역 스타일
├── components/
│   ├── Sidebar.tsx       # 데스크톱 좌측 사이드바 (네비게이션 + 로고)
│   ├── MobileNav.tsx     # 모바일 상단/하단 네비게이션
│   ├── Stories.tsx       # 스토리 슬라이더
│   ├── PostCard.tsx      # 개별 포스트 카드 (좋아요·댓글·공유·저장)
│   ├── Suggestions.tsx   # 팔로우 추천 사이드바
│   └── ThemeToggle.tsx   # 다크/라이트 모드 토글 버튼
└── lib/
    └── data.ts           # 목업 데이터 (포스트·스토리·추천 유저)
```

---

## 🛠️ 기술 스택

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: [lucide-react](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Font**: Geist (via `next/font/google`)

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm / yarn / pnpm / bun 중 하나

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd outstargram

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
# 또는
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인합니다.

### 빌드 & 프로덕션 실행

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

---

## 📖 학습 리소스

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [next-themes 문서](https://github.com/pacocoursey/next-themes)
- [lucide-react 아이콘 목록](https://lucide.dev/icons/)

---

## 📝 라이선스

이 프로젝트는 학습 목적으로 제작된 클론 프로젝트입니다.
