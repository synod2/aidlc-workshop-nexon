# Build Instructions - 테이블오더 서비스

## Prerequisites
- **Node.js**: v18 이상
- **npm**: v9 이상
- **OS**: Windows/macOS/Linux

## Build Steps

### 1. 의존성 설치

```bash
# 루트에서 전체 설치
npm run install:all

# 또는 개별 설치
cd backend && npm install
cd ../frontend && npm install
```

### 2. 백엔드 빌드

```bash
cd backend
npm run build
```

**Expected Output**: `dist/` 폴더에 컴파일된 JavaScript 파일 생성

### 3. 프론트엔드 빌드

```bash
cd frontend
npm run build
```

**Expected Output**: `dist/` 폴더에 번들된 정적 파일 생성

### 4. 빌드 검증
- backend/dist/index.js 존재 확인
- frontend/dist/index.html 존재 확인

## 개발 모드 실행

### 백엔드 (포트 3000)
```bash
cd backend
npm run dev
```

### 프론트엔드 (포트 5173, API 프록시 → 3000)
```bash
cd frontend
npm run dev
```

## 환경 변수 (선택)
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | 백엔드 서버 포트 |
| JWT_SECRET | table-order-secret-key | JWT 서명 키 |

## Troubleshooting

### better-sqlite3 설치 실패
- **원인**: 네이티브 모듈 빌드 도구 필요
- **해결**: `npm install --build-from-source` 또는 node-gyp 설치

### TypeScript 컴파일 에러
- **원인**: 타입 불일치
- **해결**: `npx tsc --noEmit`으로 에러 확인 후 수정
