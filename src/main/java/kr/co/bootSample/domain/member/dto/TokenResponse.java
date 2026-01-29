package kr.co.bootSample.domain.member.dto;

/**
 * 토큰 응답을 처리하기 위한 DTO입니다.
 */
public record TokenResponse(
        String accessToken,
        String tokenType) {
    public static TokenResponse of(String accessToken) {
        return new TokenResponse(accessToken, "Bearer");
    }
}
