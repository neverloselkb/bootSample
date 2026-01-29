package kr.co.bootSample.domain.board.dto;

import java.time.LocalDateTime;

/**
 * 댓글 정보를 반환하기 위한 응답 DTO입니다.
 */
public record CommentResponse(
        Long commentId,
        String content,
        String nickname,
        String username,
        LocalDateTime createdAt) {
}
