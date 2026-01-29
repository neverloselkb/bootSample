package kr.co.bootSample.domain.board.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 댓글 작성을 위한 요청 DTO입니다.
 */
public record CommentRequest(
        @NotBlank(message = "내용을 입력해주세요.") String content) {
}
