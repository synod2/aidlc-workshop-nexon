# Component Methods - 테이블오더 서비스

## Backend Methods

### Auth Component

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `registerAdmin(storeId, username, password)` | storeId: string, username: string, password: string | { admin: Admin, token: string } | 관리자 회원가입 |
| `loginAdmin(storeId, username, password)` | storeId: string, username: string, password: string | { admin: Admin, token: string } | 관리자 로그인 |
| `loginTable(storeId, tableNumber, password)` | storeId: string, tableNumber: number, password: string | { table: Table, token: string } | 테이블 태블릿 로그인 |
| `verifyToken(token)` | token: string | { valid: boolean, payload: TokenPayload } | JWT 토큰 검증 |
| `hashPassword(password)` | password: string | hashedPassword: string | bcrypt 해싱 |
| `checkLoginAttempts(identifier)` | identifier: string | { allowed: boolean, remainingAttempts: number } | 로그인 시도 제한 확인 |

### Menu Component

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `createMenu(menuData)` | menuData: CreateMenuDTO | Menu | 메뉴 등록 |
| `getMenus(storeId, categoryId?)` | storeId: string, categoryId?: number | Menu[] | 메뉴 목록 조회 |
| `getMenuById(menuId)` | menuId: number | Menu | 메뉴 상세 조회 |
| `updateMenu(menuId, menuData)` | menuId: number, menuData: UpdateMenuDTO | Menu | 메뉴 수정 |
| `deleteMenu(menuId)` | menuId: number | void | 메뉴 삭제 |
| `updateMenuOrder(menuId, sortOrder)` | menuId: number, sortOrder: number | void | 메뉴 순서 변경 |
| `getCategories(storeId)` | storeId: string | Category[] | 카테고리 목록 조회 |
| `createCategory(categoryData)` | categoryData: CreateCategoryDTO | Category | 카테고리 등록 |

### Order Component

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `createOrder(orderData)` | orderData: CreateOrderDTO | Order | 주문 생성 |
| `getOrders(storeId, tableId?, sessionId?)` | storeId: string, tableId?: number, sessionId?: string | Order[] | 주문 목록 조회 |
| `getOrderById(orderId)` | orderId: number | Order (with items) | 주문 상세 조회 |
| `updateOrderStatus(orderId, status)` | orderId: number, status: OrderStatus | Order | 주문 상태 변경 |
| `deleteOrder(orderId)` | orderId: number | void | 주문 삭제 |
| `getOrdersBySession(sessionId)` | sessionId: string | Order[] | 세션별 주문 조회 |

### Table Component

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `createTable(tableData)` | tableData: CreateTableDTO | Table | 테이블 등록 |
| `getTables(storeId)` | storeId: string | Table[] | 테이블 목록 조회 |
| `startSession(tableId)` | tableId: number | TableSession | 테이블 세션 시작 |
| `completeSession(tableId)` | tableId: number | void | 테이블 이용 완료 |
| `getActiveSession(tableId)` | tableId: number | TableSession \| null | 현재 활성 세션 조회 |
| `getOrderHistory(tableId, dateFilter?)` | tableId: number, dateFilter?: DateRange | OrderHistory[] | 과거 주문 내역 조회 |

### SSE Component

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `addClient(res, storeId)` | res: Response, storeId: string | void | SSE 클라이언트 등록 |
| `removeClient(res)` | res: Response | void | SSE 클라이언트 제거 |
| `broadcastNewOrder(storeId, order)` | storeId: string, order: Order | void | 신규 주문 이벤트 전송 |
| `broadcastOrderUpdate(storeId, order)` | storeId: string, order: Order | void | 주문 상태 변경 이벤트 전송 |

---

## Frontend Methods (Pinia Stores)

### Auth Store

| Method | Purpose |
|--------|---------|
| `login(credentials)` | 로그인 처리 및 토큰 저장 |
| `register(data)` | 회원가입 처리 |
| `logout()` | 로그아웃 및 토큰 제거 |
| `tableLogin(credentials)` | 테이블 태블릿 로그인 |
| `checkAuth()` | 저장된 토큰으로 인증 상태 확인 |

### Cart Store

| Method | Purpose |
|--------|---------|
| `addItem(menuItem)` | 장바구니에 메뉴 추가 |
| `removeItem(menuId)` | 장바구니에서 메뉴 제거 |
| `updateQuantity(menuId, quantity)` | 수량 변경 |
| `clearCart()` | 장바구니 비우기 |
| `getTotalPrice()` | 총 금액 계산 |
| `persistToStorage()` | localStorage에 저장 |
| `loadFromStorage()` | localStorage에서 복원 |

### Order Store

| Method | Purpose |
|--------|---------|
| `submitOrder(cartItems)` | 주문 생성 API 호출 |
| `fetchOrders(sessionId)` | 주문 목록 조회 |
| `connectSSE()` | SSE 연결 시작 (관리자) |
| `disconnectSSE()` | SSE 연결 종료 |
