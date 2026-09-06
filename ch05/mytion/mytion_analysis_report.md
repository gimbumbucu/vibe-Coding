# 🔍 Mytion 프로젝트 분석 보고서 (Senior Frontend Engineer 관점)

본 보고서는 `mytion` 프로젝트의 코드베이스를 면밀히 분석한 결과입니다. 현재 구현된 기술 스택, 아키텍처 패턴, 핵심 기능의 동작 원리를 짚어보고, 시니어 엔지니어 관점에서의 칭찬할 점과 향후 개선 방안을 제안합니다.

---

## 1. 아키텍처 및 기술 스택 (Architecture & Tech Stack)

이 프로젝트는 최신 React 생태계와 안정적인 라이브러리 조합을 통해 Notion 스타일의 에디터를 훌륭하게 구현하고 있습니다.

- **프레임워크:** Next.js 16 (App Router 기반)
- **UI/뷰:** React 19, Tailwind CSS v4
- **에디터 코어:** Tiptap v3 (Headless Rich Text Editor)
- **상태 관리:** Zustand (with persist middleware)
- **기타 도구:** tippy.js (팝업 UI), uuid (고유 식별자)

> [!TIP]
> **Tiptap**을 선택한 것은 매우 훌륭한 결정입니다. Notion과 같은 블록 기반 에디터를 구현할 때, UI에 구애받지 않고(Headless) 커스텀 확장이 자유로운 Tiptap은 최고의 선택지 중 하나입니다.

---

## 2. 핵심 로직 및 컴포넌트 분석

### 📁 상태 관리 (`src/store/useNoteStore.ts`)
Zustand를 활용해 전역 상태를 매우 직관적으로 관리하고 있습니다.
- `persist` 미들웨어를 사용하여 `mytion-notes`라는 키로 `localStorage`에 자동 저장되도록 구성했습니다.
- `addNote`, `updateNote`, `deleteNote`, `setActiveNote` 등 노트에 필요한 CRUD 로직이 깔끔하게 분리되어 있습니다.

### 📝 에디터 (`src/components/NotionEditor.tsx`)
Tiptap의 `useEditor` 훅을 활용하여 에디터 인스턴스를 초기화하고 관리합니다.
- **다양한 Extension 활용:** `StarterKit`, 표(Table), 체크리스트(TaskList), 마크다운(Markdown) 플러그인까지 조합하여 리치 텍스트 환경을 완성했습니다.
- **자동 저장 최적화:** `onUpdate` 콜백 내에서 글이 수정될 때마다 Zustand의 `updateNote`를 호출해 로컬 스토리지에 자동 저장합니다. 첫 줄을 추출해 제목으로 저장하는 로직(Title Extraction)도 구현되어 있습니다.
- **상태 동기화 방어 로직:** `useRef`(`isUpdatingFromStore`)를 사용하여 스토어 변경으로 인한 에디터 콘텐츠 업데이트 시 무한 루프나 불필요한 이벤트 방출(emitUpdate: false)을 방지하는 세심한 처리가 돋보입니다.

### ⚡ 슬래시 명령어 (`src/components/SlashCommand.ts` & `CommandList.tsx`)
Notion의 핵심 UX인 `/` 명령어를 직접 Extension으로 구현했습니다.
- **Tippy.js 연동:** 에디터 내부의 특정 좌표(`clientRect`)에 팝업을 띄우기 위해 Tippy.js를 사용했습니다. 이는 Tiptap 생태계에서 가장 권장되는 패턴입니다.
- **키보드 내비게이션:** `CommandList.tsx`에서 `useImperativeHandle`을 통해 방향키(ArrowUp, ArrowDown)와 Enter 키로 명령어를 선택할 수 있도록 접근성을 고려했습니다.

### 🎨 UI & 레이아웃 (`src/components/Sidebar.tsx` & `globals.css`)
- **사이드바:** Hydration Mismatch를 방지하기 위해 `mounted` 상태를 체킹하는 올바른 패턴을 사용했습니다.
- **스타일링:** Tailwind CSS와 함께 `globals.css`에 `.ProseMirror` 클래스를 직접 제어하여 Notion 특유의 타이포그래피(행간, 여백, 리스트 스타일 등)를 정교하게 모방했습니다.

---

## 3. 💡 시니어 관점에서의 강점 (Strengths)

1. **Hydration 에러 방지 패턴:** Zustand의 `persist` 사용 시 발생할 수 있는 SSR과 CSR의 상태 불일치(Hydration 에러)를 인지하고, `useEffect`를 통한 렌더링 지연(`mounted` 플래그)으로 완벽히 대응했습니다.
2. **에디터 사이드 이펙트 제어:** `NotionEditor.tsx`에서 Tiptap 콘텐츠를 강제로 교체할 때 `setTimeout`과 `isUpdatingFromStore` 플래그를 조합하여 커서 튐이나 무한 루프를 방어한 점은 에디터 개발 경험이 돋보이는 부분입니다.
3. **적절한 관심사 분리:** 비즈니스 로직(Zustand), UI 컴포넌트(React), 에디터 확장 로직(Tiptap Extension)이 각각 독립적인 파일로 잘 분리되어 있어 유지보수성이 높습니다.

---

## 4. 🚀 향후 개선 제안 (Areas for Improvement)

더 완벽한 프로덕션 레벨로 끌어올리기 위한 몇 가지 제안입니다.

> [!WARNING]
> **성능 최적화 (Debouncing)**
> 현재 `NotionEditor`의 `onUpdate`는 사용자가 타이핑할 때마다 즉시 실행되며 Zustand를 업데이트합니다.
> **제안:** `lodash/debounce` 등을 사용하여 `onUpdate` 트리거를 500ms~1s 정도 지연시키면 렌더링 성능과 향후 서버(API) 연동 시 부하를 크게 줄일 수 있습니다.

> [!IMPORTANT]
> **에디터 제목 렌더링 분리**
> Notion은 문서의 제목과 본문 블록이 분리되어 있습니다. 현재 프로젝트는 첫 줄의 텍스트를 제목으로 파싱하고 있으나, 첫 줄에 표나 이미지가 오면 제목 처리가 모호해집니다.
> **제안:** Tiptap의 Document 노드 스키마를 커스텀하여 첫 번째 블록은 항상 Heading이 되도록 강제(`Title` 노드 확장)하거나, 에디터 위에 별도의 `<input>`을 두어 제목을 상태로 분리하는 것이 UX 측면에서 좋습니다.

> [!NOTE]
> **데이터 구조 (Tree Structure) 도입**
> 현재 `useNoteStore`의 `notes`는 1차원 배열입니다. Notion의 진정한 강점은 페이지 내부에 하위 페이지를 무한히 생성할 수 있는 계층 구조(Tree)입니다.
> **제안:** 향후 `parentId` 필드를 추가하고 재귀적(Recursive)인 컴포넌트로 사이드바를 리팩토링하면 더 완벽한 Notion 클론이 될 것입니다.

---

전반적으로 기술 스택에 대한 이해도가 높고 핵심 동작이 매끄럽게 잘 짜인 훌륭한 프로젝트입니다! 추가적인 기능 구현이나 코드 개선이 필요하다면 언제든 말씀해주세요.
