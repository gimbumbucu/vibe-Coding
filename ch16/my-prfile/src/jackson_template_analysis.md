# 📑 Jackson 포트폴리오 웹사이트 심층 분석 보고서

> **분석 대상 URL**: `https://technext.github.io/jackson/`  
> **문서 목적**: Jackson 포트폴리오 웹사이트의 UI/UX 구조, 디자인 시스템, 컴포넌트 아키텍처 및 인터랙션을 분석하여 모던 포트폴리오 개발 시 벤치마킹 및 디자인 가이드라인으로 활용하기 위함.

---

## 🏗️ 1. 전체 아키텍처 및 레이아웃 구조

Jackson 템플릿은 데스크톱에서 **좌측 고정 사이드바(Fixed Left Sidebar)**와 **우측 메인 스크롤 콘텐츠(Right Scrollable Content)**로 분리된 전형적인 스플릿 뷰(Split View) 구조를 채택하고 있습니다.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Jackson Template Layout 구조                       │
├───────────────────────┬─────────────────────────────────────────────────┤
│   [좌측 고정 사이드바]    │              [우측 메인 스크롤 콘텐츠]             │
│  (Fixed Left Sidebar) │             (Right Main Scroll Area)            │
│                       │                                                 │
│  • 원형 프로필 아바타   │  1. Hero Slider (풀스크린 배경 슬라이더)         │
│  • 이름 & 직무 타이틀   │  2. About Me (자기소개 + 4대 전문영역 카드)      │
│  • 수직 네비게이션 메뉴 │  3. Services (6대 서비스 그리드 & 컬러 보더)     │
│  • ScrollSpy 활성 링크 │  4. Counter Banner (패럴랙스 배경 통계 카운터)   │
│  • 소셜 링크 & Footer │  5. Skills Matrix (컬러풀 프로그레스 바)        │
│                       │  6. Education (아코디언 패널)                   │
│  [모바일: 햄버거 토글] │  7. Experience (수직 타임라인 로드맵)           │
│                       │  8. Work / Portfolio (카테고리 탭 & 갤러리)     │
│                       │  9. Blog (최신 아티클 피드)                     │
│                       │ 10. Contact (연락처 카드 + 문의 폼)              │
└───────────────────────┴─────────────────────────────────────────────────┘
```

### 1) 좌측 고정 사이드바 (`#colorlib-aside`)
- **너비 및 배치**: 데스크톱 기준 `width: 300px` 고정.
- **프로필 영역**: 원형 아바타 이미지(`author-img`), 작성자 이름(`colorlib-logo`), 직무 타이틀 및 위치(`position`).
- **네비게이션 메뉴 (`#colorlib-main-menu`)**:
  - `Home`, `About`, `Services`, `Skills`, `Education`, `Experience`, `Work`, `Blog`, `Contact` 9개 메뉴.
  - 사용자의 스크롤 위치를 실시간 추적하여 현재 메뉴에 언더라인/볼드 활성화 효과를 부여하는 **ScrollSpy** 연동.
- **하단 푸터**: 저작권 텍스트 및 4대 소셜 미디어(Facebook, Twitter, Instagram, LinkedIn) 아이콘 링크.

### 2) 우측 메인 콘텐츠 (`#colorlib-main`)
- **너비 및 배치**: 데스크톱 기준 `calc(100% - 300px)` 전폭 스크롤 영역.
- 섹션별로 넉넉한 상하 패딩(`padding: 7em 0`)과 시맨틱 태그 구조 적용.

### 3) 모바일 반응형 처리
- 768px 이하 모바일/태블릿 화면에서는 좌측 사이드바가 화면 밖으로 숨겨집니다(`transform: translateX(-300px)`).
- 우측 상단 플로팅 햄버거 토글 버튼(`js-colorlib-nav-toggle`) 클릭 시 부드럽게 오프캔버스 드로어(Off-canvas Drawer)로 슬라이드 인/아웃됩니다.

---

## 🎨 2. 디자인 시스템 및 타이포그래피

### 1) 타이포그래피 (Typography)
- **제목/헤딩 폰트**: `Playfair Display` (클래식하고 고급스러운 세리프 서체)
- **본문 폰트**: `Quicksand` (가독성이 우수하고 친근한 둥근 산세리프 서체)
- **아이콘 시스템**: `Icomoon` 및 `Flaticons`

### 2) 컬러 팔레트 (Color Palette)

| 구분 | 색상 코드 | 용도 및 적용 컴포넌트 |
|---|---|---|
| **기본 배경** | `#fafafa` / `#ffffff` | 전체 웹페이지 배경 및 카드 배경 |
| **기본 텍스트** | `#000000` / `#7f7f7f` | 메인 헤딩 및 본문 텍스트 |
| **Primary Blue** | `#2c98f0` | 메인 버튼, 기본 액센트 및 Graphic Design 카드 |
| **Coral Red** | `#ec5453` | Web Design 카드, 핵심 스킬 바 |
| **Yellow Gold** | `#f9bf3f` | Software 카드, 교육 아코디언 포인트 |
| **Purple** | `#a84cb8` | Application 카드, 타임라인 노드 |
| **Teal / Cyan** | `#2fa499` | 타임라인 및 부가 서비스 카드 |
| **Deep Navy** | `#4054b2` | 데이터베이스 및 인프라 스킬 바 |

---

## 📑 3. 섹션별 상세 분석

### 1) Hero Slider (`#colorlib-hero`)
- **구성**: Flexslider를 활용한 2단 풀스크린 배경 슬라이더 (`img_bg_1.jpg`, `img_bg_2.jpg`).
- **오버레이**: 가독성을 높이기 위해 반투명 다크 그라데이션 오버레이 레이어 배치.
- **콘텐츠**:
  - `H1`: *"Hi! I'm Jackson"* / *"I am a Designer"*
  - `H2`: 서브타이틀 및 소개
  - `CTA`: `Download CV <i class="icon-download4"></i>` (이력서 다운로드), `View Portfolio` (포트폴리오 바로가기)

### 2) About Me (`#about`)
- **상단 헤더**: 영문 대문자 서브라벨(`ABOUT US`) + 대형 제목(`WHO AM I?`).
- **본문**: 2개의 문단으로 구성된 자기소개 및 문제 해결 스토리.
- **4대 전문 역량 카드**:
  - `Graphic Design` (Blue Accent)
  - `Web Design` (Red Accent)
  - `Software` (Yellow Accent)
  - `Application` (Purple Accent)
  - 각 카드마다 3D 하단 컬러 보더(`border-bottom: 2px solid [Color]`)와 마우스 호버 시 위로 떠오르는 리프팅 애니메이션 적용.

### 3) Services / What I Do (`#services`)
- 6개의 서비스 아이템 그리드 (Innovative Ideas, Software, Application, Graphic Design, Web Design, Mobile Apps).
- 각 카드 중앙에 원형 아이콘 박스와 호버 시 그림자(Box-shadow) 확대 효과.

### 4) Counter Banner (`#colorlib-counter`)
- **패럴랙스 배경**: 배경 이미지가 고정된 상태에서 스크롤되는 Parallax 배너.
- **4대 핵심 지표**:
  - ☕ 309 Cups of coffee
  - 💻 356 Projects completed
  - 👥 30 Clients
  - 🤝 10 Partners
- **애니메이션**: 스크롤이 배너 위치에 도달했을 때(Waypoint 90% 트리거) 0부터 목표 수치까지 부드럽게 증가하는 `countTo` 카운트업 실행.

### 5) Skills Matrix (`#skills`)
- 6대 기술 스택(Photoshop, jQuery, HTML5, CSS3, WordPress, SEO)의 숙련도를 프로그레스 바로 표시.
- 각 기술마다 고유한 무지개톤 색상을 부여하여 시각적 지루함을 방지.
- 스크롤 시 0%에서 목표 퍼센트(75%, 60%, 85%, 90% 등)로 부드럽게 차오르는 애니메이션.

### 6) Education & Experience (`#education`, `#experience`)
- **Education (교육/학력)**:
  - Bootstrap Accordion Collapse 컴포넌트 적용.
  - 마스터 학위, 학사 학위, 디플로마 등을 접고 펼칠 수 있는 인터랙티브 패널.
- **Experience (경력/타임라인)**:
  - 중앙 수직선(Vertical Line)과 원형 아이콘 노드(`timeline-icon`).
  - 시간 역순(Full Stack Developer 2017-2018 -> Front End Developer 2017-2018 등)으로 배치된 타임라인 카드.

### 7) Work / Portfolio (`#work`)
- **카테고리 필터 탭**: `Graphic Design`, `Apps`, `Software` 등 분류 탭.
- **갤러리 그리드**: 반응형 이미지 카드 그리드.
- **호버 오버레이**: 이미지에 마우스를 올리면 다크 블루 그라데이션 오버레이가 나타나며 프로젝트명, 카테고리 태그, 좋아요/조회수 아이콘이 페이드인.

### 8) Contact (`#contact`)
- **좌측 연락처 카드**: 이메일, 전화번호, 사무실 주소 정보를 담은 3개의 아이콘 카드.
- **우측 문의 폼**: 이름, 이메일, 제목, 메시지를 입력하는 미니멀한 폼과 'Send Message' 제출 버튼.

---

## 💡 4. 현재 포트폴리오(ch16)와의 비교 분석 및 벤치마킹 포인트

| 비교 항목 | Jackson 템플릿 | 현재 ch16 포트폴리오 | 벤치마킹 및 시너지 아이디어 |
|---|---|---|---|
| **레이아웃** | 좌측 고정 사이드바 (300px) + 우측 본문 | 상단 고정 헤더 (GNB) + 중앙 컨테이너 | 사이드바 고정형 레이아웃 옵션 도입 고려 가능 |
| **테마 시스템** | 라이트 모드 단일 테마 | **사이버 다크 + 미니멀 라이트 듀얼 테마** (우위) | Jackson의 카드별 컬러풀 보더 포인트를 라이트 모드에 반영 |
| **프로젝트 정보** | 썸네일 이미지 및 단순 링크 위주 | **상세 트러블슈팅 & 아키텍처 모달** (우위) | Jackson의 카드 호버 오버레이 스타일을 썸네일에 접목 |
| **애니메이션** | jQuery Waypoint + Animate.css | **Pure JS IntersectionObserver + CSS 키프레임** (우위) | 종속성 없는 가벼운 런타임 유지 |
| **엔지니어링 철학** | 단순 자기소개 | **5대 개발 철학 (`DEVELOPMENT_PHILOSOPHY.md`) 연동** (우위) | 엔지니어링 깊이와 문제 해결 역량 부각 |

---

*본 문서는 `https://technext.github.io/jackson/`의 전체 소스 코드 및 디자인 시스템을 분석하여 작성되었습니다.*
