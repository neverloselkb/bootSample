package kr.co.bootSample.domain.board;

import kr.co.bootSample.domain.board.dto.BoardDetailResponse;
import kr.co.bootSample.domain.board.dto.BoardResponse;
import kr.co.bootSample.domain.board.dto.BoardSaveRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 게시판 관련 API를 제공하는 컨트롤러입니다.
 */
@Tag(name = "Board", description = "게시판 관련 API (CRUD)")
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    /**
     * 게시물 목록 조회 API (페이징 및 검색 지원)
     */
    @Operation(summary = "게시글 목록 조회", description = "검색어와 페이징 정보를 이용해 게시글 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<BoardResponse>> list(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "boardId", direction = Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(boardService.findAll(keyword, pageable));
    }

    /**
     * 게시글 상세 조회 API
     */
    @Operation(summary = "게시글 상세 조회", description = "게시글 ID를 이용해 상세 내용을 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<BoardDetailResponse> detail(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.findById(id));
    }

    /**
     * 게시글 등록 API
     */
    @Operation(summary = "게시글 작성", description = "제목, 내용 및 첨부파일을 입력해 새로운 게시글을 작성합니다.")
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> save(
            @Valid @RequestPart("board") BoardSaveRequest request,
            @RequestPart(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files,
            Authentication authentication) throws java.io.IOException {
        return ResponseEntity.ok(boardService.save(request, files, authentication.getName()));
    }

    /**
     * 게시글 수정 API
     */
    @Operation(summary = "게시글 수정", description = "작성자가 게시글 제목, 내용 및 추가 첨부파일을 수정합니다.")
    @PutMapping(value = "/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @Valid @RequestPart("board") BoardSaveRequest request,
            @RequestPart(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files,
            Authentication authentication) throws java.io.IOException {
        boardService.update(id, request, files, authentication.getName());
        return ResponseEntity.ok().build();
    }

    /**
     * 게시글 삭제 API
     */
    @Operation(summary = "게시글 삭제", description = "작성자가 자신의 게시글을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        boardService.delete(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    /**
     * 첨부파일 개별 삭제 API
     */
    @Operation(summary = "첨부파일 삭제", description = "게시글 수정 시 기존 첨부파일을 개별적으로 삭제합니다.")
    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId, Authentication authentication) {
        boardService.deleteFile(fileId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
