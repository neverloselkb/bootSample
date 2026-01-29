package kr.co.bootSample.domain.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * BoardFile 엔티티를 위한 Repository 인터페이스입니다.
 */
public interface BoardFileRepository extends JpaRepository<BoardFile, Long> {
    List<BoardFile> findAllByBoard_BoardId(Long boardId);
}
