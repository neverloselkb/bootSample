package kr.co.bootSample.domain.board;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Board 엔티티를 위한 Repository 인터페이스입니다.
 */
public interface BoardRepository extends JpaRepository<Board, Long>, BoardRepositoryCustom {

}
