# Business Logic Model - 테이블오더 서비스

## 1. 인증 플로우

### 관리자 회원가입
```
Input: { storeId, username, password }

1. 입력 검증 (storeId 필수, username 필수, password >= 4자)
2. Store 존재 확인
   - 없으면: Store 자동 생성 (id = storeId, name = storeId)
3. 중복 확인: (storeId, username) 유니크 검증
   - 중복이면: 409 Conflict 에러
4. 비밀번호 해싱: bcrypt.hash(password, 10)
5. Admin 레코드 생성
6. JWT 토큰 발급: { adminId, storeId, role: 'admin', exp: 16h }
7. 반환: { admin: { id, storeId, username }, token }
```

### 관리자 로그인
```
Input: { storeId, username, password }

1. 로그인 시도 제한 확인 (identifier = storeId:username)
   - 잠금 상태면: 429 Too Many Requests (남은 잠금 시간 포함)
2. Admin 조회: WHERE storeId = ? AND username = ?
   - 없으면: 시도 횟수 증가 → 401 Unauthorized
3. 비밀번호 검증: bcrypt.compare(password, admin.passwordHash)
   - 불일치: 시도 횟수 증가 → 401 Unauthorized
4. 시도 횟수 리셋
5. JWT 토큰 발급
6. 반환: { admin: { id, storeId, username }, token }
```

### 테이블 로그인
```
Input: { storeId, tableNumber, password }

1. Table 조회: WHERE storeId = ? AND tableNumber = ?
   - 없으면: 401 Unauthorized
2. 비밀번호 검증: bcrypt.compare(password, table.passwordHash)
   - 불일치: 401 Unauthorized
3. JWT 토큰 발급: { tableId, storeId, tableNumber, role: 'table', exp: 16h }
4. 반환: { table: { id, storeId, tableNumber }, token }
```

---

## 2. 메뉴 관리 플로우

### 메뉴 등록
```
Input: { name, price, description?, imageUrl?, categoryId, storeId }

1. 입력 검증
   - name: 1~100자, 필수
   - price: 정수, >= 0, 필수
   - categoryId: 필수, 해당 매장의 유효한 카테고리인지 확인
   - description: 최대 500자 (선택)
   - imageUrl: URL 형식 검증 (선택)
2. 카테고리 존재 확인: Category WHERE id = categoryId AND storeId = ?
   - 없으면: 400 Bad Request
3. sortOrder 결정: 해당 카테고리 내 MAX(sortOrder) + 1
4. MenuItem 레코드 생성
5. 반환: 생성된 MenuItem
```

### 메뉴 목록 조회 (고객용)
```
Input: { storeId }

1. 카테고리 조회: Category WHERE storeId = ? ORDER BY sortOrder
2. 각 카테고리별 메뉴 조회: MenuItem WHERE categoryId = ? AND isAvailable = 1 ORDER BY sortOrder
3. 반환: [{ category, menuItems: [...] }, ...]
```

---

## 3. 주문 플로우

### 주문 생성
```
Input: { storeId, tableId, items: [{ menuItemId, quantity }] }

1. 입력 검증
   - items 배열 비어있지 않음
   - 각 item의 quantity >= 1
2. 활성 세션 확인: TableSession WHERE tableId = ? AND completedAt IS NULL
   - 없으면: 새 세션 자동 생성 (UUID v4)
3. 각 메뉴 아이템 검증 및 스냅샷 생성:
   FOR EACH item IN items:
     - MenuItem 조회 (id = menuItemId, storeId 일치, isAvailable = 1)
     - 없거나 비활성이면: 400 Bad Request (해당 메뉴 정보 포함)
     - 스냅샷: { menuName: menuItem.name, unitPrice: menuItem.price }
4. 총 금액 계산: SUM(unitPrice * quantity)
5. Order 레코드 생성 (status = 'pending')
6. OrderItem 레코드들 생성
7. SSE 이벤트 발행: 'new_order' (주문 정보 포함)
8. 반환: { order: { id, totalAmount, status, createdAt, items: [...] } }
```

### 주문 상태 변경 (관리자)
```
Input: { orderId, status }

1. 권한 확인: role = 'admin'
2. Order 조회
   - 없으면: 404 Not Found
3. 상태 전이 검증:
   - pending → preparing: OK
   - pending → completed: OK
   - preparing → completed: OK
   - 그 외: 400 Bad Request (허용되지 않는 상태 전이)
4. Order.status 업데이트
5. SSE 이벤트 발행: 'order_updated'
6. 반환: 업데이트된 Order
```

### 주문 삭제 (관리자)
```
Input: { orderId }

1. 권한 확인: role = 'admin'
2. Order 조회 (+ storeId 일치 확인)
   - 없으면: 404 Not Found
3. OrderItem 삭제: WHERE orderId = ?
4. Order 삭제
5. SSE 이벤트 발행: 'order_deleted' (orderId, tableId 포함)
6. 반환: 204 No Content
```

---

## 4. 테이블 세션 플로우

### 테이블 이용 완료
```
Input: { tableId }

1. 권한 확인: role = 'admin'
2. 활성 세션 확인: TableSession WHERE tableId = ? AND completedAt IS NULL
   - 없으면: 400 Bad Request (활성 세션 없음)
3. 세션 종료: completedAt = NOW()
4. SSE 이벤트 발행: 'session_completed' (tableId, sessionId 포함)
5. 반환: { message: 'completed', sessionId, completedAt }
```

### 과거 주문 내역 조회
```
Input: { tableId, startDate?, endDate? }

1. 권한 확인: role = 'admin'
2. 완료된 세션 조회:
   TableSession WHERE tableId = ? AND completedAt IS NOT NULL
   - startDate 있으면: AND completedAt >= startDate
   - endDate 있으면: AND completedAt <= endDate
   - ORDER BY completedAt DESC
3. 각 세션별 주문 조회: Order WHERE sessionId = ? (+ OrderItems)
4. 반환: [{ session: { id, startedAt, completedAt }, orders: [...] }, ...]
```

---

## 5. SSE 플로우

### 클라이언트 연결
```
Input: HTTP GET /api/sse/orders (Authorization: Bearer {admin_token})

1. 토큰 검증 (role = 'admin')
2. Response 헤더 설정:
   - Content-Type: text/event-stream
   - Cache-Control: no-cache
   - Connection: keep-alive
3. 클라이언트를 매장별 목록에 추가: clients[storeId].push(res)
4. 연결 해제 이벤트 등록: req.on('close', () => removeClient(res))
5. 30초 간격 heartbeat 시작: setInterval(() => res.write(': ping\n\n'), 30000)
```

### 이벤트 브로드캐스트
```
Input: { storeId, eventType, data }

1. 해당 매장의 클라이언트 목록 조회: clients[storeId]
2. 각 클라이언트에 이벤트 전송:
   res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`)
3. 전송 실패한 클라이언트는 목록에서 제거
```
