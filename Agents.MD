# Agent Instructions: Spring Boot Project

이 프로젝트는 **Spring Boot 3.x** 기반의 Java 백엔드 애플리케이션입니다. AI 에이전트는 아래 지침을 엄격히 따라 코드를 생성, 수정, 리팩토링해야 합니다.
그리고, 모든 아티팩트(*.md)와 설명은 항상 한국어로 작성하고 한국어로 답변하세요.

## 0. 개발환경

- **DB 설정**: NAS에 설치된 MariaDB 10(Port: 3306) 연동을 위한 application.yml 설정을 작성해줘. (최적화된 HikariCP 설정 포함)
- **Security 설정**: 기본적인 Spring Security 설정을 추가해줘.
- **외부 라이브러리**: 성능 측정을 위한 Lombok, Spring Doc(Swagger)도 포함해줘.
- **IDE**: 안티그래비티 AND STS (Spring Tool Suite)를 사용해줘.
- **프로젝트 이름**: bootSample
- **프로젝트 설명**: 스프링부트와 React를 이용한 웹 애플리케이션 샘플
- **프로젝트 타겟**: 개인 학습용으로 사용
- **FrontEnd**: React (TypeScript), Tailwind CSS
- **Infrastructure**: 로컬 PC

## 1. 기술 스택 및 환경
- **Language**: Java 21+ 
- **Framework**: Spring Boot 3.x (Spring Boot 2.x 코드 지양)
- **Build Tool**: Maven
- **Database**: JPA/Hibernate (MariaDB 10)
- **Security**: Spring Security 6.x
- **API**: Spring WebFlux (또는 MVC), Spring Data REST

## 2. 코딩 컨벤션 및 규칙
- **패키지 구조**: 도메인 기반 구조 (`kr.co.bootSample`)를 우선합니다.
- **Entity**:
    - JPA Entity 사용 시 `protected` 기본 생성자를 포함할 것.
    - `Lombok`의 `@Getter`, `@NoArgsConstructor(access = AccessLevel.PROTECTED)` 사용.
    - `@Setter` 사용 금지 (대신 의미 있는 메소드 사용).
- **DTO**:
    - Java 21+ `record` 타입을 적극 활용할 것.
    - 데이터 전달용 DTO는 불변(Immutable)으로 생성.
- **Service**:
    - `@Service` 어노테이션 사용.
    - `@Transactional`을 기본으로 하되, Read-only는 `@Transactional(readOnly = true)` 사용.
- **Controller**:
    - `@RestController` 사용.
    - 응답은 `ResponseEntity<T>` 또는 통일된 공통 응답 포맷 사용.
    - swagger 어노테이션을 기본으로 사용.
- **Exception Handling**:
    - `@ControllerAdvice`를 활용하여 전역 예외 처리.

## 3. 작업 지침
- **코드 생성**: 항상 최신 Spring Boot 3.x의 스타일과 `record` 타입을 적용하세요.
- **리팩토링**: `if-else`가 많으면 다형성(Polymorphism)으로 변경하고, 불필요한 null 체크를 피하세요.
- **테스트**: Junit 5와 AssertJ를 사용한 단위 테스트 코드를 기본으로 작성합니다.
- **주석**: 코드의 의도가 명확하지 않은 경우에만 Javadoc을 한글로 작성하세요.

## 4. 라이브러리 활용
- Validation: `spring-boot-starter-validation`
- MapStruct: DTO-Entity 변환 시 사용.
- Spring AI: AI 관련 기능 추가 시 사용.

## 5. 중요 금지 사항
- `@Autowired` 필드 주입 사용 금지 (생성자 주입 필수).
- DTO에 JPA 어노테이션 사용 금지.
- 비즈니스 로직을 Controller에 작성 금지.
- 학습용이므로 주석을 자세하게 작성할 것.