package kr.co.bootSample.domain.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Comment 엔티티를 위한 Repository 인터페이스입니다.
 */
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 특정 게시글의 모든 댓글을 작성자 정보와 함께 최신순으로 조회합니다.
     */
    @Query("SELECT c FROM Comment c JOIN FETCH c.member WHERE c.board.boardId = :boardId ORDER BY c.commentId DESC")
    List<Comment> findAllByBoardId(@Param("boardId") Long boardId);
}
