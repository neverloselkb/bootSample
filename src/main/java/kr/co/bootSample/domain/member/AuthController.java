package kr.co.bootSample.domain.member;

import kr.co.bootSample.domain.member.dto.LoginRequest;
import kr.co.bootSample.domain.member.dto.SignupRequest;
import kr.co.bootSample.domain.member.dto.TokenResponse;
import kr.co.bootSample.global.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * 인증 관련 API를 제공하는 컨트롤러입니다.
 */
@Tag(name = "Authentication", description = "인증 관련 API (회원가입, 로그인)")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberService memberService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    /**
     * 회원 가입 API
     */
    @Operation(summary = "회원가입", description = "아이디, 비밀번호, 닉네임을 입력받아 회원가입을 진행합니다.")
    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(memberService.signup(request.username(), request.password(), request.nickname()));
    }

    /**
     * 로그인 API
     */
    @Operation(summary = "로그인", description = "아이디와 비밀번호를 로 확인하여 JWT 토큰을 발급합니다.")
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                request.username(), request.password());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // 아이디와 권한(Role) 정보를 추출하여 토큰 생성
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        String token = jwtTokenProvider.createToken(authentication.getName(), role);

        return ResponseEntity.ok(TokenResponse.of(token));
    }
}
