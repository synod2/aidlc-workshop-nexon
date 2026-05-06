# Unit of Work - 테이블오더 서비스

## 분해 전략
- **개발 순서**: 백엔드 전체 먼저 → 프론트엔드 전체
- **단위 크기**: 작은 단위 (기능별 세분화)
- **아키텍처**: 모놀리식 (단일 backend + 단일 frontend)

---

## Backend Units (순서대로 개발)

### Unit 1: 프로젝트 초기 설정 및 DB 스키마
**책임**: 백엔드 프로젝트 구조 생성, SQLite DB 초기화, 전체 스키마 정의
**산출물**:
- Express 프로젝트 초기화 (TypeScript 설정)
- 폴더 구조 생성 (routes/, controllers/, services/, models/, middleware/, database/)
- SQLite DB 초기화 (better-sqlite3)
- 전체 테이블 스키마 생성 (Store, Admin, Table, TableSession, Category, MenuItem, Order, OrderItem)
- 공통 유틸리티 (에러 핸들링, 응답 포맷)

### Unit 2: 인증 모듈 (Auth)
**책임**: 관리자 회원가입/로그인, 테이블 로그인, JWT 미들웨어
**산출물**:
- AuthService (회원가입, 로그인, 토큰 발급/검증)
- AuthController + Routes
- 인증 미들웨어 (JWT 검증, 관리자/테이블 구분)
- 로그인 시도 제한 로직
- bcrypt 해싱

### Unit 3: 메뉴 모듈 (Menu)
**책임**: 카테고리 및 메뉴 CRUD
**산출물**:
- MenuService (메뉴/카테고리 CRUD, 순서 관리)
- MenuController + Routes
- 데이터 검증 (필수 필드, 가격 범위)
- 카테고리 관리

### Unit 4: 주문 모듈 (Order)
**책임**: 주문 생성, 조회, 상태 관리, 삭제
**산출물**:
- OrderService (주문 생성, 조회, 상태 변경, 삭제)
- OrderController + Routes
- 세션 기반 주문 필터링
- 금액 계산 로직

### Unit 5: 테이블 관리 모듈 (Table)
**책임**: 테이블 등록, 세션 라이프사이클, 이용 완료, 과거 내역
**산출물**:
- TableService (테이블 CRUD, 세션 시작/종료, 이력 이동)
- TableController + Routes
- 이용 완료 처리 (주문 이력 이동 + 리셋)
- 과거 주문 내역 조회 (날짜 필터링)

### Unit 6: SSE 실시간 모듈
**책임**: Server-Sent Events 연결 관리 및 이벤트 브로드캐스트
**산출물**:
- SSEService (클라이언트 관리, 이벤트 브로드캐스트)
- SSE Route (GET /api/sse/orders)
- OrderService/TableService와 SSE 연동
- 연결 해제 처리, heartbeat

---

## Frontend Units (순서대로 개발)

### Unit 7: 프론트엔드 초기 설정
**책임**: Vue.js 프로젝트 구조 생성, 라우터, 공통 설정
**산출물**:
- Vue 3 + TypeScript 프로젝트 초기화
- Vue Router 설정 (고객용/관리자용 라우트 분리)
- Pinia 설정
- Axios 인스턴스 설정 (인터셉터, baseURL)
- 공통 레이아웃 컴포넌트
- 글로벌 CSS/SCSS 설정

### Unit 8: 고객용 - 테이블 로그인 및 메뉴 조회
**책임**: 테이블 자동 로그인, 메뉴 카테고리별 조회 화면
**산출물**:
- 테이블 로그인 화면 (초기 설정)
- Auth Store (테이블 인증 상태 관리)
- 메뉴 조회 화면 (카테고리별 카드 레이아웃)
- Menu Store (메뉴 데이터 캐싱)
- 자동 로그인 로직 (localStorage)

### Unit 9: 고객용 - 장바구니 및 주문
**책임**: 장바구니 관리, 주문 생성, 주문 내역 조회
**산출물**:
- 장바구니 화면 (추가/삭제/수량 조절)
- Cart Store (localStorage 연동)
- 주문 확인/생성 화면
- 주문 성공 화면 (5초 후 리다이렉트)
- 주문 내역 조회 화면
- Order Store (주문 목록 관리)

### Unit 10: 관리자용 - 인증 및 메뉴 관리
**책임**: 관리자 로그인/회원가입, 메뉴 CRUD 화면
**산출물**:
- 관리자 로그인/회원가입 화면
- Admin Auth Store
- 메뉴 관리 화면 (등록/수정/삭제/순서 변경)
- 카테고리 관리 화면
- 인증 가드 (라우터)

### Unit 11: 관리자용 - 주문 대시보드 및 테이블 관리
**책임**: 실시간 주문 모니터링, 테이블 관리, 과거 내역
**산출물**:
- 주문 대시보드 (그리드 레이아웃, 테이블별 카드)
- SSE 클라이언트 연결 (EventSource)
- 주문 상태 변경 UI
- 테이블 관리 화면 (등록, 이용 완료)
- 과거 주문 내역 화면 (날짜 필터링)
- 주문 삭제 기능

---

## 코드 조직 전략

### Backend (backend/)
```
backend/
+-- src/
|   +-- index.ts              # 앱 진입점
|   +-- app.ts                # Express 앱 설정
|   +-- database/
|   |   +-- init.ts           # DB 초기화 + 스키마
|   |   +-- connection.ts     # DB 연결 인스턴스
|   +-- routes/
|   |   +-- auth.routes.ts
|   |   +-- menu.routes.ts
|   |   +-- order.routes.ts
|   |   +-- table.routes.ts
|   |   +-- sse.routes.ts
|   +-- controllers/
|   |   +-- auth.controller.ts
|   |   +-- menu.controller.ts
|   |   +-- order.controller.ts
|   |   +-- table.controller.ts
|   +-- services/
|   |   +-- auth.service.ts
|   |   +-- menu.service.ts
|   |   +-- order.service.ts
|   |   +-- table.service.ts
|   |   +-- sse.service.ts
|   +-- middleware/
|   |   +-- auth.middleware.ts
|   |   +-- error.middleware.ts
|   +-- models/
|   |   +-- types.ts          # 공통 타입 정의
|   +-- utils/
|       +-- response.ts       # 응답 포맷 유틸
+-- package.json
+-- tsconfig.json
```

### Frontend (frontend/)
```
frontend/
+-- src/
|   +-- main.ts
|   +-- App.vue
|   +-- router/
|   |   +-- index.ts
|   +-- stores/
|   |   +-- auth.ts
|   |   +-- cart.ts
|   |   +-- order.ts
|   |   +-- menu.ts
|   |   +-- table.ts
|   +-- services/
|   |   +-- api.ts            # Axios 인스턴스
|   |   +-- sse.ts            # SSE 클라이언트
|   +-- views/
|   |   +-- customer/
|   |   |   +-- MenuView.vue
|   |   |   +-- CartView.vue
|   |   |   +-- OrderView.vue
|   |   |   +-- OrderHistoryView.vue
|   |   |   +-- TableLoginView.vue
|   |   +-- admin/
|   |       +-- LoginView.vue
|   |       +-- RegisterView.vue
|   |       +-- DashboardView.vue
|   |       +-- MenuManageView.vue
|   |       +-- TableManageView.vue
|   |       +-- OrderHistoryView.vue
|   +-- components/
|   |   +-- common/
|   |   +-- customer/
|   |   +-- admin/
|   +-- assets/
|       +-- styles/
+-- package.json
+-- vite.config.ts
```
