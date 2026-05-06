# Unit of Work Dependencies - 테이블오더 서비스

## 의존성 매트릭스

| Unit | 의존 대상 | 의존 유형 |
|------|-----------|-----------|
| Unit 1 (프로젝트 초기 설정) | 없음 | - |
| Unit 2 (인증) | Unit 1 | DB 스키마, 프로젝트 구조 |
| Unit 3 (메뉴) | Unit 1, Unit 2 | DB 스키마, 인증 미들웨어 |
| Unit 4 (주문) | Unit 1, Unit 2, Unit 5 | DB 스키마, 인증, 세션 확인 |
| Unit 5 (테이블) | Unit 1, Unit 2 | DB 스키마, 인증 미들웨어 |
| Unit 6 (SSE) | Unit 1, Unit 2, Unit 4 | DB, 인증, 주문 이벤트 연동 |
| Unit 7 (FE 초기 설정) | Unit 2 | 백엔드 인증 API 필요 |
| Unit 8 (고객-메뉴) | Unit 7, Unit 2, Unit 3 | FE 구조, 인증 API, 메뉴 API |
| Unit 9 (고객-주문) | Unit 7, Unit 4 | FE 구조, 주문 API |
| Unit 10 (관리자-메뉴) | Unit 7, Unit 2, Unit 3 | FE 구조, 인증 API, 메뉴 API |
| Unit 11 (관리자-대시보드) | Unit 7, Unit 4, Unit 5, Unit 6 | FE 구조, 주문/테이블/SSE API |

## 개발 순서 (Critical Path)

```
Unit 1 (초기 설정)
  |
  +---> Unit 2 (인증)
  |       |
  |       +---> Unit 3 (메뉴)
  |       |
  |       +---> Unit 5 (테이블)
  |               |
  |               +---> Unit 4 (주문)
  |                       |
  |                       +---> Unit 6 (SSE)
  |
  +---> [Backend 완료]
          |
          +---> Unit 7 (FE 초기 설정)
                  |
                  +---> Unit 8 (고객-메뉴)
                  |       |
                  |       +---> Unit 9 (고객-주문)
                  |
                  +---> Unit 10 (관리자-메뉴)
                  |       |
                  |       +---> Unit 11 (관리자-대시보드)
                  |
                  +---> [Frontend 완료]
```

## 순서 제약사항

### 필수 선행 관계
1. Unit 1 → 모든 백엔드 유닛 (DB 스키마 필요)
2. Unit 2 → Unit 3, 4, 5, 6 (인증 미들웨어 필요)
3. Unit 5 → Unit 4 (세션 확인 로직 필요)
4. Unit 4 → Unit 6 (주문 이벤트 연동)
5. Unit 7 → 모든 프론트엔드 유닛 (프로젝트 구조 필요)
6. Unit 8 → Unit 9 (메뉴 조회 후 장바구니/주문)

### 병렬 가능 유닛
- Unit 3 (메뉴) ∥ Unit 5 (테이블) - 독립적
- Unit 8 (고객-메뉴) ∥ Unit 10 (관리자-메뉴) - 독립적
