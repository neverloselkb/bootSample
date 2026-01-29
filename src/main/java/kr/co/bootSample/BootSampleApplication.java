package kr.co.bootSample;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 프로젝트의 메인 엔트리 포인트 클래스입니다.
 * 
 * @author Antigravity
 */
@EnableJpaAuditing
@SpringBootApplication
public class BootSampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(BootSampleApplication.class, args);
    }

}
