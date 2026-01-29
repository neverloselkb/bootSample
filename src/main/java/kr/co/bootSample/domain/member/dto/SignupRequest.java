package kr.co.bootSample.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 요청을 처리하기 위한 DTO입니다.
 */
public record SignupRequest(
                @Schema(description = "회원 아이디", example = "testuser") @NotBlank(message = "아이디를 입력해주세요.") @Size(min = 4, max = 20, message = "아이디는 4~20자 사이여야 합니다.") String username,

                @Schema(description = "회원 비밀번호", example = "password123!") @NotBlank(message = "비밀번호를 입력해주세요.") @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.") String password,

                @Schema(description = "회원 닉네임", example = "테스트닉") @NotBlank(message = "닉네임을 입력해주세요.") String nickname) {
}
