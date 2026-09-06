# Vibe Todo List - Frontend ⚛️

이 디렉터리는 Vibe Todo List 애플리케이션의 사용자 인터페이스(UI)를 포함하고 있습니다. **React.js, TypeScript, Vite**를 기반으로 구축되었습니다.

## 🛠️ 기술 스택

- **프레임워크**: React.js
- **언어**: TypeScript
- **빌드 툴**: Vite
- **패키지 관리자**: `npm`
- **스타일링**: Vanilla CSS
- **API 통신**: `axios`

## 🚀 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
개발 서버가 실행되면 브라우저에서 `http://localhost:5173`으로 접속할 수 있습니다.

## 🎨 스타일링 및 UI 컨벤션

이 프로젝트는 TailwindCSS나 외부 UI 라이브러리를 사용하지 않고, **오직 순수 CSS(Vanilla CSS)**만으로 스타일링을 진행합니다 (`src/index.css`).

- **디자인 철학 (Vibe)**: 단순한 UI를 넘어, 부드러운 그라데이션, 글래스모피즘(Glassmorphism), 마이크로 애니메이션, 호버 이펙트 등을 활용하여 **현대적이고 아름다운(Premium) 사용자 경험**을 제공해야 합니다.

## 📝 주요 코딩 컨벤션

- **API 통신**: 모든 백엔드 통신 로직은 `src/api/todoApi.ts`에 중앙 집중화되어 있습니다.
- **TypeScript Import**: Vite(esbuild) 컴파일 오류를 방지하기 위해 타입(Type/Interface)을 불러올 때는 반드시 `import type { ... }` 문법을 사용해야 합니다.

## 🧪 타입 검사 및 빌드

코드를 수정하거나 파일 위치를 변경한 후에는 TypeScript 에러가 없는지 반드시 확인해야 합니다.
```bash
npm run build
# 또는
npx tsc
```
