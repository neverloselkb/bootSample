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

### [추천] JAR 볼륨 마운트 방식 (이미지 빌드 없이 빠른 배포)
파일을 바꿀 때마다 이미지를 다시 빌드할 필요가 없는 방식입니다.

1. **docker-compose.yml** 작성:
```yaml
version: '3.8'
services:
  boot-api:
    image: eclipse-temurin:21-jre  # 표준 Java 이미지 바로 사용
    container_name: boot-api
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JASYPT_PASSWORD=boot_sample_secret_key 
      - SPRING_DATASOURCE_URL=jdbc:mariadb://[[URL]]?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Seoul
      - SPRING_DATASOURCE_USERNAME=[[Username]]
      - SPRING_DATASOURCE_PASSWORD=[[Password]]
    volumes:
      - .:/app                     # 현재 폴더 전체를 /app에 연결
      - ./uploads:/app/uploads
    working_dir: /app
    entrypoint: ["java", "-jar", "bootSample-0.0.1-SNAPSHOT.jar"]
    restart: always
```

2. **배포 순서**:
   - 로컬에서 빌드한 `bootSample-0.0.1-SNAPSHOT.jar`를 NAS 폴더에 **덮어쓰기** 합니다.
   - Container Manager에서 해당 컨테이너를 **[작업] -> [재시작]**만 누릅니다.
   - **끝!** 이미지를 다시 지우고 만들 필요가 없습니다.

---

## 4. 로그 확인 (Troubleshooting)
배포가 잘 되었는지, 에러가 없는지 확인하는 가장 확실한 방법입니다.

1. **Container Manager UI**: 컨테이너 상세보기 -> **로그** 탭 클릭.
2. **실시간 확인**: 우측 상단의 '로그 다운로드' 옆에 실시간 뷰어가 있습니다.
3. **확인할 문구**: `### SwaggerConfig Bean Initialized Successfully ###`

---
