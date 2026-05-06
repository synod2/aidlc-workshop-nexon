# Domain Entities - 테이블오더 서비스

## Entity Relationship Diagram (Text)

```
Store 1──N Admin
Store 1──N Table
Store 1──N Category

Table 1──N TableSession
TableSession 1──N Order

Category 1──N MenuItem

Order 1──N OrderItem
OrderItem N──1 MenuItem (참조)
```

---

## Entity Definitions

### Store (매장)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PK, NOT NULL | 매장 고유 식별자 |
| name | TEXT | NOT NULL | 매장명 |
| createdAt | TEXT (ISO8601) | NOT NULL, DEFAULT NOW | 생성 시각 |

### Admin (관리자)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 관리자 ID |
| storeId | TEXT | FK → Store.id, NOT NULL | 소속 매장 |
| username | TEXT | NOT NULL, UNIQUE per store | 사용자명 |
| passwordHash | TEXT | NOT NULL | bcrypt 해시 |
| createdAt | TEXT (ISO8601) | NOT NULL, DEFAULT NOW | 생성 시각 |

**Unique Constraint**: (storeId, username) 조합 유니크

### Table (테이블)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 테이블 ID |
| storeId | TEXT | FK → Store.id, NOT NULL | 소속 매장 |
| tableNumber | INTEGER | NOT NULL | 테이블 번호 |
| passwordHash | TEXT | NOT NULL | bcrypt 해시 (태블릿 로그인용) |
| createdAt | TEXT (ISO8601) | NOT NULL, DEFAULT NOW | 생성 시각 |

**Unique Constraint**: (storeId, tableNumber) 조합 유니크

### TableSession (테이블 세션)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT (UUID) | PK, NOT NULL | 세션 ID |
| tableId | INTEGER | FK → Table.id, NOT NULL | 테이블 |
| storeId | TEXT | FK → Store.id, NOT NULL | 매장 |
| startedAt | TEXT (ISO8601) | NOT NULL, DEFAULT NOW | 세션 시작 시각 |
| completedAt | TEXT (ISO8601) | NULL | 이용 완료 시각 (NULL=활성) |

**비즈니스 규칙**: 테이블당 활성 세션(completedAt IS NULL)은 최대 1개

### Category (카테고리)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 카테고리 ID |
| storeId | TEXT | FK → Store.id, NOT NULL | 소속 매장 |
| name | TEXT | NOT NULL | 카테고리명 |
| sortOrder | INTEGER | NOT NULL, DEFAULT 0 | 정렬 순서 |

### MenuItem (메뉴 항목)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 메뉴 ID |
| categoryId | INTEGER | FK → Category.id, NOT NULL | 소속 카테고리 |
| storeId | TEXT | FK → Store.id, NOT NULL | 소속 매장 |
| name | TEXT | NOT NULL | 메뉴명 |
| price | INTEGER | NOT NULL, >= 0 | 가격 (원 단위) |
| description | TEXT | NULL | 메뉴 설명 |
| imageUrl | TEXT | NULL | 이미지 URL |
| sortOrder | INTEGER | NOT NULL, DEFAULT 0 | 정렬 순서 |
| isAvailable | INTEGER | NOT NULL, DEFAULT 1 | 판매 가능 여부 (0/1) |
| createdAt | TEXT (ISO8601) | NOT NULL, DEFAULT NOW | 생성 시각 |

### Order (주문)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 주문 ID |
| sessionId | TEXT | FK → TableSession.id, NOT NULL | 테이블 세션 |
| tableId | INTEGER | FK → Table.id, NOT NULL | 테이블 |
| storeId | TEXT | FK → Store.id, NOT NULL | 매장 |
| totalAmount | INTEGER | NOT NULL, >= 0 | 총 주문 금액 |
| status | TEXT | NOT NULL, DEFAULT 'pending' | 주문 상태 |
| createdAt | TEXT (ISO8601) | NOT NULL, DEFAULT NOW | 주문 시각 |

**status 값**: 'pending' (대기중), 'preparing' (준비중), 'completed' (완료)

### OrderItem (주문 항목)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 주문 항목 ID |
| orderId | INTEGER | FK → Order.id, NOT NULL | 소속 주문 |
| menuItemId | INTEGER | FK → MenuItem.id, NOT NULL | 메뉴 참조 |
| menuName | TEXT | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | INTEGER | NOT NULL, >= 1 | 수량 |
| unitPrice | INTEGER | NOT NULL, >= 0 | 주문 시점 단가 (스냅샷) |

**설계 결정**: menuName과 unitPrice는 주문 시점의 스냅샷으로 저장 (메뉴 변경 시에도 주문 이력 보존)
