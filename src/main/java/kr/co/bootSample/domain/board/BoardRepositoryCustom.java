package kr.co.bootSample.domain.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Querydsl을 사용한 커스텀 쿼리 메서드를 정의하는 인터페이스입니다.
 */
public interface BoardRepositoryCustom {

    /**
     * 키워드 기반 동적 검색 및 페이징을 수행합니다.
     * 
     * @param keyword  검색어 (제목, 내용, 닉네임 대상)
     * @param pageable 페이징 정보
     * @return 페이징 처리된 게시글 목록
     */
    Page<Board> findAllByKeywordCustom(String keyword, Pageable pageable);
}
