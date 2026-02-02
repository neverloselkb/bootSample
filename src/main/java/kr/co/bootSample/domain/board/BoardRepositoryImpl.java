package kr.co.bootSample.domain.board;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import kr.co.bootSample.domain.member.QMember;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

import java.util.List;

import static kr.co.bootSample.domain.board.QBoard.board;

/**
 * BoardRepositoryCustom의 구현 클래스입니다.
 * Querydsl을 사용하여 복잡한 검색 쿼리를 안전하고 효율적으로 수행합니다.
 */
@RequiredArgsConstructor
public class BoardRepositoryImpl implements BoardRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Board> findAllByKeywordCustom(String keyword, Pageable pageable) {
        // [1] 데이터 조회 쿼리 (페이징 및 패치 조인 적용)
        List<Board> content = queryFactory
                .selectFrom(board)
                .leftJoin(board.member, QMember.member).fetchJoin() // 작성자 정보까지 한 번에 조회 (N+1 방지)
                .where(searchCondition(keyword))
                .orderBy(board.boardId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (content == null) {
            content = new java.util.ArrayList<Board>();
        }

        // [2] 전체 개수 조회 쿼리 (최적화 가능)
        Long total = queryFactory
                .select(board.count())
                .from(board)
                .leftJoin(board.member, QMember.member)
                .where(searchCondition(keyword))
                .fetchOne();

        long totalCount = (total != null) ? total : 0L;

        return new PageImpl<Board>(content, pageable, totalCount);
    }

    /**
     * 검색 조건 설정 (동적 쿼리)
     * 키워드가 있을 경우 제목, 내용, 닉네임에서 포함 여부를 체크합니다.
     */
    private BooleanExpression searchCondition(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null; // 조건이 없으면 전체 조회
        }
        return board.title.containsIgnoreCase(keyword)
                .or(board.content.containsIgnoreCase(keyword))
                .or(QMember.member.nickname.containsIgnoreCase(keyword));
    }
}
