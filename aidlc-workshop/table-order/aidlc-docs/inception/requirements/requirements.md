# 테이블오더 서비스 - 요구사항 정의서

## Intent Analysis

| 항목 | 내용 |
|------|------|
| **User Request** | 테이블오더 서비스 구축 (디지털 주문 시스템) |
| **Request Type** | New Project (신규 프로젝트) |
| **Scope Estimate** | Multiple Components (프론트엔드 + 백엔드 + DB) |
| **Complexity Estimate** | Moderate (다수의 기능, 실시간 통신 포함) |
| **Depth Level** | Standard |

---

## 1. 기술 스택 결정사항

| 영역 | 선택 |
|------|------|
| **Backend** | Node.js + Express (TypeScript) |
| **Frontend** | Vue.js (TypeScript) |
| **Database** | SQLite |
| **Deployment** | 로컬 개발 환경 (배포는 추후 결정) |
| **Architecture** | 모노리포 (단일 프론트엔드 앱 + 백엔드 API) |

---

## 2. 프로젝트 범위

### 2.1 포함 범위
- 단일 매장 지원 (MVP)
- 고객용 + 관리자용 인터페이스 (하나의 Vue.js 앱에서 라우팅 분리)
- 관리자 회원가입 기능
- 메뉴 이미지는 외부 URL 입력 방식
- 규모 고려 없음 (MVP 단계)

### 2.2 제외 범위
- 결제 처리 (카드, 현금, PG사 연동)
- OAuth/SNS 로그인, 2FA
- 이미지 업로드/리사이징
- 푸시/SMS/이메일 알림
- 주방 기능 (주방 전달, 재고 관리)
- 데이터 분석, 매출 리포트
- 직원 관리, 예약, 리뷰, 다국어
- 외부 연동 (배달, POS, 소셜미디어)

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 고객용 기능

#### FR-C01: 테이블 태블릿 자동 로그인 및 세션 관리
- 관리자가 초기 설정 1회 수행 (매장 식별자, 테이블 번호, 비밀번호)
- 로그인 정보 로컬 저장 후 자동 로그인
- 별도 고객 로그인 절차 없음

#### FR-C02: 메뉴 조회 및 탐색
- 메뉴 화면이 기본(홈) 화면
- 카테고리별 메뉴 분류 및 표시
- 메뉴 상세: 메뉴명, 가격, 설명, 이미지
- 카테고리 간 빠른 이동
- 카드 형태 레이아웃, 터치 친화적 (최소 44x44px)

#### FR-C03: 장바구니 관리
- 메뉴 추가/삭제, 수량 조절
- 총 금액 실시간 계산
- 장바구니 비우기
- 클라이언트 로컬 저장 (새로고침 시 유지)
- 서버 전송은 주문 확정 시에만

#### FR-C04: 주문 생성
- 주문 내역 최종 확인 후 확정
- 성공 시: 주문 번호 표시, 장바구니 비우기, 5초 후 메뉴 화면 리다이렉트
- 실패 시: 에러 메시지 표시, 장바구니 유지
- 주문 정보: 매장ID, 테이블ID, 메뉴 목록(메뉴명, 수량, 단가), 총 금액, 세션ID

#### FR-C05: 주문 내역 조회
- 현재 테이블 세션 주문만 표시
- 주문 시간 순 정렬
- 주문별: 주문 번호, 시각, 메뉴/수량, 금액, 상태(대기중/준비중/완료)
- 이용 완료 처리된 주문 제외

### 3.2 관리자용 기능

#### FR-A01: 관리자 회원가입 및 인증
- 회원가입: 매장 식별자, 사용자명, 비밀번호
- 로그인: 매장 식별자 + 사용자명 + 비밀번호
- JWT 토큰 기반 인증, 16시간 세션 유지
- 비밀번호 bcrypt 해싱
- 로그인 시도 제한
- 브라우저 새로고침 시 세션 유지

#### FR-A02: 실시간 주문 모니터링
- SSE(Server-Sent Events) 기반 실시간 업데이트
- 그리드/대시보드 레이아웃 (테이블별 카드)
- 각 테이블 카드: 총 주문액, 최신 주문 미리보기
- 주문 카드 클릭 시 전체 메뉴 목록 상세 보기
- 주문 상태 변경 (대기중 → 준비중 → 완료)
- 신규 주문 시각적 강조
- 2초 이내 주문 표시

#### FR-A03: 테이블 관리
- **초기 설정**: 테이블 번호/비밀번호 설정, 세션 생성
- **주문 삭제**: 확인 팝업 → 즉시 삭제 → 총 주문액 재계산
- **테이블 이용 완료**: 확인 팝업 → 주문 내역 과거 이력 이동 → 주문/금액 리셋
- **과거 내역 조회**: 테이블별 과거 주문 목록 (시간 역순), 날짜 필터링

#### FR-A04: 메뉴 관리
- 메뉴 CRUD (등록/조회/수정/삭제)
- 메뉴 정보: 메뉴명, 가격, 설명, 카테고리, 이미지 URL
- 카테고리별 조회
- 메뉴 노출 순서 조정
- 필수 필드 검증, 가격 범위 검증

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

### NFR-01: 성능
- SSE 기반 실시간 주문 알림 (2초 이내)
- MVP 단계에서 규모 최적화 불필요

### NFR-02: 보안
- 비밀번호 bcrypt 해싱
- JWT 토큰 인증 (16시간 만료)
- 로그인 시도 제한
- 보안 확장 규칙 미적용 (MVP/프로토타입 단계)

### NFR-03: 사용성
- 터치 친화적 UI (최소 44x44px 버튼)
- 직관적 카드 레이아웃
- 명확한 시각적 계층 구조

### NFR-04: 데이터 관리
- SQLite 단일 파일 DB
- 주문 이력 영구 저장
- 세션 기반 주문 그룹화

---

## 5. 데이터 모델 개요

### 핵심 엔티티
- **Store**: 매장 정보
- **Admin**: 관리자 계정 (매장 연결)
- **Table**: 테이블 정보 (매장 연결)
- **TableSession**: 테이블 세션 (시작/종료 시각)
- **Category**: 메뉴 카테고리
- **MenuItem**: 메뉴 항목
- **Order**: 주문 (테이블 세션 연결)
- **OrderItem**: 주문 항목 (메뉴 연결)
- **OrderHistory**: 과거 주문 이력

---

## 6. API 개요

### 인증 API
- POST /api/auth/register - 관리자 회원가입
- POST /api/auth/login - 관리자 로그인
- POST /api/tables/login - 테이블 태블릿 로그인

### 메뉴 API
- GET /api/menus - 메뉴 목록 조회
- POST /api/menus - 메뉴 등록 (관리자)
- PUT /api/menus/:id - 메뉴 수정 (관리자)
- DELETE /api/menus/:id - 메뉴 삭제 (관리자)

### 주문 API
- POST /api/orders - 주문 생성
- GET /api/orders - 주문 목록 조회
- PATCH /api/orders/:id/status - 주문 상태 변경 (관리자)
- DELETE /api/orders/:id - 주문 삭제 (관리자)

### 테이블 API
- GET /api/tables - 테이블 목록 조회
- POST /api/tables - 테이블 등록 (관리자)
- POST /api/tables/:id/complete - 테이블 이용 완료 (관리자)
- GET /api/tables/:id/history - 과거 주문 내역 조회

### 실시간 API
- GET /api/sse/orders - SSE 주문 스트림 (관리자)

---

## 7. Extension Configuration

| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | No | Requirements Analysis |
| Property-Based Testing | No | Requirements Analysis |
