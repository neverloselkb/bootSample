package kr.co.bootSample.domain.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Board 엔티티를 위한 Repository 인터페이스입니다.
 */
public interface BoardRepository extends JpaRepository<Board, Long> {

    /**
     * 검색어와 페이징을 지원하는 게시글 조회 쿼리입니다.
     */
    @Query(value = "SELECT b FROM Board b JOIN FETCH b.member " +
            "WHERE (:keyword IS NULL OR b.title LIKE %:keyword% " +
            "OR b.content LIKE %:keyword% " +
            "OR b.member.nickname LIKE %:keyword%)", countQuery = "SELECT COUNT(b) FROM Board b " +
                    "WHERE (:keyword IS NULL OR b.title LIKE %:keyword% " +
                    "OR b.content LIKE %:keyword% " +
                    "OR b.member.nickname LIKE %:keyword%)")
    Page<Board> findAllByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
