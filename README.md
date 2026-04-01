# CLAUDE.md

## 프로젝트 개요
순수 HTML/CSS/JavaScript로 구현하는 웹 프로젝트

---

## 기술 스택

- **HTML5** — 마크업
- **CSS3** — 스타일링 (Bootstrap 5 CDN 사용)
- **JavaScript (ES6+)** — 로직 처리
- 외부 라이브러리 **사용 금지** (Bootstrap 제외)

---

## 파일 구조

```
project/
├── CLAUDE.md
├── index.html
├── css/
│   └── (스타일 파일)
├── js/
│   └── (스크립트 파일)
└── html/
    └── (추가 페이지)
```

---

## 네이밍 컨벤션

- 모든 파일명은 **소문자** 사용
- 단어 구분은 **하이픈(-)** 사용
  - ✅ `main-style.css`, `main-app.js`
  - ❌ `mainStyle.css`, `MainApp.js`
- HTML id/class도 동일하게 하이픈 방식 적용
  - ✅ `id="result-area"`, `class="item-card"`
  - ❌ `id="resultArea"`, `class="itemCard"`

---

## CSS 규칙

- **Bootstrap 5** CDN으로 로드 (로컬 파일 금지)
- 커스텀 스타일은 `css/` 폴더에 작성
- Bootstrap 유틸리티 클래스를 최대한 활용하고, 커스텀 CSS는 최소화
- 색상 등 공통 값은 CSS 변수(`:root`)로 관리

```css
:root {
  --color-primary: #2c3e50;
}
```

- `<link>` 순서: Bootstrap CDN → 커스텀 CSS

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="css/style.css">
```

---

## JavaScript 규칙

- 함수는 **단일 책임 원칙** 적용 — 하나의 함수는 하나의 역할만
- 함수/변수명은 역할이 명확한 **영어 camelCase** 사용
- 매직 넘버는 반드시 **상수(const)**로 선언
- 블록 간 **빈 줄**로 논리 단위 구분
- 복잡한 로직에는 **한글 주석** 작성
- `var` 사용 금지 — `const` / `let` 만 사용
- DOM 조작은 함수로 분리하여 재사용성 확보
- 하나의 함수에 **50줄 이상** 작성 금지 — 분리할 것
- `<script>` 태그는 `</body>` 직전에 배치

---

## HTML 규칙

- 시맨틱 태그 적극 활용 (`<main>`, `<section>`, `<header>` 등)
- Bootstrap 그리드 시스템 기반으로 레이아웃 구성

---

## 금지 사항

- `var` 키워드 사용 금지
- 인라인 스타일(`style=""`) 직접 작성 금지 — class로 처리
- 외부 JS 라이브러리 추가 금지 (jQuery, lodash 등)
- 파일명 대문자 사용 금지

---

## 참고 사항

- 브라우저 기본 지원 범위: Chrome / Edge 최신 버전 기준
- 별도 빌드 도구 없이 파일을 직접 열어서 실행 가능해야 함 (`file://` 프로토콜)
- 반응형 레이아웃 적용 (모바일 대응)