package kr.co.bootSample.domain.member.dto;

import kr.co.bootSample.domain.member.Role;

import java.time.LocalDateTime;

/**
 * 사용자 정보 조회를 위한 DTO입니다.
 */
public record MemberResponse(
        Long memberId,
        String username,
        String nickname,
        Role role,
        LocalDateTime createdAt) {
}
