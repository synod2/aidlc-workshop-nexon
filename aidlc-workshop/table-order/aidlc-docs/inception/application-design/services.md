# Services - 테이블오더 서비스

## Backend Service Layer

서비스 레이어는 컨트롤러와 데이터 접근 계층 사이에서 비즈니스 로직을 조율합니다.

### 1. AuthService
**책임**: 인증/인가 비즈니스 로직 조율

**주요 흐름**:
- 회원가입: 입력 검증 → 중복 확인 → 비밀번호 해싱 → DB 저장 → 토큰 발급
- 로그인: 시도 제한 확인 → 자격 증명 검증 → 토큰 발급 → 시도 횟수 리셋
- 테이블 로그인: 매장/테이블 확인 → 비밀번호 검증 → 테이블 토큰 발급

**의존성**: Database Component, bcrypt, jsonwebtoken

### 2. MenuService
**책임**: 메뉴 CRUD 비즈니스 로직

**주요 흐름**:
- 메뉴 등록: 입력 검증 → 카테고리 존재 확인 → DB 저장
- 메뉴 조회: 매장별 필터링 → 카테고리별 그룹핑 → 정렬 순서 적용
- 메뉴 수정/삭제: 권한 확인 → 존재 확인 → DB 업데이트

**의존성**: Database Component

### 3. OrderService
**책임**: 주문 생성 및 상태 관리 비즈니스 로직

**주요 흐름**:
- 주문 생성: 세션 확인 → 메뉴 유효성 검증 → 금액 계산 → DB 저장 → SSE 이벤트 발행
- 상태 변경: 권한 확인 → 상태 전이 검증 → DB 업데이트 → SSE 이벤트 발행
- 주문 삭제: 권한 확인 → DB 삭제 → SSE 이벤트 발행

**의존성**: Database Component, SSE Component, Table Component (세션 확인)

### 4. TableService
**책임**: 테이블 및 세션 라이프사이클 관리

**주요 흐름**:
- 테이블 등록: 입력 검증 → 중복 확인 → 비밀번호 해싱 → DB 저장
- 세션 시작: 활성 세션 확인 → 새 세션 생성 → 세션 ID 반환
- 이용 완료: 활성 세션 확인 → 주문 이력 이동 → 세션 종료 → 리셋

**의존성**: Database Component, Order Component (이력 이동)

### 5. SSEService
**책임**: 실시간 이벤트 스트리밍 관리

**주요 흐름**:
- 클라이언트 연결: 매장별 클라이언트 목록 관리 → 연결 유지 → heartbeat
- 이벤트 브로드캐스트: 매장별 필터링 → 연결된 모든 클라이언트에 전송
- 연결 해제: 클라이언트 목록에서 제거 → 리소스 정리

**의존성**: 없음 (다른 서비스에서 호출됨)

---

## Frontend Service Layer

### 6. API Service (Axios Instance)
**책임**: HTTP 통신 추상화

**설정**:
- baseURL 설정
- Request 인터셉터: JWT 토큰 자동 첨부
- Response 인터셉터: 401 에러 시 로그아웃 처리
- 에러 응답 표준화

### 7. SSE Client Service
**책임**: EventSource 연결 관리

**주요 흐름**:
- 연결 시작: EventSource 생성 → 이벤트 리스너 등록
- 이벤트 수신: 파싱 → Store 업데이트
- 재연결: 연결 끊김 시 자동 재연결
- 연결 종료: EventSource 닫기 → 리소스 정리

---

## Service Orchestration Patterns

### 주문 생성 플로우
```
Customer UI → Cart Store → API Service → OrderController → OrderService
  → TableService (세션 확인)
  → Database (주문 저장)
  → SSEService (이벤트 브로드캐스트)
  → Admin Dashboard (실시간 업데이트)
```

### 테이블 이용 완료 플로우
```
Admin UI → API Service → TableController → TableService
  → Database (세션 종료)
  → OrderService (주문 이력 이동)
  → Database (이력 저장 + 현재 주문 삭제)
  → SSEService (테이블 리셋 이벤트)
```
