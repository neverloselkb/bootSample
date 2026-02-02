package kr.co.bootSample.global.file;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * 파일 업로드 및 다운로드를 처리하는 컨트롤러입니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);

    private final FileService fileService;

    /**
     * 위지윅 에디터(Quill) 전용 이미지 업로드 핸들러
     */
    @PostMapping("/upload/image")
    public ResponseEntity<Map<String, String>> uploadEditorImage(@RequestParam("image") MultipartFile image) {
        try {
            String storedName = fileService.storeEditorFile(image);
            // 브라우저에서 접근 가능한 URL 반환 (하위 경로 포함)
            String imageUrl = "/uploads/" + storedName.replace("\\", "/");

            Map<String, String> response = new HashMap<String, String>();
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("에디터 이미지 업로드 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 일반 파일 다운로드
     */
    @GetMapping("/download/{storedName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String storedName, @RequestParam String originName)
            throws MalformedURLException {
        String fullPath = fileService.getFullPath(storedName);
        UrlResource resource = new UrlResource("file:" + fullPath);

        String encodedOriginName = originName != null
                ? UriUtils.encode(originName, Objects.requireNonNull(StandardCharsets.UTF_8))
                : "file";
        String contentDisposition = "attachment; filename=\"" + encodedOriginName + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .body(resource);
    }
}
