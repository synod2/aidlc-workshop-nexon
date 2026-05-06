# Components - 테이블오더 서비스

## Backend Components

### 1. Auth Component
**책임**: 관리자 인증 및 테이블 태블릿 인증 처리
- 관리자 회원가입/로그인
- JWT 토큰 발급 및 검증
- 테이블 태블릿 로그인 (매장ID + 테이블번호 + 비밀번호)
- 로그인 시도 제한

### 2. Menu Component
**책임**: 메뉴 및 카테고리 CRUD 관리
- 메뉴 등록/조회/수정/삭제
- 카테고리 관리
- 메뉴 노출 순서 관리
- 데이터 검증 (필수 필드, 가격 범위)

### 3. Order Component
**책임**: 주문 생성, 조회, 상태 관리
- 주문 생성 (장바구니 → 주문 전환)
- 주문 목록 조회 (세션 기반 필터링)
- 주문 상태 변경 (대기중/준비중/완료)
- 주문 삭제 (관리자 직권)

### 4. Table Component
**책임**: 테이블 관리 및 세션 라이프사이클
- 테이블 등록/조회
- 테이블 세션 시작/종료
- 이용 완료 처리 (주문 이력 이동, 리셋)
- 과거 주문 내역 조회

### 5. SSE Component
**책임**: 실시간 이벤트 스트리밍
- SSE 연결 관리 (관리자 클라이언트)
- 신규 주문 이벤트 브로드캐스트
- 주문 상태 변경 이벤트 브로드캐스트
- 연결 해제 처리

### 6. Database Component
**책임**: 데이터베이스 초기화 및 접근
- SQLite DB 초기화 및 스키마 생성
- better-sqlite3 인스턴스 관리
- 마이그레이션 관리

---

## Frontend Components

### 7. Customer View Component
**책임**: 고객용 UI 페이지 및 상호작용
- 메뉴 조회 화면 (카테고리별 카드 레이아웃)
- 장바구니 관리 화면
- 주문 확인/생성 화면
- 주문 내역 조회 화면
- 테이블 로그인 화면 (초기 설정)

### 8. Admin View Component
**책임**: 관리자용 UI 페이지 및 상호작용
- 로그인/회원가입 화면
- 실시간 주문 대시보드 (그리드 레이아웃)
- 테이블 관리 화면
- 메뉴 관리 화면
- 과거 주문 내역 화면

### 9. Store (State Management) Component
**책임**: Pinia 기반 전역 상태 관리
- Auth Store: 인증 상태, 토큰 관리
- Cart Store: 장바구니 상태 (localStorage 연동)
- Order Store: 주문 목록 상태
- Menu Store: 메뉴 데이터 캐싱
- Table Store: 테이블 정보 상태

### 10. API Client Component
**책임**: Axios 기반 HTTP 통신 및 SSE 연결
- Axios 인스턴스 설정 (baseURL, 인터셉터)
- JWT 토큰 자동 첨부
- 에러 핸들링 (401 → 로그아웃)
- SSE EventSource 연결 관리
