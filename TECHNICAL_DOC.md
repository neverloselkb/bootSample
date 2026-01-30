# 프로젝트 상세 기술 문서 (Technical Documentation)

이 문서는 `bootSample` 프로젝트의 아키텍처, 코드 구조 및 주요 비즈니스 로직의 흐름을 설명합니다.

---

## 1. 백엔드 아키텍처 (Spring Boot)

### 1-1. 전체 구조
백엔드는 **Layered Architecture**를 따르며, 관심사 분리를 통해 유지보수성을 높였습니다.

- `global`: 공통 설정 (Security, JWT, Jasypt, Exception handling)
- `domain`: 비즈니스 도메인별 패키지 구성 (Member, Board, etc.)
  - `controller`: REST API 엔드포인트
  - `service`: 비즈니스 로직 처리
  - `repository`: DB 접근 (Spring Data JPA)
  - `entity`: JPA 엔티티
  - `dto`: 데이터 전송 객체 (Request/Response 분리)

### 1-2. 주요 기능 로직

#### 🟢 JWT 인증 흐름
1. **로그인**: `MemberController.login` 호출 -> `AuthenticationManager`를 통한 인증 -> 성공 시 JWT 발급.
2. **요청 보호**: `JwtAuthenticationFilter`가 모든 요청의 `Authorization` 헤더를 검사.
3. **토큰 검증**: `JwtTokenProvider`에서 토큰의 유효성, 만료 여부 확인 후 `SecurityContext`에 사용자 정보 설정.

#### 🟢 파일 업로드 및 게시판 (Board) 로직
1. **이미지 업로드**: `FileController`를 통해 파일을 서버 local(`uploads/temp`)에 저장하고 URL 반환.
2. **게시글 저장**: 사용자가 에디터(Quill)에서 이미지를 포함한 본문을 작성 -> `BoardService.save` 호출.
3. **이미지 확정**: 본문에 포함된 이미지 경로를 분석하여 `uploads/board`로 이동 및 DB(`BoardFile`) 등록.
4. **이미지 정리**: 수정 시 본문에서 삭제된 이미지를 감지하여 실제 파일 시스템과 DB에서 삭제 (`cleanupUnusedImages`).

---

## 2. 프론트엔드 구조 (React + Vite)

### 2-1. 폴더 구조
- `/src/api`: Axios 인스턴스 및 인터셉터 설정. (JWT 자동 주입)
- `/src/components`: 공통 레이아웃 및 재사용 가능한 UI 컴포넌트.
- `/src/pages`: 페이지 단위 컴포넌트 (BoardList, BoardDetail, Login, etc.).
- `/src/hooks`: 커스텀 훅 (인증 정보 관리 등).

### 2-2. 상태 관리 및 통신
- **Authentication**: `localStorage`에 토큰을 저장하고, Axios 인터셉터를 통해 모든 요청에 Bearer 토큰을 자동으로 포함합니다.
- **Rich Text Editor**: `react-quill-new`를 사용하여 강력한 문서 편집 기능을 제공하며, 이미지 드롭/붙여넣기 시 즉시 서버로 업로드되도록 구현되어 있습니다.

---

## 3. 데이터베이스 스키마 (핵심 엔티티)

- **Member**: 사용자 정보, 권한 관리.
- **Board**: 게시글 제목, 본문, 작성자, 조회수.
- **BoardFile**: 게시글에 포함된 이미지/파일 정보 (경로, 원본 파일명).
- **Comment**: 게시글별 댓글 정보.

---

## 4. 데이터 비전략 (Jasypt)
- DB 패스워드 등 민감 정보는 `ENC(...)` 형식으로 암호화되어 관리됩니다.
- 실행 시 반드시 `-Djasypt.encryptor.password=키값`을 주입해야 합니다.
