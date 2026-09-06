**Next.js(App Router)** 기반으로 구축할 `coffee-order-app`의 **기술 스택**과 **기능 명세서**입니다.

---

## 1. 기술 스택 (Tech Stack)

Next.js의 풀스택 역량을 활용하여 **프론트엔드와 백엔드(API/Server Actions)를 하나의 프로젝트**로 구성하는 최신 아키텍처 방식입니다.

| 구분                   | 기술 / 라이브러리                                    | 선정 이유                                                                       |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Framework**          | **Next.js (App Router)**                             | SSR/SSG 지원, Route Handlers 및 Server Actions를 활용한 백엔드 API 일체화       |
| **Language**           | **TypeScript**                                       | 메뉴/옵션/주문 데이터의 복잡한 타입 안정성 확보                                 |
| **Styling**            | **Tailwind CSS** + **shadcn/ui**                     | 반응형 모바일 First UI 구현 및 속도 향상, 완성도 높은 UI 컴포넌트 제공          |
| **State (클라이언트)** | **Zustand**                                          | 장바구니 및 옵션 선택 상태 관리 (persist 미들웨어로 `localStorage` 동기화 용이) |
| **Database & SDK**     | **PostgreSQL** + **Supabase SDK** (`@supabase/supabase-js`) | DB 조작(CRUD)과 실시간 통신의 생태계를 통합하여 복잡성을 제거하기 위해 Prisma 대신 채택 |
| **Real-time**          | **Supabase Realtime**                                | 관리자의 상태 변경을 사용자 화면에 실시간 노출 (Vercel 서버리스 Timeout 문제 회피를 위해 SSE 대신 WebSocket 기반 채택) |
| **Auth & Security**    | **Supabase Auth**                                    | JWT 기반의 관리자 인증, Next.js Middleware 라우트 보호 및 DB Row Level Security(RLS) 통제 |
| **Icon / Toast**       | **Lucide React**, **Sonner**                         | 직관적인 아이콘 및 알림 UI 제공                                                 |

---

## 2. 기능 명세서 (Feature Specification)

### 2.1 사용자 기능 (Customer Side)

#### 1) 메뉴 목록 및 카테고리 (`/`)

* **카테고리 탭:** 전체, 커피, 음료, 디저트 등 카테고리 필터링.
* **메뉴 카드:** 메뉴 이미지, 메뉴명, 기본 가격, **[품절]** 여부 표시.
* **품절 제어:** 품절 상태인 메뉴는 클릭 불가능 처리 및 'Sold Out' 배지 노출.
* **주문 세션 복구:** 로컬 스토리지에 진행 중인 주문(`orderId`)이 있을 경우 화면 상단에 '진행 중인 주문 상태 보기' 배너를 노출하여 추적 페이지로 즉시 이동 지원.

#### 2) 메뉴 상세 및 옵션 선택 모달

* **온도 선택 (필수):** `HOT` / `ICE` (라디오 버튼)
* **사이즈 선택 (필수):** `Tall` (+0원), `Grande` (+500원), `Venti` (+1,000원)
* **퍼스널 옵션 (선택):**
* 샷 추가 (수량 `+`/`-`, 개당 +500원, 최대 5개)
* 시럽 추가 (수량 `+`/`-`, 개당 +500원, 최대 5펌프)
* 우유 변경 (일반, 저지방, 오트유 +500원)


* **실시간 가격 계산:** 선택된 옵션에 따른 단가 실시간 합산.
* **장바구니 담기:** 선택한 옵션 조합과 수량을 로컬 스토리지 기반 장바구니 상태에 추가.

#### 3) 장바구니 (`/cart`)

* **목록 조회:** 담은 메뉴, 선택 옵션 리스트, 수량, 총 금액 표시.
* **수량/항목 변경:** 수량 조절(`+`/`-`) 및 특정 항목 삭제.
* **주문 생성:** [주문하기] 버튼 클릭 시 주문 데이터(Order) 생성 요청 후 주문 대기 페이지로 이동.

#### 4) 실시간 주문 추적 (`/order/[orderId]`)

* **주문 정보 확인:** 주문 번호, 주문 일시, 주문 내역, 총 결제 금액.
* **실시간 대기 상태:**
* `PENDING` (접수 대기) ➔ `ACCEPTED` (제조 중) ➔ `COMPLETED` (제조 완료/픽업 요청) ➔ `PICKED_UP` (수령 완료)


* **상태 업데이트:** 관리자가 상태를 바꿀 때 화면 자동 갱신.
* **세션 백업:** 주문 진입 시 발급된 `orderId`를 로컬 스토리지에 자동 저장하고, 픽업이 완료(`PICKED_UP`)되면 스토리지에서 제거하여 세션 초기화.

---

### 2.2 관리자 기능 (Admin Side)

#### 0) 관리자 로그인 및 보안 (`/admin/login`)

* **보안 세션:** Supabase Auth를 활용한 이메일/비밀번호 기반 로그인.
* **미들웨어 보호:** Next.js Middleware에서 서버사이드 세션(JWT) 검증 후, 인가되지 않은 접근 시 차단(리다이렉트).
* **DB 권한 통제:** Supabase RLS(Row Level Security)를 설정하여 관리자 세션 없이 메뉴나 주문 데이터를 조작하려는 비정상 API 접근을 원천 차단.

#### 1) 실시간 주문 현황판 (`/admin/orders`)

* **주문 카드 리스트:** 신규 주문 순으로 정렬 표시 (주문번호, 주문 시각, 메뉴/옵션 상세, 총액).
* **주문 상태 제어:**
* [주문 수락] ➔ 상태 `ACCEPTED` 변경
* [제조 완료] ➔ 상태 `COMPLETED` 변경
* [주문 취소] ➔ 상태 `CANCELLED` 변경


* **신규 주문 알림:** 새로운 주문 유입 시 Toast 알림 및 효과음 출력.

#### 2) 메뉴 및 재고 관리 (`/admin/menu`)

* **메뉴 CRUD:** 메뉴 추가/수정/삭제 (메뉴명, 가격, 카테고리, 대표 이미지).
* **품절 스위치 (Sold Out Toggle):** 원클릭으로 특정 메뉴의 품절 상태를 `true`/`false`로 전환.
* **재고 수량 수정:** 주요 원재료나 특정 디저트의 남아있는 수량 설정.

---

### 2.3 공통 및 데이터베이스 구조 (Common & DB)

#### 데이터 모델 개요 (Supabase Schema 기준)

* `Menu`: 메뉴 기본 정보 (id, name, price, category, isSoldOut, image)
* `OptionGroup`: 옵션 그룹 (id, name, isRequired) - *예: 온도, 사이즈, 샷추가*
* `OptionItem`: 세부 옵션 (id, optionGroupId, name, extraPrice) - *예: ICE(+0), Grande(+500)*
* `Order`: 주문 (id, orderNumber, status, totalPrice, createdAt)
* `OrderItem`: 주문에 포함된 메뉴 항목 기본 정보(단가 스냅샷 등) 및 비정형 요청사항 JSON
* `OrderItemOption`: 재고 관리 및 매출 통계를 위해 분리된 선택 옵션 매핑 테이블 (id, orderItemId, optionItemId, quantity, unitPrice)

---