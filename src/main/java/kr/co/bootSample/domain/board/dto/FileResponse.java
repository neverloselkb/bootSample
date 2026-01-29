package kr.co.bootSample.domain.board.dto;

/**
 * 첨부파일 정보를 반환하기 위한 DTO입니다.
 */
public record FileResponse(
        Long fileId,
        String originName,
        String storedName) {
}
