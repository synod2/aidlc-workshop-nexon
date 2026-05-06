# Business Rules - 테이블오더 서비스

## 1. 인증 규칙

### BR-AUTH-01: 관리자 회원가입
- 매장 식별자(storeId)는 필수
- username은 매장 내 유니크
- 비밀번호 최소 4자 이상
- 비밀번호는 bcrypt로 해싱 (salt rounds: 10)
- 회원가입 시 Store가 존재하지 않으면 자동 생성

### BR-AUTH-02: 관리자 로그인
- storeId + username + password 조합으로 인증
- 성공 시 JWT 토큰 발급 (만료: 16시간)
- JWT payload: { adminId, storeId, role: 'admin' }
- 실패 시 로그인 시도 횟수 증가

### BR-AUTH-03: 로그인 시도 제한
- 동일 식별자(storeId:username)로 5회 연속 실패 시 15분 잠금
- 성공 시 시도 횟수 리셋
- 잠금 시간 경과 후 자동 해제

### BR-AUTH-04: 테이블 태블릿 로그인
- storeId + tableNumber + password 조합으로 인증
- 성공 시 JWT 토큰 발급 (만료: 16시간)
- JWT payload: { tableId, storeId, tableNumber, role: 'table' }
- 로그인 정보는 클라이언트 localStorage에 저장

### BR-AUTH-05: 토큰 검증
- 모든 보호된 API는 Authorization: Bearer {token} 헤더 필요
- 만료된 토큰은 401 Unauthorized 반환
- 관리자 전용 API는 role: 'admin' 확인
- 테이블 전용 API는 role: 'table' 확인

---

## 2. 메뉴 규칙

### BR-MENU-01: 메뉴 등록 검증
- 필수 필드: name, price, categoryId
- price: 0 이상의 정수 (원 단위)
- name: 1~100자
- description: 최대 500자 (선택)
- imageUrl: 유효한 URL 형식 (선택)
- categoryId: 해당 매장의 유효한 카테고리

### BR-MENU-02: 메뉴 조회 정렬
- 카테고리별 sortOrder 오름차순
- 카테고리 내 메뉴도 sortOrder 오름차순
- isAvailable = 1인 메뉴만 고객에게 표시
- 관리자는 모든 메뉴 조회 가능

### BR-MENU-03: 메뉴 순서 변경
- sortOrder 값 직접 업데이트
- 동일 카테고리 내에서만 순서 변경

### BR-MENU-04: 메뉴 삭제
- 해당 메뉴가 포함된 기존 주문의 OrderItem은 유지 (스냅샷 데이터)
- MenuItem 레코드 삭제 (또는 soft delete로 isAvailable = 0)

---

## 3. 주문 규칙

### BR-ORDER-01: 주문 생성 조건
- 활성 테이블 세션이 존재해야 함
- 세션이 없으면 첫 주문 시 자동으로 새 세션 시작
- 장바구니에 최소 1개 이상의 메뉴 필요
- 각 메뉴의 수량은 1 이상

### BR-ORDER-02: 주문 금액 계산
- totalAmount = SUM(각 OrderItem의 unitPrice * quantity)
- unitPrice는 주문 시점의 MenuItem.price 스냅샷
- 서버에서 금액 재계산 (클라이언트 전송 금액 무시)

### BR-ORDER-03: 주문 상태 전이
- 허용 전이: pending → preparing → completed
- 역방향 전이 불가 (completed → preparing 불가)
- pending → completed 직접 전이 허용 (소규모 매장)

### BR-ORDER-04: 주문 삭제 (관리자)
- 관리자만 주문 삭제 가능
- 모든 상태의 주문 삭제 가능
- 삭제 시 해당 OrderItem도 함께 삭제
- 삭제 후 SSE로 삭제 이벤트 브로드캐스트

### BR-ORDER-05: 주문 조회 필터링
- 고객: 현재 활성 세션의 주문만 조회 가능
- 관리자: 매장 전체 활성 세션 주문 조회 가능
- completedAt이 NULL인 세션의 주문만 "현재" 주문

---

## 4. 테이블 세션 규칙

### BR-SESSION-01: 세션 시작
- 테이블에 활성 세션(completedAt IS NULL)이 없을 때만 새 세션 생성 가능
- 첫 주문 생성 시 활성 세션이 없으면 자동 시작
- 세션 ID는 UUID v4

### BR-SESSION-02: 이용 완료 (세션 종료)
- 관리자만 이용 완료 처리 가능
- completedAt에 현재 시각 기록
- 해당 세션의 모든 주문 상태는 유지 (이력 보존)
- 이용 완료 후 해당 테이블의 새 주문은 새 세션에서 시작

### BR-SESSION-03: 과거 내역 조회
- completedAt이 NOT NULL인 세션의 주문 = 과거 내역
- 시간 역순 정렬 (최신 먼저)
- 날짜 필터링: startDate ~ endDate 범위

---

## 5. SSE 규칙

### BR-SSE-01: 연결 관리
- 관리자 인증 토큰 필요
- 매장별 클라이언트 목록 관리
- 연결 시 Content-Type: text/event-stream
- 30초마다 heartbeat (: ping) 전송

### BR-SSE-02: 이벤트 유형
- `new_order`: 신규 주문 생성 시
- `order_updated`: 주문 상태 변경 시
- `order_deleted`: 주문 삭제 시
- `session_completed`: 테이블 이용 완료 시

### BR-SSE-03: 이벤트 데이터 형식
```
event: {event_type}
data: {JSON payload}
```

### BR-SSE-04: 브로드캐스트 범위
- 동일 매장(storeId)의 모든 연결된 관리자에게 전송
- 다른 매장의 이벤트는 전송하지 않음
