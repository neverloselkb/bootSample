package kr.co.bootSample.domain.member;

import kr.co.bootSample.domain.member.dto.MemberResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 전용 사용자 관리 API를 제공하는 컨트롤러입니다.
 */
@Tag(name = "Admin", description = "관리자 전용 API (사용자 관리)")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final MemberRepository memberRepository;
    private final MemberService memberService;

    /**
     * 전체 사용자 목록 조회 API (ADMIN 전용)
     */
    @Operation(summary = "전체 사용자 목록 조회", description = "시스템에 등록된 모든 사용자 정보를 조회합니다. (관리자 권한 필요)")
    @GetMapping("/members")
    public ResponseEntity<List<MemberResponse>> listMembers() {
        List<MemberResponse> members = memberRepository.findAll().stream()
                .map(m -> new MemberResponse(
                        m.getMemberId(),
                        m.getUsername(),
                        m.getNickname(),
                        m.getRole(),
                        m.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(members);
    }

    /**
     * 사용자 권한 변경 API (ADMIN 전용)
     */
    @Operation(summary = "사용자 권한 변경", description = "특정 사용자의 권한(USER, ADMIN)을 변경합니다. (관리자 권한 필요)")
    @PostMapping("/members/{id}/role")
    public ResponseEntity<Void> changeRole(@PathVariable("id") Long memberId, @RequestBody String role) {
        // role 문자열이 따옴표를 포함할 수 있으므로 제거 (JSON 단순 문자열 처리 시)
        String cleanRole = role.replace("\"", "").trim();
        memberService.updateRole(memberId, Role.valueOf(cleanRole));
        return ResponseEntity.ok().build();
    }
}
