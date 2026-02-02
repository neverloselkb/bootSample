package kr.co.bootSample.global.file;

import kr.co.bootSample.domain.board.Board;
import kr.co.bootSample.domain.board.BoardFile;
import kr.co.bootSample.domain.board.BoardFileRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * 파일 업로드 및 유틸리티 기능을 제공하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
public class FileService {

    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.file.paths.board:board}")
    private String boardPath;

    @Value("${app.file.paths.editor:editor}")
    private String editorPath;

    private final BoardFileRepository boardFileRepository;

    /**
     * 여러 파일을 업로드하고 정보를 저장합니다. (게시판용)
     */
    @Transactional
    public List<BoardFile> uploadFiles(List<MultipartFile> files, Board board) throws IOException {
        List<BoardFile> boardFiles = new ArrayList<BoardFile>();
        if (files == null || files.isEmpty())
            return boardFiles;

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                boardFiles.add(uploadFile(file, board));
            }
        }
        return boardFiles;
    }

    /**
     * 단일 파일을 업로드하고 정보를 저장합니다. (게시판용)
     */
    @Transactional
    public BoardFile uploadFile(MultipartFile file, Board board) throws IOException {
        log.debug("파일 업로드 시작: {}, 게시글 ID: {}", file.getOriginalFilename(), board.getBoardId());
        String originName = file.getOriginalFilename();
        String storedName = generateStoredName(originName);
        // 게시판 전용 경로 사용 (boardPath)
        String subDirName = boardPath;
        String relativeStoredName = subDirName + File.separator + storedName;
        String fullPath = getFullPath(relativeStoredName);

        // 디렉토리 생성
        File dir = new File(uploadDir + File.separator + subDirName);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 파일 저장
        file.transferTo(new File(fullPath));

        BoardFile boardFile = BoardFile.builder()
                .board(board)
                .originName(originName)
                .storedName(relativeStoredName) // DB에는 상대 경로(경로+파일명) 저장
                .filePath(fullPath)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .build();

        return Objects.requireNonNull(boardFileRepository.save(Objects.requireNonNull(boardFile)));
    }

    /**
     * 단일 파일을 저장하고 저장된 상대 경로명을 반환합니다. (이미지 핸들러용)
     */
    public String storeEditorFile(MultipartFile file) throws IOException {
        log.debug("에디터 이미지 저장 시작: {}", file.getOriginalFilename());
        String originName = file.getOriginalFilename();
        String storedName = generateStoredName(originName);
        // 에디터 전용 경로 사용 (editorPath)
        String subDirName = editorPath;
        String relativeStoredName = subDirName + File.separator + storedName;
        String fullPath = getFullPath(relativeStoredName);

        File dir = new File(uploadDir + File.separator + subDirName);
        if (!dir.exists())
            dir.mkdirs();

        file.transferTo(new File(fullPath));
        return relativeStoredName;
    }

    /**
     * 파일 삭제
     */
    public void deleteFile(String relativeStoredName) {
        log.info("물리 파일 삭제 시도: {}", relativeStoredName);
        File file = new File(getFullPath(relativeStoredName));
        if (file.exists()) {
            file.delete();
        }
    }

    private String generateStoredName(String originName) {
        String ext = getExtension(originName);
        return UUID.randomUUID().toString() + "." + ext;
    }

    private String getExtension(String fileName) {
        if (fileName == null)
            return "bin";
        int pos = fileName.lastIndexOf(".");
        if (pos == -1)
            return "bin";
        return fileName.substring(pos + 1);
    }

    public String getFullPath(String relativeStoredName) {
        // relativeStoredName에 이미 subDir가 포함되어 있음 (예: board/uuid.ext)
        return uploadDir + File.separator + relativeStoredName;
    }
}
