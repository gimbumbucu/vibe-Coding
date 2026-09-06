# 2.5D Interactive Resume (김일남 - Junior Web/UX/UI Designer)

## 프로젝트 소개 (Project Overview)
이 프로젝트는 HTML, CSS, JavaScript만을 사용하여 제작된 **2.5D 인터랙티브 자기소개서(이력서) 웹 페이지**입니다. 사용자의 스크롤에 반응하여 3D 공간에서 명함이 회전하고 확대되는 동적인 시각적 효과를 구현하였습니다. 

이 페이지는 한국화장품 신입 웹/UX/UI 디자이너 지원을 위해 기획되었으며, '퍼포먼스 뷰티 디자이너'로서 지원자의 역량과 디자인 철학을 직관적이고 몰입감 있게 전달하는 데 목적이 있습니다.

## 주요 기능 및 인터랙션 (Key Features)
자바스크립트의 스크롤 이벤트를 활용하여 총 4단계의 자연스러운 인터랙션을 구현했습니다:
- **Stage 1 (정렬)**: 기울어져 있던 명함이 정면을 향해 평평해집니다.
- **Stage 2 (플립)**: 명함이 Y축을 기준으로 180도 회전하며 명함 뒷면을 드러냅니다.
- **Stage 3 (확대)**: 명함이 전체 화면 크기에 맞춰(90vw, 90vh) 부드럽게 확대됩니다.
- **Stage 4 (등장)**: 명함 뒷면에 담긴 지원동기 및 포부 등 자기소개서 내용이 페이드인(Fade-in) 됩니다.

## 디자인 특징 (Design System)
- **Glassmorphism**: 명함 뒷면에 반투명한 블러 효과(`backdrop-filter`)를 적용하여 뷰티 브랜드에 어울리는 세련되고 현대적인 무드를 연출했습니다.
- **Typography**: 감각적인 브랜드 이미지를 위해 'Noto Serif KR', 'Pretendard', 'Inter' 폰트를 조화롭게 배치하여 가독성과 심미성을 동시에 잡았습니다.
- **Color Palette**: 부드러운 핑크 베이지(`--primary-color: #f7e8e3`)와 딥 핑크 골드(`--secondary-color: #dcb3a8`)를 메인 테마 컬러로 사용하여 화장품 브랜드의 아이덴티티를 살렸습니다.

## 파일 구조 (File Structure)
- `index.html`: 프로젝트의 마크업 뼈대 및 명함의 앞/뒷면 구조 정의
- `style.css`: 테마 컬러, 반응형 레이아웃, 3D 원근감(Perspective) 및 글래스모피즘 스타일 정의
- `script.js`: 스크롤 진행률을 계산(Scroll Fraction)하여 `rotateX`, `rotateY`, `rotateZ`, `width`, `height` 등을 동적으로 조작하는 메인 로직
- `cover_letter_draft.md`: 명함 뒷면에 포함된 자기소개서 본문 초안 마크다운 파일

## 실행 방법 (How to Run)
별도의 서버나 빌드 과정 없이 다운로드 후 `index.html` 파일을 최신 웹 브라우저(Chrome, Safari, Edge 권장)에서 열면 바로 확인할 수 있습니다. 스크롤을 천천히 내리면서 명함의 변화를 확인해보세요.
