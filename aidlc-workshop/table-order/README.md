# 테이블오더 서비스

디지털 주문 시스템을 통해 고객에게는 편리한 주문 경험을, 매장 운영자에게는 효율적인 운영 환경을 제공하는 테이블오더 플랫폼입니다.

## 기술 스택

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Vue.js 3 + TypeScript + Pinia
- **Database**: SQLite (better-sqlite3)
- **Real-time**: Server-Sent Events (SSE)

## 프로젝트 구조

```
table-order/
├── backend/          # Express API 서버
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middleware/
│       ├── database/
│       ├── models/
│       └── utils/
├── frontend/         # Vue.js 프론트엔드
│   └── src/
│       ├── views/
│       ├── components/
│       ├── stores/
│       ├── services/
│       └── router/
└── package.json      # 루트 스크립트
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm run install:all
```

### 2. 백엔드 실행 (포트 3000)

```bash
npm run dev:backend
```

### 3. 프론트엔드 실행 (포트 5173)

```bash
npm run dev:frontend
```

### 4. 접속

- 고객용: http://localhost:5173/customer/login
- 관리자용: http://localhost:5173/admin/login

## 사용 방법

### 관리자 설정

1. `/admin/register`에서 관리자 계정 생성 (매장 식별자 + 사용자명 + 비밀번호)
2. `/admin/menus`에서 카테고리 및 메뉴 등록
3. `/admin/tables`에서 테이블 등록 (테이블 번호 + 비밀번호)

### 고객 주문

1. 태블릿에서 `/customer/login` 접속 → 매장ID + 테이블번호 + 비밀번호 입력 (1회)
2. 메뉴 화면에서 원하는 메뉴를 장바구니에 담기
3. 장바구니에서 수량 확인 후 주문 확정
4. 주문 내역에서 주문 상태 확인

### 관리자 모니터링

1. `/admin/dashboard`에서 실시간 주문 확인 (SSE)
2. 주문 상태 변경 (대기중 → 준비중 → 완료)
3. 테이블 이용 완료 처리 (세션 종료)

## API 엔드포인트

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | 관리자 회원가입 | - |
| POST | /api/auth/login | 관리자 로그인 | - |
| POST | /api/auth/tables/login | 테이블 로그인 | - |
| GET | /api/menus | 메뉴 목록 | table/admin |
| POST | /api/menus | 메뉴 등록 | admin |
| PUT | /api/menus/:id | 메뉴 수정 | admin |
| DELETE | /api/menus/:id | 메뉴 삭제 | admin |
| GET | /api/menus/categories | 카테고리 목록 | table/admin |
| POST | /api/menus/categories | 카테고리 등록 | admin |
| POST | /api/orders | 주문 생성 | table/admin |
| GET | /api/orders | 주문 목록 | table/admin |
| PATCH | /api/orders/:id/status | 주문 상태 변경 | admin |
| DELETE | /api/orders/:id | 주문 삭제 | admin |
| GET | /api/tables | 테이블 목록 | admin |
| POST | /api/tables | 테이블 등록 | admin |
| POST | /api/tables/:id/complete | 이용 완료 | admin |
| GET | /api/tables/:id/history | 과거 내역 | admin |
| GET | /api/sse/orders | SSE 스트림 | admin |
