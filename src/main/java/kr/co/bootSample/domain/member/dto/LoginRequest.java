package kr.co.bootSample.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * 로그인 요청을 위한 DTO입니다.
 */
public record LoginRequest(
                @Schema(description = "사용자 아이디", example = "user1") @NotBlank(message = "아이디를 입력해주세요.") String username,

                @Schema(description = "사용자 비밀번호", example = "password123") @NotBlank(message = "비밀번호를 입력해주세요.") String password) {
}
