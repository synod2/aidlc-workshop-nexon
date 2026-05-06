# 요구사항 검증 질문

제공해주신 요구사항 문서를 분석했습니다. 아래 질문에 답변해주시면 더 정확한 요구사항을 정리할 수 있습니다.
각 질문의 [Answer]: 태그 뒤에 선택한 알파벳을 입력해주세요.

---

## Question 1
백엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) Node.js + Express (JavaScript/TypeScript)
B) Node.js + NestJS (TypeScript)
C) Python + FastAPI
D) Java + Spring Boot
E) Go (Gin/Echo)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
프론트엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) React (JavaScript/TypeScript)
B) Vue.js (JavaScript/TypeScript)
C) Next.js (React 기반 풀스택)
D) Svelte/SvelteKit
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
데이터베이스로 어떤 것을 사용하시겠습니까?

A) PostgreSQL
B) MySQL/MariaDB
C) MongoDB (NoSQL)
D) SQLite (경량 개발용)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4
배포 환경은 어떻게 계획하고 계십니까?

A) AWS (EC2, RDS, S3 등)
B) 로컬/온프레미스 서버
C) Docker 컨테이너 기반 (배포 환경 미정)
D) 현재는 로컬 개발 환경만 구성 (배포는 나중에 결정)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성하시겠습니까?

A) 하나의 프론트엔드 앱에서 라우팅으로 분리
B) 별도의 프론트엔드 앱 2개 (고객용 + 관리자용)
C) 고객용은 모바일 최적화 웹앱, 관리자용은 데스크톱 웹앱 (별도 앱)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6
매장(Store)은 단일 매장만 지원하면 되나요, 아니면 다중 매장(멀티테넌트)을 지원해야 하나요?

A) 단일 매장만 지원 (MVP 단계)
B) 다중 매장 지원 (하나의 시스템에서 여러 매장 관리)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7
메뉴 이미지는 어떻게 관리하시겠습니까?

A) 외부 이미지 URL 직접 입력 (별도 이미지 호스팅 사용)
B) 서버에 직접 업로드 (로컬 파일 저장)
C) 클라우드 스토리지 업로드 (S3, GCS 등)
D) MVP에서는 이미지 URL만 지원, 업로드는 추후 구현
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 8
관리자 계정은 어떻게 생성되나요?

A) 시스템 초기 설정 시 하드코딩된 관리자 계정 1개 (seed data)
B) 회원가입 기능으로 관리자가 직접 생성
C) CLI 또는 스크립트로 관리자 계정 생성
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 9
동시 접속 규모는 어느 정도를 예상하시나요?

A) 소규모 (테이블 10개 이하, 동시 접속 20명 이하)
B) 중규모 (테이블 10~50개, 동시 접속 100명 이하)
C) 대규모 (테이블 50개 이상, 동시 접속 100명 이상)
D) MVP 단계에서는 규모 고려하지 않음
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 10: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 blocking constraint로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 11: Property-Based Testing Extension
이 프로젝트에 속성 기반 테스팅(PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 blocking constraint로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 round-trip에만 PBT 규칙 적용
C) No — PBT 규칙 건너뛰기 (단순 CRUD, UI 전용 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: 
