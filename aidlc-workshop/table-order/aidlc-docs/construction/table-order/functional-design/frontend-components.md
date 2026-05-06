# Frontend Components Design - 테이블오더 서비스

## 1. 라우트 구조

### 고객용 라우트 (/customer)
| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| /customer/login | TableLoginView | 없음 | 테이블 초기 설정 |
| /customer/menu | MenuView | table | 메뉴 조회 (기본 화면) |
| /customer/cart | CartView | table | 장바구니 |
| /customer/order/confirm | OrderConfirmView | table | 주문 확인 |
| /customer/order/success/:id | OrderSuccessView | table | 주문 성공 (5초 후 리다이렉트) |
| /customer/orders | OrderHistoryView | table | 주문 내역 |

### 관리자용 라우트 (/admin)
| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| /admin/login | AdminLoginView | 없음 | 관리자 로그인 |
| /admin/register | AdminRegisterView | 없음 | 관리자 회원가입 |
| /admin/dashboard | DashboardView | admin | 주문 대시보드 |
| /admin/menus | MenuManageView | admin | 메뉴 관리 |
| /admin/tables | TableManageView | admin | 테이블 관리 |

---

## 2. 고객용 컴포넌트

### TableLoginView
**목적**: 테이블 태블릿 초기 설정 (관리자가 1회 수행)
**상태**: Auth Store (tableToken, tableInfo)
**API**: POST /api/tables/login
**동작**:
- 저장된 로그인 정보 확인 → 있으면 자동 로그인 → /customer/menu 이동
- 없으면 로그인 폼 표시 (storeId, tableNumber, password)
- 로그인 성공 → localStorage 저장 → /customer/menu 이동

### MenuView (기본 화면)
**목적**: 카테고리별 메뉴 카드 표시
**상태**: Menu Store (categories, menuItems)
**API**: GET /api/menus?storeId=
**하위 컴포넌트**:
- CategoryTabs: 카테고리 탭 네비게이션
- MenuCard: 개별 메뉴 카드 (이미지, 이름, 가격, 설명, 추가 버튼)
- CartFloatingButton: 장바구니 바로가기 (아이템 수 배지)
**동작**:
- 페이지 로드 시 메뉴 데이터 fetch
- 카테고리 탭 클릭 → 해당 카테고리로 스크롤
- "추가" 버튼 → Cart Store에 아이템 추가 (토스트 알림)

### CartView
**목적**: 장바구니 관리
**상태**: Cart Store (items, totalPrice)
**API**: 없음 (로컬 상태만)
**하위 컴포넌트**:
- CartItem: 개별 장바구니 항목 (이름, 수량 조절, 단가, 소계, 삭제)
- CartSummary: 총 금액 표시 + 주문하기 버튼
**동작**:
- 수량 +/- 버튼 → Cart Store 업데이트
- 삭제 버튼 → 항목 제거
- "주문하기" → /customer/order/confirm 이동
- "장바구니 비우기" → 확인 후 전체 삭제

### OrderConfirmView
**목적**: 주문 최종 확인 및 제출
**상태**: Cart Store (읽기), Order Store (주문 생성)
**API**: POST /api/orders
**동작**:
- 장바구니 내용 읽기 전용 표시
- "주문 확정" 클릭 → API 호출
- 성공 → Cart Store 비우기 → /customer/order/success/:id 이동
- 실패 → 에러 메시지 표시, 장바구니 유지

### OrderSuccessView
**목적**: 주문 성공 알림 (5초 후 자동 리다이렉트)
**상태**: 라우트 파라미터 (orderId)
**동작**:
- 주문 번호 표시
- 5초 카운트다운 표시
- 5초 후 /customer/menu 자동 이동
- "메뉴로 돌아가기" 버튼 (즉시 이동)

### OrderHistoryView (고객)
**목적**: 현재 세션 주문 내역 조회
**상태**: Order Store (orders)
**API**: GET /api/orders?sessionId=
**하위 컴포넌트**:
- OrderCard: 주문 카드 (번호, 시각, 상태 배지, 금액)
- OrderDetail: 주문 상세 (메뉴 목록, 수량, 단가)
**동작**:
- 현재 세션 ID로 주문 목록 조회
- 주문 시간 순 정렬
- 상태별 색상 배지 (대기중=노랑, 준비중=파랑, 완료=초록)

---

## 3. 관리자용 컴포넌트

### AdminLoginView / AdminRegisterView
**목적**: 관리자 인증
**상태**: Auth Store (adminToken, adminInfo)
**API**: POST /api/auth/login, POST /api/auth/register
**동작**:
- 폼 입력 (storeId, username, password)
- 제출 → API 호출 → 성공 시 /admin/dashboard 이동
- 실패 시 에러 메시지 표시

### DashboardView
**목적**: 실시간 주문 모니터링 (그리드 레이아웃)
**상태**: Order Store (orders), Table Store (tables), SSE 연결
**API**: GET /api/orders, GET /api/tables, GET /api/sse/orders
**하위 컴포넌트**:
- TableCard: 테이블별 카드 (테이블 번호, 총 주문액, 최신 주문 미리보기)
- OrderDetailModal: 주문 상세 모달 (전체 메뉴 목록)
- StatusBadge: 주문 상태 배지
- NewOrderHighlight: 신규 주문 강조 애니메이션
**동작**:
- 페이지 로드 시 SSE 연결 시작
- 테이블별 그리드 레이아웃 표시
- 신규 주문 수신 → 해당 테이블 카드 업데이트 + 강조 효과
- 테이블 카드 클릭 → 주문 상세 모달
- 상태 변경 버튼 (대기중 → 준비중 → 완료)
- 주문 삭제 버튼 (확인 팝업)
- 이용 완료 버튼 (확인 팝업)
- 과거 내역 버튼 → 과거 주문 모달

### MenuManageView
**목적**: 메뉴 CRUD 관리
**상태**: Menu Store
**API**: GET/POST/PUT/DELETE /api/menus, GET/POST /api/categories
**하위 컴포넌트**:
- CategoryList: 카테고리 목록 + 추가 버튼
- MenuForm: 메뉴 등록/수정 폼 (모달)
- MenuTable: 메뉴 목록 테이블 (수정/삭제 버튼)
**동작**:
- 카테고리별 메뉴 목록 표시
- "메뉴 추가" → 폼 모달 → 저장
- "수정" → 폼 모달 (기존 데이터 채움) → 저장
- "삭제" → 확인 팝업 → 삭제

### TableManageView
**목적**: 테이블 등록 및 관리
**상태**: Table Store
**API**: GET/POST /api/tables, POST /api/tables/:id/complete, GET /api/tables/:id/history
**하위 컴포넌트**:
- TableList: 테이블 목록 (번호, 세션 상태)
- TableForm: 테이블 등록 폼 (모달)
- HistoryModal: 과거 주문 내역 모달
**동작**:
- 테이블 목록 표시 (활성 세션 여부 표시)
- "테이블 추가" → 폼 모달 (번호, 비밀번호)
- "이용 완료" → 확인 팝업 → API 호출
- "과거 내역" → 날짜 필터 + 주문 목록 모달

---

## 4. 공통 컴포넌트

| Component | Purpose |
|-----------|---------|
| AppHeader | 상단 헤더 (로고, 네비게이션) |
| LoadingSpinner | 로딩 인디케이터 |
| ErrorMessage | 에러 메시지 표시 |
| ConfirmModal | 확인/취소 팝업 |
| ToastNotification | 토스트 알림 |
| EmptyState | 데이터 없음 상태 표시 |

---

## 5. 상태 관리 (Pinia Stores)

### Auth Store
```
State:
  - token: string | null
  - userInfo: { id, storeId, role, tableNumber? } | null
  - isAuthenticated: boolean (computed)

Actions:
  - login(credentials) → API 호출 → token/userInfo 저장
  - register(data) → API 호출 → token/userInfo 저장
  - tableLogin(credentials) → API 호출 → token/userInfo 저장
  - logout() → token/userInfo 제거
  - checkAuth() → localStorage에서 복원 → 토큰 유효성 확인
```

### Cart Store
```
State:
  - items: [{ menuItemId, name, price, quantity }]
  - totalPrice: number (computed)
  - itemCount: number (computed)

Actions:
  - addItem(menuItem) → 기존이면 수량+1, 없으면 추가
  - removeItem(menuItemId) → 항목 제거
  - updateQuantity(menuItemId, quantity) → 수량 변경 (0이면 제거)
  - clearCart() → 전체 비우기

Persistence:
  - localStorage 자동 동기화 (watch)
  - 페이지 로드 시 localStorage에서 복원
```

### Order Store
```
State:
  - orders: Order[]
  - loading: boolean

Actions:
  - fetchOrders(sessionId?) → GET /api/orders
  - createOrder(items) → POST /api/orders
  - updateOrderStatus(orderId, status) → PATCH /api/orders/:id/status
  - deleteOrder(orderId) → DELETE /api/orders/:id
  - handleSSEEvent(event) → orders 배열 업데이트
```

### Menu Store
```
State:
  - categories: Category[]
  - menuItems: MenuItem[] (카테고리별 그룹)
  - loading: boolean

Actions:
  - fetchMenus(storeId) → GET /api/menus
  - createMenu(data) → POST /api/menus
  - updateMenu(id, data) → PUT /api/menus/:id
  - deleteMenu(id) → DELETE /api/menus/:id
  - fetchCategories() → GET /api/categories
  - createCategory(data) → POST /api/categories
```

### Table Store
```
State:
  - tables: Table[]
  - loading: boolean

Actions:
  - fetchTables() → GET /api/tables
  - createTable(data) → POST /api/tables
  - completeSession(tableId) → POST /api/tables/:id/complete
  - fetchHistory(tableId, dateFilter?) → GET /api/tables/:id/history
```
