# Unit Test Instructions - 테이블오더 서비스

## 테스트 프레임워크
- **Backend**: Jest + ts-jest (추후 설정)
- **Frontend**: Vitest + Vue Test Utils (추후 설정)

## 백엔드 단위 테스트 시나리오

### AuthService Tests
- 관리자 회원가입 성공
- 중복 username 회원가입 실패 (409)
- 비밀번호 4자 미만 실패
- 관리자 로그인 성공
- 잘못된 비밀번호 로그인 실패
- 5회 실패 후 계정 잠금
- 테이블 로그인 성공
- 존재하지 않는 테이블 로그인 실패

### MenuService Tests
- 메뉴 등록 성공
- 필수 필드 누락 시 실패
- 가격 음수 시 실패
- 존재하지 않는 카테고리 시 실패
- 메뉴 수정 성공
- 메뉴 삭제 성공
- 카테고리별 메뉴 조회

### OrderService Tests
- 주문 생성 성공 (세션 자동 시작)
- 빈 아이템 주문 실패
- 존재하지 않는 메뉴 주문 실패
- 주문 상태 전이 성공 (pending → preparing)
- 잘못된 상태 전이 실패 (completed → pending)
- 주문 삭제 성공
- 금액 계산 정확성

### TableService Tests
- 테이블 등록 성공
- 중복 테이블 번호 실패
- 세션 시작 성공
- 이용 완료 성공
- 활성 세션 없을 때 이용 완료 실패
- 과거 내역 조회 (날짜 필터)

## 프론트엔드 단위 테스트 시나리오

### Cart Store Tests
- 아이템 추가
- 중복 아이템 추가 시 수량 증가
- 아이템 제거
- 수량 변경
- 장바구니 비우기
- 총 금액 계산
- localStorage 저장/복원

### Auth Store Tests
- 로그인 성공 시 토큰 저장
- 로그아웃 시 토큰 제거
- checkAuth로 localStorage 복원

## 테스트 실행 (추후 설정 후)

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 참고
MVP 단계에서는 수동 테스트로 검증하고, 테스트 프레임워크는 추후 설정합니다.
수동 테스트 시 위 시나리오를 기준으로 검증하세요.
