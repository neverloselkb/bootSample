package kr.co.bootSample.domain.board.dto;

import java.time.LocalDateTime;

/**
 * 게시글 상세 조회를 위한 Response DTO입니다.
 */
public record BoardDetailResponse(
        Long boardId,
        String title,
        String content,
        String nickname,
        String username,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt,
        java.util.List<FileResponse> fileList,
        java.util.List<CommentResponse> commentList) {
}
