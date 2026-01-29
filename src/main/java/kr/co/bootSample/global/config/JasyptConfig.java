package kr.co.bootSample.global.config;

import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;
import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jasypt 암호화 설정을 위한 클래스입니다.
 * 
 * @EnableEncryptableProperties 를 통해 YAML 파일 내 ENC() 형식을 해석합니다.
 */
@Configuration
@EnableEncryptableProperties
public class JasyptConfig {

    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();

        // 암호화 키 (환경 변수 사용 권장: -Djasypt.encryptor.password=키값)
        // 환경 변수가 없을 경우 기본값을 사용하도록 설정 (실제 운영 시에는 반드시 외부에서 주입)
        String password = System.getProperty("jasypt.encryptor.password");
        if (password == null || password.isEmpty()) {
            password = System.getenv("JASYPT_PASSWORD");
        }
        if (password == null || password.isEmpty()) {
            password = "boot_sample_secret_key"; // 기본값 (학습용)
        }

        config.setPassword(password);
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.NoIvGenerator");
        config.setStringOutputType("base64");

        encryptor.setConfig(config);
        return encryptor;
    }
}
