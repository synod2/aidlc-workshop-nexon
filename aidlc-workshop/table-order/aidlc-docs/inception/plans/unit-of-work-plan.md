# Unit of Work Plan - 테이블오더 서비스

## 분해 범위
모놀리식 아키텍처(단일 backend + 단일 frontend)에서 논리적 모듈 단위로 작업을 분해합니다.

---

## 분해 질문

### Question 1
개발 순서를 어떻게 진행하시겠습니까?

A) 백엔드 전체 먼저 → 프론트엔드 전체 (순차적)
B) 기능 단위로 백엔드+프론트엔드 함께 (수직 슬라이스)
C) 핵심 기능(인증+메뉴+주문) 먼저, 부가 기능(테이블관리+SSE) 나중에
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
단위 작업의 크기를 어떻게 나누시겠습니까?

A) 큰 단위 (Backend 1개 + Frontend 1개 = 총 2개 유닛)
B) 중간 단위 (도메인별: 인증, 메뉴, 주문, 테이블/SSE = 4~5개 유닛)
C) 작은 단위 (각 기능별 세분화 = 6개 이상 유닛)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## 실행 계획

답변 수집 후 아래 순서로 유닛 문서를 생성합니다:

- [x] unit-of-work.md - 유닛 정의 및 책임
- [x] unit-of-work-dependency.md - 유닛 간 의존성 매트릭스
- [x] unit-of-work-story-map.md - 기능 요구사항 → 유닛 매핑
- [x] 유닛 경계 및 의존성 검증
