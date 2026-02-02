package kr.co.bootSample.domain.board;

import kr.co.bootSample.domain.board.dto.CommentRequest;
import kr.co.bootSample.domain.board.dto.CommentResponse;
import kr.co.bootSample.domain.member.Member;
import kr.co.bootSample.domain.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 댓글 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

        private final CommentRepository commentRepository;
        private final BoardRepository boardRepository;
        private final MemberRepository memberRepository;

        /**
         * 댓글을 작성합니다.
         */
        public Long save(Long boardId, CommentRequest request, String username) {
                Board board = boardRepository.findById(Objects.requireNonNull(boardId))
                                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

                Member member = memberRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                Comment comment = Comment.builder()
                                .content(request.content())
                                .board(board)
                                .member(member)
                                .build();

                return Objects.requireNonNull(commentRepository.save(Objects.requireNonNull(comment))).getCommentId();
        }

        /**
         * 특정 게시글의 모든 댓글을 조회합니다.
         */
        @Transactional(readOnly = true)
        public List<CommentResponse> findAll(Long boardId) {
                return commentRepository.findAllByBoardId(Objects.requireNonNull(boardId)).stream()
                                .map(comment -> new CommentResponse(
                                                comment.getCommentId(),
                                                comment.getContent(),
                                                comment.getMember().getNickname(),
                                                comment.getMember().getUsername(),
                                                comment.getCreatedAt()))
                                .collect(Collectors.toList());
        }

        /**
         * 댓글을 삭제합니다. 작성자 확인이 필요합니다.
         */
        public void delete(Long commentId, String username) {
                Comment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

                if (!comment.getMember().getUsername().equals(username)) {
                        throw new RuntimeException("삭제 권한이 없습니다.");
                }

                commentRepository.delete(comment);
        }
}
