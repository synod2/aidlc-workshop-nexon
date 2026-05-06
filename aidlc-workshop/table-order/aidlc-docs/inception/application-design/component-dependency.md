# Component Dependencies - 테이블오더 서비스

## Dependency Matrix

| Component | Depends On |
|-----------|-----------|
| AuthService | Database |
| MenuService | Database |
| OrderService | Database, SSEService, TableService |
| TableService | Database, OrderService (이력 이동) |
| SSEService | (독립 - 다른 서비스에서 호출) |
| AuthMiddleware | AuthService |
| Controllers | 각 Service |

## Communication Patterns

### Backend Internal Communication
```
+------------------+     +------------------+     +------------------+
|   Controllers    | --> |    Services      | --> |    Database      |
| (Route Handlers) |     | (Business Logic) |     | (better-sqlite3) |
+------------------+     +------------------+     +------------------+
                                |
                                v
                         +------------------+
                         |   SSE Service    |
                         | (Event Broadcast)|
                         +------------------+
```

### Frontend-Backend Communication
```
+------------------+     +------------------+     +------------------+
|   Vue Components | --> |   Pinia Stores   | --> |   API Service    |
|   (Views/Pages)  |     | (State Mgmt)     |     |   (Axios)        |
+------------------+     +------------------+     +------------------+
                                                         |
                                                         v
                                                  +------------------+
                                                  |  Express Server  |
                                                  |  (REST + SSE)    |
                                                  +------------------+
```

### Real-time Communication (SSE)
```
+------------------+     +------------------+     +------------------+
|  Admin Dashboard | <-- |  SSE Client Svc  | <-- |  EventSource     |
|  (Vue Component) |     |  (Frontend)      |     |  (Browser API)   |
+------------------+     +------------------+     +------------------+
                                                         ^
                                                         |
                                                  +------------------+
                                                  |  SSE Service     |
                                                  |  (Backend)       |
                                                  +------------------+
                                                         ^
                                                         |
                                              +---------------------+
                                              | OrderService /      |
                                              | TableService        |
                                              +---------------------+
```

## Data Flow

### 주문 생성 데이터 흐름
1. Customer UI: 장바구니 확인 → 주문 확정 클릭
2. Cart Store: 장바구니 데이터 수집
3. API Service: POST /api/orders 요청
4. OrderController: 요청 파싱 및 인증 확인
5. OrderService: 세션 확인 → 금액 계산 → DB 저장
6. SSEService: 신규 주문 이벤트 브로드캐스트
7. Admin SSE Client: 이벤트 수신 → Order Store 업데이트
8. Admin Dashboard: UI 자동 갱신

### 인증 데이터 흐름
1. Login UI: 자격 증명 입력
2. Auth Store: login() 호출
3. API Service: POST /api/auth/login 요청
4. AuthController: 요청 파싱
5. AuthService: 자격 증명 검증 → JWT 발급
6. Auth Store: 토큰 저장 (localStorage)
7. API Service: 이후 요청에 토큰 자동 첨부 (인터셉터)

## Circular Dependency Prevention

- **OrderService ↔ TableService**: TableService의 이용 완료 시 OrderService를 호출하고, OrderService는 세션 확인을 위해 TableService를 호출합니다. 이를 방지하기 위해:
  - OrderService는 TableService의 `getActiveSession()`만 호출 (읽기 전용)
  - TableService의 이용 완료 로직은 직접 DB에서 주문 이력을 이동 (OrderService 호출 안 함)
