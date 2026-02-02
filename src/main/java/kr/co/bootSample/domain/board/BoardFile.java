package kr.co.bootSample.domain.board;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 게시글 첨부파일 정보를 담는 엔티티 클래스입니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@EntityListeners(AuditingEntityListener.class)
public class BoardFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(nullable = false)
    private String originName; // 원본 파일명

    @Column(nullable = false)
    private String storedName; // 서버에 저장된 파일명

    @Column(nullable = false, length = 500)
    private String filePath; // 저장 경로

    @Column(nullable = false)
    private Long fileSize; // 파일 크기

    @Column(nullable = false)
    private String fileType; // MIME 타입

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public BoardFile(Board board, String originName, String storedName, String filePath, Long fileSize,
            String fileType) {
        this.board = board;
        this.originName = originName;
        this.storedName = storedName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.fileType = fileType;
    }

    /**
     * 연관관계 편의 메서드입니다.
     */
    public void setBoard(Board board) {
        this.board = board;
    }
}
