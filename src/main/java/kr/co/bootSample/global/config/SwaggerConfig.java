package kr.co.bootSample.global.config;

import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class SwaggerConfig {

        // Lombok @Slf4j 대신 프로덕션 안정성을 위해 직접 LoggerFactory 사용
        private static final Logger log = LoggerFactory.getLogger(SwaggerConfig.class);

        public SwaggerConfig() {
                log.info("#################################################");
                log.info("### SwaggerConfig Bean Initialized Successfully ###");
                log.info("#################################################");
        }

        @Bean
        public GlobalOpenApiCustomizer globalOpenApiCustomizer() {
                return openApi -> {
                        log.info(">>> [SwaggerConfig] Customizing OpenAPI - Injecting HTTPS Server URL");

                        // 기존 서버 목록을 모두 지우고 우리가 원하는 것만 넣습니다.
                        openApi.getServers().clear();

                        // 1. 운영 서버 (HTTPS) - 최우선
                        openApi.getServers().add(new Server()
                                        .url("https://boot.pentiumman.synology.me")
                                        .description("Production Server (HTTPS)"));

                        // 2. 로컬 개발 서버
                        openApi.getServers().add(new Server()
                                        .url("http://localhost:8080")
                                        .description("Local Development Server (HTTP)"));

                        log.info(">>> [SwaggerConfig] OpenAPI Customization Completed!");
                };
        }
}
