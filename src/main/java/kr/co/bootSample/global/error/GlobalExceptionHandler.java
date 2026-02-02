package kr.co.bootSample.global.error;

import lombok.Builder;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * 전역 예외 처리기입니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 유효성 검사 실패(Validation) 예외를 처리합니다.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<String, String>();
        e.getBindingResult().getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        String firstMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();

        log.warn("유효성 검사 실패: {}", firstMessage);

        return ResponseEntity.badRequest()
                .body(ErrorResponse.builder()
                        .message(firstMessage)
                        .status(400)
                        .errors(errors)
                        .build());
    }

    /**
     * 비즈니스 로직 예외 (RuntimeException)를 처리합니다.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e) {
        log.error("비즈니스 로직 예외 발생: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ErrorResponse.builder()
                        .message(e.getMessage())
                        .status(400)
                        .build());
    }

    /**
     * 기타 예상치 못한 예외를 처리합니다.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("예상치 못한 서버 오류 발생", e);
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.builder()
                        .message("서버 내부 오류가 발생했습니다.")
                        .status(500)
                        .build());
    }

    @Getter
    @Builder
    public static class ErrorResponse {
        private final String message;
        private final int status;
        private final java.util.Map<String, String> errors;
    }
}
