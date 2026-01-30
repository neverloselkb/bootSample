# 오픈 JDK 21 대신 공식 지원되는 Eclipse Temurin 사용 (슬림 버전)
FROM eclipse-temurin:21-jre

# 작업 디렉토리 설정
WORKDIR /app

# JAR 파일 복사 (여러 개의 jar가 있을 수 있으므로 파일명을 명시하거나 하나만 남겨야 합니다)
COPY bootSample-0.0.1-SNAPSHOT.jar app.jar

# 파일 업로드 디렉토리 생성
RUN mkdir -p /app/uploads

# 환경 변수 설정 (기본값)
ENV SPRING_PROFILES_ACTIVE=prod
ENV JASYPT_PASSWORD=""

# 포트 설정
EXPOSE 8080

# 업로드 디렉토리를 볼륨으로 설정
VOLUME /app/uploads

# 실행 명령 (시스템 프로퍼티 -D를 통해 Jasypt 키를 확실하게 전달)
ENTRYPOINT java -Djava.security.egd=file:/dev/./urandom \
    -Djasypt.encryptor.password=${JASYPT_PASSWORD} \
    -jar app.jar
