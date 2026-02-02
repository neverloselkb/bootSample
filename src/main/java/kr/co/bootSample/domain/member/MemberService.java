package kr.co.bootSample.domain.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Objects;

/**
 * 회워 관련 비즈니스 로직을 처리하고 Spring Security의 UserDetailsService를 구현합니다.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class MemberService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
        return createUser(member);
    }

    private UserDetails createUser(Member member) {
        return new User(member.getUsername(), member.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority(member.getRole().getKey())));
    }

    /**
     * 회원 가입 처리를 수행합니다.
     */
    public Long signup(String username, String password, String nickname) {
        if (memberRepository.existsByUsername(username)) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        Member member = Member.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .nickname(nickname)
                .role(Role.USER)
                .build();

        return Objects.requireNonNull(memberRepository.save(Objects.requireNonNull(member))).getMemberId();
    }

    /**
     * 사용자의 권한을 변경합니다. (관리자 전용)
     */
    public void updateRole(Long memberId, Role role) {
        Member member = memberRepository.findById(Objects.requireNonNull(memberId))
                .orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));
        member.update(member.getNickname(), role);
    }
}
