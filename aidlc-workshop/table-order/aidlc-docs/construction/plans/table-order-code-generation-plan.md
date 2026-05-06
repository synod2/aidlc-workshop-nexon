# Code Generation Plan - 테이블오더 서비스

## 프로젝트 구조
- **Application Code**: workspace root (frontend/, backend/)
- **Documentation**: aidlc-docs/construction/table-order/code/

## 개발 순서
백엔드 전체 → 프론트엔드 전체 (11개 유닛 순차)

---

## Backend Steps

### Step 1: 프로젝트 초기 설정 (Unit 1)
- [ ] backend/package.json 생성 (express, better-sqlite3, bcryptjs, jsonwebtoken, cors, uuid, typescript, ts-node, nodemon 등)
- [ ] backend/tsconfig.json 생성
- [ ] backend/src/index.ts (서버 진입점)
- [ ] backend/src/app.ts (Express 앱 설정, 미들웨어, 라우트 등록)
- [ ] backend/src/database/connection.ts (better-sqlite3 인스턴스)
- [ ] backend/src/database/init.ts (전체 테이블 스키마 생성)
- [ ] backend/src/models/types.ts (공통 타입 정의)
- [ ] backend/src/utils/response.ts (응답 포맷 유틸)
- [ ] backend/src/middleware/error.middleware.ts (에러 핸들링)

### Step 2: 인증 모듈 (Unit 2)
- [ ] backend/src/services/auth.service.ts (회원가입, 로그인, 토큰 발급/검증, 시도 제한)
- [ ] backend/src/controllers/auth.controller.ts (요청 핸들러)
- [ ] backend/src/routes/auth.routes.ts (POST /register, /login, /tables/login)
- [ ] backend/src/middleware/auth.middleware.ts (JWT 검증, 역할 확인)

### Step 3: 메뉴 모듈 (Unit 3)
- [ ] backend/src/services/menu.service.ts (메뉴/카테고리 CRUD, 순서 관리)
- [ ] backend/src/controllers/menu.controller.ts
- [ ] backend/src/routes/menu.routes.ts (GET/POST/PUT/DELETE /menus, /categories)

### Step 4: 테이블 관리 모듈 (Unit 5)
- [ ] backend/src/services/table.service.ts (테이블 CRUD, 세션 관리, 이용 완료, 과거 내역)
- [ ] backend/src/controllers/table.controller.ts
- [ ] backend/src/routes/table.routes.ts (GET/POST /tables, POST /:id/complete, GET /:id/history)

### Step 5: SSE 모듈 (Unit 6)
- [ ] backend/src/services/sse.service.ts (클라이언트 관리, 브로드캐스트, heartbeat)
- [ ] backend/src/routes/sse.routes.ts (GET /api/sse/orders)

### Step 6: 주문 모듈 (Unit 4)
- [ ] backend/src/services/order.service.ts (주문 생성, 조회, 상태 변경, 삭제 + SSE 연동)
- [ ] backend/src/controllers/order.controller.ts
- [ ] backend/src/routes/order.routes.ts (POST/GET/PATCH/DELETE /orders)

### Step 7: 백엔드 통합 및 문서
- [ ] backend/src/app.ts 업데이트 (모든 라우트 등록 확인)
- [ ] aidlc-docs/construction/table-order/code/backend-summary.md 생성

---

## Frontend Steps

### Step 8: 프론트엔드 초기 설정 (Unit 7)
- [ ] frontend/package.json 생성 (vue, vue-router, pinia, axios, typescript, vite 등)
- [ ] frontend/vite.config.ts (프록시 설정 포함)
- [ ] frontend/tsconfig.json
- [ ] frontend/index.html
- [ ] frontend/src/main.ts (앱 진입점)
- [ ] frontend/src/App.vue (루트 컴포넌트)
- [ ] frontend/src/router/index.ts (전체 라우트 정의)
- [ ] frontend/src/services/api.ts (Axios 인스턴스, 인터셉터)
- [ ] frontend/src/services/sse.ts (EventSource 클라이언트)
- [ ] frontend/src/assets/styles/main.scss (글로벌 스타일)

### Step 9: Pinia Stores (Unit 7 계속)
- [ ] frontend/src/stores/auth.ts (Auth Store)
- [ ] frontend/src/stores/cart.ts (Cart Store + localStorage)
- [ ] frontend/src/stores/order.ts (Order Store)
- [ ] frontend/src/stores/menu.ts (Menu Store)
- [ ] frontend/src/stores/table.ts (Table Store)

### Step 10: 고객용 - 테이블 로그인 및 메뉴 (Unit 8)
- [ ] frontend/src/views/customer/TableLoginView.vue
- [ ] frontend/src/views/customer/MenuView.vue
- [ ] frontend/src/components/customer/CategoryTabs.vue
- [ ] frontend/src/components/customer/MenuCard.vue
- [ ] frontend/src/components/customer/CartFloatingButton.vue

### Step 11: 고객용 - 장바구니 및 주문 (Unit 9)
- [ ] frontend/src/views/customer/CartView.vue
- [ ] frontend/src/views/customer/OrderConfirmView.vue
- [ ] frontend/src/views/customer/OrderSuccessView.vue
- [ ] frontend/src/views/customer/OrderHistoryView.vue
- [ ] frontend/src/components/customer/CartItem.vue
- [ ] frontend/src/components/customer/OrderCard.vue

### Step 12: 관리자용 - 인증 및 메뉴 관리 (Unit 10)
- [ ] frontend/src/views/admin/LoginView.vue
- [ ] frontend/src/views/admin/RegisterView.vue
- [ ] frontend/src/views/admin/MenuManageView.vue
- [ ] frontend/src/components/admin/MenuForm.vue
- [ ] frontend/src/components/admin/CategoryList.vue

### Step 13: 관리자용 - 대시보드 및 테이블 관리 (Unit 11)
- [ ] frontend/src/views/admin/DashboardView.vue
- [ ] frontend/src/views/admin/TableManageView.vue
- [ ] frontend/src/components/admin/TableCard.vue
- [ ] frontend/src/components/admin/OrderDetailModal.vue
- [ ] frontend/src/components/admin/HistoryModal.vue
- [ ] frontend/src/components/common/ConfirmModal.vue
- [ ] frontend/src/components/common/ToastNotification.vue

### Step 14: 프론트엔드 통합 및 문서
- [ ] frontend/src/assets/styles/variables.scss (CSS 변수)
- [ ] aidlc-docs/construction/table-order/code/frontend-summary.md 생성

---

## Root Level

### Step 15: 루트 설정
- [ ] package.json (루트 - 편의 스크립트)
- [ ] README.md (프로젝트 설명, 실행 방법)

---

## 총 Steps: 15
## 총 파일 수: ~55개 (backend ~20, frontend ~30, root ~5)
