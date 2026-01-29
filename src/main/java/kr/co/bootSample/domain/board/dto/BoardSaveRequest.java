package kr.co.bootSample.domain.board.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * 게시글 저장 요청을 위한 DTO입니다.
 */
public record BoardSaveRequest(
                @Schema(description = "게시글 제목", example = "안녕하세요!") @NotBlank(message = "제목은 필수 입력 값입니다.") String title,

                @Schema(description = "게시글 내용", example = "게시판 구현 중입니다.") @NotBlank(message = "내용은 필수 입력 값입니다.") String content) {
}
