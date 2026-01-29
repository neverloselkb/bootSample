package kr.co.bootSample.domain.board;

import kr.co.bootSample.domain.board.dto.BoardDetailResponse;
import kr.co.bootSample.domain.board.dto.BoardResponse;
import kr.co.bootSample.domain.board.dto.BoardSaveRequest;
import kr.co.bootSample.domain.board.dto.CommentResponse;
import kr.co.bootSample.domain.board.dto.FileResponse;
import kr.co.bootSample.domain.member.Member;
import kr.co.bootSample.domain.member.MemberRepository;
import kr.co.bootSample.global.file.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 게시판 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final BoardFileRepository boardFileRepository;
    private final FileService fileService;
    private final CommentService commentService;

    /**
     * 게시글을 페이징 및 검색 조건으로 조회합니다.
     */
    @Transactional(readOnly = true)
    public Page<BoardResponse> findAll(String keyword, Pageable pageable) {
        return boardRepository.findAllByKeyword(keyword, pageable)
                .map(board -> new BoardResponse(
                        board.getBoardId(),
                        board.getTitle(),
                        board.getMember().getNickname(),
                        board.getCreatedAt()));
    }

    /**
     * 특정 게시글의 상세 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    public BoardDetailResponse findById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        List<FileResponse> fileList = board.getBoardFileList().stream()
                .map(file -> new FileResponse(file.getFileId(), file.getOriginName(), file.getStoredName()))
                .collect(Collectors.toList());

        // 댓글 목록 조회 추가
        List<CommentResponse> commentList = commentService.findAll(id);

        return new BoardDetailResponse(
                board.getBoardId(),
                board.getTitle(),
                board.getContent(),
                board.getMember().getNickname(),
                board.getMember().getUsername(),
                board.getCreatedAt(),
                board.getModifiedAt(),
                fileList,
                commentList);
    }

    /**
     * 새로운 게시글을 작성합니다.
     */
    public Long save(BoardSaveRequest request, List<MultipartFile> files, String username) throws IOException {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Board board = Board.builder()
                .title(request.title())
                .content(request.content())
                .member(member)
                .build();

        Board savedBoard = boardRepository.save(board);

        // 파일 업로드 처리
        if (files != null && !files.isEmpty()) {
            fileService.uploadFiles(files, savedBoard);
        }

        return java.util.Objects.requireNonNull(savedBoard).getBoardId();
    }

    /**
     * 게시글을 수정합니다. 작성자 확인이 필요합니다.
     */
    public void update(Long id, BoardSaveRequest request, List<MultipartFile> files, String username)
            throws IOException {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (!board.getMember().getUsername().equals(username)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        // [추가] 에디터에서 삭제된 이미지 물리 파일 정리
        cleanupUnusedImages(board.getContent(), request.content());

        board.update(request.title(), request.content());

        // 파일 업로드 처리 (기존 파일은 유지하고 추가하는 방식으로 구현)
        if (files != null && !files.isEmpty()) {
            fileService.uploadFiles(files, board);
        }
    }

    /**
     * 본문 내용 비교를 통해 에디터에서 제거된 이미지를 서버에서 삭제합니다.
     */
    private void cleanupUnusedImages(String oldContent, String newContent) {
        if (oldContent == null || oldContent.isEmpty())
            return;

        Set<String> oldImages = getImagesFromContent(oldContent);
        Set<String> newImages = getImagesFromContent(newContent);

        // 이전에는 있었지만 새 내용에는 없는 이미지 필터링
        oldImages.removeAll(newImages);

        for (String imageUrl : oldImages) {
            // URL 형식: /uploads/editor/uuid.ext -> 실제 삭제를 위해 'editor/uuid.ext'로 변환
            if (imageUrl.startsWith("/uploads/")) {
                String relativePath = imageUrl.replace("/uploads/", "")
                        .replace("/", File.separator);
                fileService.deleteFile(relativePath);
                log.info("에디터 본문에서 삭제된 이미지 파일 정리: {}", relativePath);
            }
        }
    }

    /**
     * HTML 본문에서 서버에 저장된 이미지 경로(/uploads/editor/...)를 추출합니다.
     */
    private Set<String> getImagesFromContent(String content) {
        Set<String> images = new HashSet<>();
        if (content == null || content.isEmpty())
            return images;

        Document doc = Jsoup.parse(content);
        Elements imgs = doc.select("img[src^='/uploads/editor/']");

        for (org.jsoup.nodes.Element img : imgs) {
            images.add(img.attr("src"));
        }
        return images;
    }

    /**
     * 게시글을 삭제합니다. 작성자 또는 관리자 권한이 필요합니다.
     */
    public void delete(Long id, String username) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 작성자 본인이거나 관리자인 경우만 삭제 가능하도록 처리 (Spring Security에서 처리할 수도 있으나 여기서도 체크)
        if (!board.getMember().getUsername().equals(username)) {
            // MemberService에서 권한을 가져와서 체크할 수도 있음. 여기서는 단순화.
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
    }

    /**
     * 특정 첨부파일을 삭제합니다.
     */
    public void deleteFile(Long fileId, String username) {
        BoardFile boardFile = boardFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));

        // 게시글 작성자만 파일 삭제 가능
        if (!boardFile.getBoard().getMember().getUsername().equals(username)) {
            throw new RuntimeException("파일 삭제 권한이 없습니다.");
        }

        // 물리 파일 삭제
        fileService.deleteFile(boardFile.getStoredName());

        // 데이터베이스 레코드 삭제
        boardFileRepository.delete(boardFile);
    }
}
