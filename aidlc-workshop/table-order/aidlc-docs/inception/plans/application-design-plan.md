# Application Design Plan - 테이블오더 서비스

## 설계 범위
테이블오더 서비스의 컴포넌트 구조, 서비스 레이어, 의존성 관계를 설계합니다.

---

## 설계 질문

아래 질문에 답변해주시면 설계에 반영하겠습니다.
각 질문의 [Answer]: 태그 뒤에 선택한 알파벳을 입력해주세요.

### Question 1
백엔드 프로젝트 구조를 어떻게 구성하시겠습니까?

A) 기능별 폴더 구조 (routes/, controllers/, services/, models/ 등 레이어별 분리)
B) 도메인별 폴더 구조 (auth/, menu/, order/, table/ 등 도메인별 분리)
C) 혼합 구조 (도메인별 폴더 안에 레이어별 파일)
X) Other (please describe after [Answer]: tag below)

[Answer]: a

### Question 2
프론트엔드 상태 관리 방식은 어떻게 하시겠습니까?

A) Pinia (Vue.js 공식 상태 관리 라이브러리)
B) Vuex (레거시 상태 관리)
C) Composables만 사용 (별도 상태 관리 라이브러리 없이)
X) Other (please describe after [Answer]: tag below)

[Answer]: a

### Question 3
API 통신 라이브러리는 무엇을 사용하시겠습니까?

A) Axios
B) Fetch API (네이티브)
C) ky (경량 fetch wrapper)
X) Other (please describe after [Answer]: tag below)

[Answer]: x 적절한걸로추천해줘

### Question 4
ORM/데이터 접근 방식은 어떻게 하시겠습니까?

A) Prisma (타입 안전 ORM)
B) TypeORM
C) Knex.js (쿼리 빌더)
D) better-sqlite3 + 직접 SQL 작성
X) Other (please describe after [Answer]: tag below)

[Answer]: x 적절한걸로 추천해줘

### Question 5
프론트엔드 UI 컴포넌트 라이브러리를 사용하시겠습니까?

A) Vuetify (Material Design)
B) Element Plus
C) PrimeVue
D) Tailwind CSS만 사용 (컴포넌트 라이브러리 없이)
E) 순수 CSS/SCSS만 사용
X) Other (please describe after [Answer]: tag below)

[Answer]: E

### Question 6
모노리포 구조에서 프론트엔드와 백엔드를 어떻게 배치하시겠습니까?

A) 루트에 client/와 server/ 폴더로 분리
B) 루트에 frontend/와 backend/ 폴더로 분리
C) packages/client와 packages/server (npm workspaces)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 설계 실행 계획

답변 수집 후 아래 순서로 설계 문서를 생성합니다:

- [ ] components.md - 컴포넌트 정의 및 책임
- [ ] component-methods.md - 메서드 시그니처 및 인터페이스
- [ ] services.md - 서비스 레이어 정의
- [ ] component-dependency.md - 의존성 관계 및 통신 패턴
- [ ] application-design.md - 통합 설계 문서
