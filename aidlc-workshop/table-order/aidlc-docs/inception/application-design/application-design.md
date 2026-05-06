# Application Design - 테이블오더 서비스 (통합 문서)

## 1. 기술 결정사항 요약

| 영역 | 선택 | 근거 |
|------|------|------|
| Backend 구조 | 레이어별 분리 (routes/controllers/services/models) | 명확한 관심사 분리, Express 표준 패턴 |
| Frontend 상태관리 | Pinia | Vue.js 공식 권장, Composition API 친화적 |
| API 통신 | Axios | 인터셉터, 에러 핸들링, Vue 생태계 호환성 |
| DB 접근 | better-sqlite3 + 직접 SQL | MVP 경량화, SQLite 동기 API, 오버헤드 최소화 |
| UI 스타일링 | 순수 CSS/SCSS | 외부 의존성 최소화, 커스텀 디자인 자유도 |
| 프로젝트 구조 | frontend/ + backend/ | 명확한 분리, 독립적 의존성 관리 |

## 2. 프로젝트 구조

```
table-order/
+-- frontend/                  # Vue.js 프론트엔드
|   +-- src/
|   |   +-- views/             # 페이지 컴포넌트
|   |   |   +-- customer/      # 고객용 페이지
|   |   |   +-- admin/         # 관리자용 페이지
|   |   +-- components/        # 재사용 컴포넌트
|   |   +-- stores/            # Pinia 스토어
|   |   +-- services/          # API/SSE 서비스
|   |   +-- router/            # Vue Router 설정
|   |   +-- assets/            # 정적 자원 (CSS 등)
|   +-- package.json
|
+-- backend/                   # Express.js 백엔드
|   +-- src/
|   |   +-- routes/            # 라우트 정의
|   |   +-- controllers/       # 요청 핸들러
|   |   +-- services/          # 비즈니스 로직
|   |   +-- models/            # 데이터 모델/스키마
|   |   +-- middleware/        # 인증 등 미들웨어
|   |   +-- database/          # DB 초기화/마이그레이션
|   |   +-- utils/             # 유틸리티
|   +-- package.json
|
+-- package.json               # 루트 (스크립트 편의용)
```

## 3. 컴포넌트 개요

### Backend (6개 컴포넌트)
1. **Auth** - 관리자/테이블 인증, JWT, bcrypt
2. **Menu** - 메뉴/카테고리 CRUD
3. **Order** - 주문 생성/조회/상태관리
4. **Table** - 테이블 관리, 세션 라이프사이클
5. **SSE** - 실시간 이벤트 스트리밍
6. **Database** - SQLite 초기화/접근

### Frontend (4개 컴포넌트)
7. **Customer Views** - 고객용 UI (메뉴, 장바구니, 주문)
8. **Admin Views** - 관리자용 UI (대시보드, 관리)
9. **Stores** - Pinia 상태 관리 (Auth, Cart, Order, Menu, Table)
10. **API Client** - Axios + EventSource 통신

## 4. 서비스 조율 패턴

### 핵심 비즈니스 플로우

**주문 생성**:
Customer UI → Cart Store → Axios → OrderController → OrderService → DB 저장 → SSE 브로드캐스트 → Admin 실시간 수신

**테이블 이용 완료**:
Admin UI → Axios → TableController → TableService → 세션 종료 + 이력 이동 + 리셋 → SSE 브로드캐스트

**실시간 모니터링**:
Admin 로그인 → SSE 연결 → 서버 이벤트 수신 → Order Store 자동 업데이트 → UI 반영

## 5. 의존성 관계

```
Controllers → Services → Database
                |
                +→ SSE Service (이벤트 발행)

Vue Views → Pinia Stores → API Service → Express Server
                              |
Admin Views ← SSE Client ← EventSource ← SSE Endpoint
```

**순환 의존성 방지**:
- OrderService → TableService: 세션 조회만 (읽기 전용)
- TableService 이용 완료: 직접 DB 조작 (OrderService 미호출)

## 6. 데이터 모델 개요

| Entity | 주요 필드 | 관계 |
|--------|-----------|------|
| Store | id, name, createdAt | 1:N Admin, 1:N Table, 1:N Category |
| Admin | id, storeId, username, passwordHash | N:1 Store |
| Table | id, storeId, tableNumber, passwordHash | N:1 Store, 1:N TableSession |
| TableSession | id, tableId, startedAt, completedAt | N:1 Table, 1:N Order |
| Category | id, storeId, name, sortOrder | N:1 Store, 1:N MenuItem |
| MenuItem | id, categoryId, name, price, description, imageUrl, sortOrder | N:1 Category |
| Order | id, sessionId, tableId, storeId, totalAmount, status, createdAt | N:1 TableSession |
| OrderItem | id, orderId, menuItemId, menuName, quantity, unitPrice | N:1 Order |

## 7. API 엔드포인트 설계

### 인증
- `POST /api/auth/register` - 관리자 회원가입
- `POST /api/auth/login` - 관리자 로그인
- `POST /api/tables/login` - 테이블 태블릿 로그인

### 메뉴
- `GET /api/menus?storeId=` - 메뉴 목록 (카테고리 포함)
- `POST /api/menus` - 메뉴 등록 [관리자]
- `PUT /api/menus/:id` - 메뉴 수정 [관리자]
- `DELETE /api/menus/:id` - 메뉴 삭제 [관리자]
- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 등록 [관리자]

### 주문
- `POST /api/orders` - 주문 생성 [테이블]
- `GET /api/orders?sessionId=` - 주문 목록 조회
- `GET /api/orders/:id` - 주문 상세 조회
- `PATCH /api/orders/:id/status` - 주문 상태 변경 [관리자]
- `DELETE /api/orders/:id` - 주문 삭제 [관리자]

### 테이블
- `GET /api/tables` - 테이블 목록 [관리자]
- `POST /api/tables` - 테이블 등록 [관리자]
- `POST /api/tables/:id/complete` - 이용 완료 [관리자]
- `GET /api/tables/:id/history` - 과거 내역 [관리자]

### 실시간
- `GET /api/sse/orders` - SSE 주문 스트림 [관리자]
