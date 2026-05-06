# Integration Test Instructions - 테이블오더 서비스

## 목적
프론트엔드-백엔드 간 통합 동작 및 핵심 비즈니스 플로우를 검증합니다.

## 통합 테스트 시나리오

### Scenario 1: 관리자 초기 설정 플로우
1. POST /api/auth/register → 관리자 계정 생성
2. POST /api/menus/categories → 카테고리 생성
3. POST /api/menus → 메뉴 등록
4. POST /api/tables → 테이블 등록
5. **검증**: 모든 API 201 응답, 데이터 정합성

### Scenario 2: 고객 주문 플로우
1. POST /api/auth/tables/login → 테이블 로그인
2. GET /api/menus → 메뉴 목록 조회
3. POST /api/orders → 주문 생성 (세션 자동 시작)
4. GET /api/orders?sessionId= → 주문 내역 조회
5. **검증**: 주문 생성 성공, 세션 자동 생성, 금액 정확

### Scenario 3: 실시간 주문 모니터링 (SSE)
1. 관리자 로그인 → GET /api/sse/orders (SSE 연결)
2. 고객 주문 생성 → POST /api/orders
3. **검증**: SSE로 new_order 이벤트 수신 (2초 이내)
4. 관리자 상태 변경 → PATCH /api/orders/:id/status
5. **검증**: SSE로 order_updated 이벤트 수신

### Scenario 4: 테이블 이용 완료 플로우
1. 고객 주문 2건 생성
2. 관리자 이용 완료 → POST /api/tables/:id/complete
3. **검증**: 세션 completedAt 기록됨
4. 고객 주문 조회 → GET /api/orders
5. **검증**: 이전 세션 주문 미표시
6. 관리자 과거 내역 → GET /api/tables/:id/history
7. **검증**: 완료된 세션의 주문 내역 표시

### Scenario 5: 주문 상태 전이 검증
1. 주문 생성 (status = pending)
2. PATCH status → preparing (성공)
3. PATCH status → completed (성공)
4. PATCH status → pending (실패 - 400)
5. **검증**: 올바른 상태 전이만 허용

## 수동 통합 테스트 실행 방법

### 1. 서버 시작
```bash
cd backend && npm run dev
```

### 2. 프론트엔드 시작
```bash
cd frontend && npm run dev
```

### 3. 테스트 수행
- 브라우저에서 http://localhost:5173 접속
- 위 시나리오 순서대로 수동 검증
- 개발자 도구 Network 탭에서 API 응답 확인
- SSE 연결은 EventStream 탭에서 확인

## API 테스트 도구 (선택)
- curl 또는 Postman으로 API 직접 호출 가능
- 예시:
```bash
# 관리자 회원가입
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"storeId":"store1","username":"admin","password":"1234"}'
```
