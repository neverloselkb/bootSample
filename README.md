# 🚀 BootSample (Full-Stack Board System)

현대적인 웹 애플리케이션의 핵심 기능을 갖춘 **Spring Boot 3**와 **React** 기반의 풀스택 게시판 프로젝트입니다. 
JWT 인증, 페이징/검색, 댓글 시스템 및 이미지 자동 정리 로직이 포함되어 있습니다.

---

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 3.4.1
- **Language**: Java 17
- **Database**: MariaDB
- **ORM**: Spring Data JPA
- **Security**: Spring Security & JWT (Json Web Token)
- **API Doc**: SpringDoc OpenAPI (Swagger UI)
- **Library**: Jsoup (이미지 파일 자동 정리용 HTML 파싱)

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Editor**: React Quill (Rich Text Editor)
- **Context**: React Context API (Auth State Management)

---

## ✨ Key Features

- **🔐 보안 및 인증**: JWT 기반의 무상태(Stateless) 인증 체계. 로그인된 사용자만 글쓰기 및 댓글 작성이 가능하며, 본인 글에 대해서만 수정/삭제 권한 부여.
- **📝 고성능 게시판**: 
  - 페이지네이션을 지원하는 게시글 목록 조회.
  - 제목/내용/작성자 통합 검색 필터.
  - **이미지 자동 정리**: 게시글 수정 시 본문에서 삭제된 이미지를 서버 하드디스크에서도 자동으로 감지해 삭제하여 저장 공간 최적화.
- **💬 댓글 시스템**: 게시글 상세 페이지 내 실시간 댓글 작성 및 삭제.
- **📁 파일 관리**: 멀티 첨부파일 업로드 및 다운로드 기능 (NAS 등 외부 저장소 환경 대응 완료).
- **🌐 환경 분리**: `application-local.yml`과 `application-prod.yml`을 통한 개발/운영 환경 완벽 분리.

---

## 🏃‍♂️ Getting Started

### 1. Database Setup
`brain/` 폴더 내의 `ddl.sql`을 실행하여 테이블을 먼저 생성해 주세요.
- 회원(`member`), 게시판(`board`), 파일(`board_file`), 댓글(`comment`) 테이블이 생성됩니다.

### 2. Backend 실행
1. `src/main/resources/application-local.yml`의 DB 접속 정보를 확인합니다.
2. Maven 빌드 후 실행합니다.
   ```bash
   mvn clean spring-boot:run
   ```

### 3. Frontend 실행
1. `frontend` 폴더로 이동합니다.
2. 의존성 설치 후 개발 서버를 구동합니다.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📂 Project Structure

```text
bootSample/
├── src/main/java/.../domain/    # 도메인 주도 설계(DDD) 기반 패키지
│   ├── member/                  # 회원 및 인증
│   └── board/                   # 게시판, 댓글, 파일 로직
├── src/main/resources/          # 설정 파일 (yml)
├── frontend/
│   ├── src/pages/               # 화면별 페이지 컴포넌트
│   ├── src/api/axios.ts         # JWT 인터셉터 설정
│   └── src/context/             # 전역 상태 관리
└── README.md                    # 본 파일
```

---

## 🔗 API Documentation
서버 구동 후 브라우저에서 아래 주소로 접속하면 전체 API 명세를 확인할 수 있습니다.
- `http://localhost:8080/swagger-ui.html`
