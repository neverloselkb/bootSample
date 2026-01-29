package kr.co.bootSample.domain.board.dto;

import java.time.LocalDateTime;

/**
 * 게시글 목록 조회를 위한 Response DTO입니다.
 */
public record BoardResponse(
        Long boardId,
        String title,
        String nickname,
        LocalDateTime createdAt) {
}
