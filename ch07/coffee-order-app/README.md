# ☕ 스마트 커피 주문 시스템

단일 매장용 실시간 커피 주문 및 관리 웹 앱입니다.  
고객은 메뉴를 선택하고 옵션을 커스텀하여 주문할 수 있으며, 관리자는 실시간으로 주문을 처리하고 메뉴 상태를 제어할 수 있습니다.

---

## 🚀 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | [Next.js 16](https://nextjs.org) (App Router) |
| 언어 | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| 상태 관리 | [Zustand](https://zustand-demo.pmnd.rs/) (+ `persist` 미들웨어) |
| 백엔드 / DB | [Supabase](https://supabase.com) (PostgreSQL + Realtime + Auth + RLS) |
| 아이콘 | lucide-react |
| 알림 | sonner |

---

## 📁 프로젝트 구조

```
coffee-order-app/
├── app/
│   ├── page.tsx              # 메인 메뉴판 페이지 (고객용)
│   ├── layout.tsx
│   ├── globals.css
│   ├── actions/
│   │   ├── auth.ts           # 로그인/로그아웃 Server Action
│   │   └── order.ts          # 주문 생성 Server Action
│   ├── admin/
│   │   ├── login/            # 관리자 로그인 페이지
│   │   ├── menu/             # 메뉴 품절 관리 페이지
│   │   └── orders/           # 주문 현황판 페이지
│   ├── cart/
│   │   └── page.tsx          # 장바구니 페이지
│   └── order/
│       └── [id]/             # 주문 상태 조회 페이지 (실시간)
├── components/
│   ├── customer/
│   │   ├── MenuBoard.tsx     # 메뉴 목록 & 카테고리 필터
│   │   ├── MenuCard.tsx      # 개별 메뉴 카드
│   │   └── OptionModal.tsx   # 옵션 선택 모달
│   └── ui/                   # shadcn/ui 공통 컴포넌트
├── store/
│   └── cartStore.ts          # 장바구니 전역 상태 (Zustand)
├── lib/
│   └── supabase/             # Supabase 클라이언트 (서버/클라이언트 분리)
└── docs/
    ├── PRD.md                # 제품 요구사항 문서
    └── feature-specification.md
```

---

## ✨ 주요 기능

### 👤 고객 (Customer)

- **메뉴 목록 조회** — 카테고리별(커피, 음료, 디저트) 메뉴 확인
- **옵션 커스텀** — HOT/ICE 온도, 사이즈(Tall/Grande/Venti), 샷·시럽·우유 등 추가 옵션 선택
- **실시간 가격 계산** — 기본 가격 + 사이즈 추가금 + 옵션 추가금 자동 합산
- **장바구니** — 항목 추가·삭제·수량 변경 / 새로고침해도 데이터 유지 (Local Storage)
- **주문 제출** — 고유 주문번호 발급
- **실시간 주문 상태 조회** — `접수 → 제조 중 → 제조 완료` 상태를 Supabase Realtime으로 실시간 확인

### 🛠️ 관리자 (Admin)

- **주문 현황판** — 접수된 주문을 시간순으로 조회
- **주문 상태 변경** — 클릭 한 번으로 상태 변경 (`접수 완료 → 제조 시작 → 제조 완료 / 취소`)
- **품절 처리** — 메뉴별 품절 ON/OFF 스위치, 고객 화면에 즉시 반영
- **접근 제어** — Supabase Auth(JWT) + 서버사이드 미들웨어 + RLS로 인가 처리

---

## ⚙️ 로컬 개발 환경 설정

### 1. 저장소 클론 & 패키지 설치

```bash
git clone <repo-url>
cd coffee-order-app
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

> Supabase 대시보드 → **Project Settings → API** 에서 확인할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인합니다.

---

## 📜 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 코드 검사 |

---

## 🗄️ 데이터베이스 구조 (Supabase)

이 프로젝트는 커피 매장 주문 및 메뉴/옵션 관리를 위해 총 **7개의 테이블**과 **1개의 ENUM 타입**, 그리고 **주문 번호 자동 채번 시퀀스**로 구성되어 있습니다.  
모든 테이블에는 Supabase **RLS (Row Level Security)**가 적용되어 데이터 접근 권한이 DB 레벨에서 보호됩니다.

### 📊 ERD 관계 요약

- `menus` ↔ `option_groups` (via `menu_option_groups` N:M 연결)
- `option_groups` 1:N `option_items`
- `orders` 1:N `order_items` 1:N `order_item_options`

### ⚙️ 커스텀 타입 & 시퀀스

- **`order_status` (ENUM)**: `'PENDING'` (접수 대기) \| `'ACCEPTED'` (제조 중) \| `'COMPLETED'` (제조 완료) \| `'PICKED_UP'` (수령 완료) \| `'CANCELLED'` (주문 취소)
- **`orders_order_number_seq` (Sequence)**: 정수형 주문 번호 (`#1`, `#2`, ...) 자동 채번

### 📋 테이블 명세

| 테이블명 | 주요 컬럼 | 설명 |
|---|---|---|
| `menus` | `id` (PK, UUID), `name`, `price`, `category`, `is_sold_out`, `image_url`, `created_at`, `updated_at` | 메뉴 정보 (기본가, 카테고리, 품절 스위치) |
| `option_groups` | `id` (PK, UUID), `name`, `is_required`, `is_multiple`, `created_at` | 옵션 그룹 (온도, 사이즈, 퍼스널 옵션 등) |
| `option_items` | `id` (PK, UUID), `option_group_id` (FK), `name`, `extra_price`, `created_at` | 개별 옵션 항목 (ICE, HOT, Grande, 샷 추가 등) |
| `menu_option_groups` | `menu_id` (PK, FK), `option_group_id` (PK, FK) | 메뉴와 옵션 그룹 간 N:M 매핑 |
| `orders` | `id` (PK, UUID), `order_number` (Seq), `status` (ENUM), `total_price`, `created_at`, `updated_at` | 주문 헤더 (상태, 총 결제 금액) |
| `order_items` | `id` (PK, UUID), `order_id` (FK), `menu_id` (FK), `menu_name` (스냅샷), `quantity`, `unit_price` (스냅샷) | 주문 내역 상세 (주문 시점 메뉴 정보 스냅샷) |
| `order_item_options` | `id` (PK, UUID), `order_item_id` (FK), `option_item_id` (FK), `name` (스냅샷), `quantity`, `unit_price` (스냅샷) | 주문 항목별 선택 옵션 상세 (주문 시점 옵션 정보 스냅샷) |

### 💡 핵심 설계 포인트

1. **스냅샷 패턴 (Snapshot Pattern)**: `order_items` 및 `order_item_options` 테이블에 주문 당시의 메뉴명, 옵션명, 단가를 스냅샷으로 저장하여, 향후 메뉴나 가격 정보가 변경/삭제되어도 기존 주문 이력의 무결성을 유지합니다.
2. **Supabase Realtime**: `orders` 테이블에 PostgreSQL Changes 구독을 적용하여 고객 주문 추적 페이지와 관리자 현황판 간 실시간 상태 업데이트를 제공합니다.
3. **Row Level Security (RLS)**: 모든 테이블에 RLS를 활성화하여 인증된 관리자 계정만 메뉴 및 주문 상태 조작이 가능하도록 백엔드 DB 레벨에서 보호합니다.

---

## 🔐 관리자 페이지 접근 방법

### 접근 URL

```
http://localhost:3000/admin/orders
```

`/admin` 경로로 직접 접근하면 **미들웨어가 자동으로 로그인 페이지로 리다이렉트**합니다.

### 로그인 흐름

```
/admin/* 접근
    ↓ (미들웨어 검사)
로그인 안 됨 → /admin/login 으로 리다이렉트
    ↓ (이메일 + 비밀번호 입력)
Supabase Auth 인증
    ↓ (성공)
/admin/orders (주문 현황판)으로 이동
```

- 로그인은 **Supabase Auth 계정(이메일 + 비밀번호)** 으로 처리됩니다.
- 관리자 계정은 **Supabase 대시보드 → Authentication → Users** 에서 직접 생성해야 합니다.

### 보안 구조

| 상황 | 동작 |
|------|------|
| 미로그인 상태에서 `/admin/*` 접근 | → `/admin/login` 으로 강제 이동 |
| 이미 로그인된 상태에서 `/admin/login` 접근 | → `/admin/orders` 로 자동 이동 |

- **서버사이드 JWT 검증**: 클라이언트 우회 불가
- **Supabase RLS**: DB 레벨에서도 관리자 권한 체크

### 관리자 페이지 메뉴

| URL | 기능 |
|-----|------|
| `/admin/orders` | 주문 현황판 (상태 변경) |
| `/admin/menu` | 메뉴 품절 관리 |
| `/admin/login` | 로그인 |

> **계정 발급 방법**: Supabase 대시보드 → **Authentication → Users → Add user** 에서 이메일과 비밀번호를 등록하면 해당 계정으로 로그인할 수 있습니다.

---

## 🚢 배포 (Vercel)

```bash
npm run build
```

[Vercel](https://vercel.com) 에 배포하는 것을 권장합니다. Vercel 대시보드에서 **Environment Variables** 에 `.env.local` 의 값을 동일하게 등록해 주세요.

---

## 📄 관련 문서

- [`docs/PRD.md`](./docs/PRD.md) — 제품 요구사항 문서 (기능 명세, 우선순위)
- [`docs/feature-specification.md`](./docs/feature-specification.md) — 상세 기능 명세서
