# Synology NAS 배포 상세 가이드

이 가이드는 `bootSample` 프로젝트를 Synology NAS에 배포하기 위한 전 과정을 다룹니다.

## 1. 사전 준비 (Local 작업)

### 1-1. 백엔드 JAR 빌드
`mvn` 명령어가 인식되지 않는 경우, **eGovFrame IDE (Eclipse)**를 사용하여 빌드하는 것이 가장 간편합니다.

**방법 A: IDE에서 빌드 (추천)**
1. IDE의 **Package Explorer**에서 `bootSample` 프로젝트 우클릭.
2. **Run As** -> **Maven install** 클릭.
3. 빌드가 완료되면 `target` 폴더에 `bootSample-0.0.1-SNAPSHOT.jar` 파일이 생성됩니다.

**방법 B: 터미널에서 빌드 (Maven이 설치된 경우)**
로컬 터미널에서 아래 명령을 실행합니다.
```bash
mvn clean package -DskipTests
```
- 결과물: `target/bootSample-0.0.1-SNAPSHOT.jar`

### 1-2. 프론트엔드 빌드
`frontend` 폴더 내에서 아래 명령을 실행합니다.
```bash
npm run build
```
- 결과물: `frontend/dist` 폴더 내의 정적 파일들

---

## 2. NAS 파일 업로드

NAS의 적절한 위치(예: `/docker/bootSample`)에 폴더를 생성하고 아래 파일들을 업로드합니다.

### 2-1. 백엔드 구성
NAS의 소스 폴더(예: `/docker/bootSample`)에 아래 **두 파일을 같은 위치**에 둡니다.
- `bootSample-0.0.1-SNAPSHOT.jar` (또는 `app.jar`로 이름 변경)
- `Dockerfile`
- **`uploads`** (폴더를 직접 빈 폴더로 생성해 주세요. 파일 업로드 시 사용됩니다.)

### 2-2. 프론트엔드 구성
- `dist` 폴더 전체를 NAS의 `web` 공유 폴더 내 적절한 위치(예: `/web/bootSample-web`)에 업로드합니다.

---

## 3. Synology Container Manager (Docker) 설정

### 3-1. 이미지 빌드 및 컨테이너 생성
1. NAS에서 **Container Manager** 실행.
2. **프로젝트** -> **생성** 클릭.
3. 프로젝트 이름: `boot-sample-api`
4. 경로: `app.jar`와 `Dockerfile`이 있는 폴더 선택.
5. `docker-compose.yml`을 사용하는 대신, **이미지** 탭에서 **작업** -> **가져오기** -> **파일로부터 추가**를 통해 빌드하거나, SSH 접속이 가능하다면 해당 폴더에서 `docker build -t boot-sample-api .` 명령을 실행합니다.
   - *팁: Container Manager UI에서 '프로젝트' 기능을 사용하여 아래 내용을 `docker-compose.yml`로 작성하면 가장 편리합니다.*

```yaml
version: '3.8'
services:
  boot-api:
    build: .
    container_name: boot-api
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      # Jasypt 암호화 키: DB 접속 정보 등을 복호화할 때 사용하는 '마스터 비밀번호'입니다.
      # 현재 프로젝트 설정에는 'boot_sample_secret_key'가 기본값으로 입력되어 있습니다.
      - JASYPT_PASSWORD=boot_sample_secret_key 
    volumes:
      - ./uploads:/app/uploads
    restart: always
```

---

## 4. 프론트엔드 서빙 (Web Station)

1. **Web Station** 실행.
2. **웹 서비스** -> **생성** -> **정적 웹 사이트**.
3. 이름: `boot-sample-frontend`
4. 문서 루트: 업로드한 `dist` 폴더 선택.
5. 생성 완료.

---

## 5. 외부 접속 설정 (역방향 프록시)

**제어판** -> **로그인 포털** -> **고급** -> **역방향 프록시**에서 설정합니다.

### 5-1. 프론트엔드 프록시
- 소스 호스트 이름: `boot-app.yourdomain.me` (HTTPS, 443)
- 대상 호스트 이름: `localhost` (HTTP, Web Station 포트)

### 5-2. 백엔드 프록시
- 소스 호스트 이름: `boot-api.yourdomain.me` (HTTPS, 443)
- 대상 호스트 이름: `localhost` (HTTP, 8080)

> [!TIP]
> **인증서 설정**: 제어판 -> 보안 -> 인증서에서 Let's Encrypt 인증서를 발급받아 위 도메인들에 할당하세요.

---

## 6. 주의 사항
- `application-prod.yml`의 DB 접속 정보가 NAS 내 MariaDB 환경에 맞는지 빌드 전 확인해야 합니다.
- NAS 방화벽에서 8080, 80, 443 포트가 허용되어 있는지 확인하세요.
