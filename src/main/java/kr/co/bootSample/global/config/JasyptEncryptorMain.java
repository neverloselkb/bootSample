package kr.co.bootSample.global.config;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

public class JasyptEncryptorMain {
    public static void main(String[] args) {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();

        config.setPassword("boot_sample_secret_key");
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.NoIvGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);

        String url = "jdbc:mariadb://pentiumman.synology.me:3306/neverlose?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Seoul";
        String username = "neverlose";
        String password = "Skrkwk11##";

        System.out.println("URL: ENC(" + encryptor.encrypt(url) + ")");
        System.out.println("Username: ENC(" + encryptor.encrypt(username) + ")");
        System.out.println("Password: ENC(" + encryptor.encrypt(password) + ")");
    }
}
