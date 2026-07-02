package com.investwise.auth.service;

import com.investwise.account.service.AccountService;
import com.investwise.auth.dto.AuthRequest;
import com.investwise.auth.dto.AuthResponse;
import com.investwise.auth.dto.RegisterRequest;
import com.investwise.common.exception.DuplicateResourceException;
import com.investwise.config.JwtTokenProvider;
import com.investwise.user.entity.Role;
import com.investwise.user.entity.User;
import com.investwise.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("alex@investwise.app")
                .fullName("Alex Chen")
                .passwordHash("hashed_pwd")
                .role(Role.ROLE_USER)
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .email("alex@investwise.app")
                .fullName("Alex Chen")
                .password("password123")
                .build();

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_pwd");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateToken(any(), any())).thenReturn("mock_jwt_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("alex@investwise.app", response.getUser().getEmail());
        verify(accountService).createDemoAccount(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = RegisterRequest.builder()
                .email("alex@investwise.app")
                .fullName("Alex Chen")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("alex@investwise.app")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
    }

    @Test
    void login_Success() {
        AuthRequest request = AuthRequest.builder()
                .email("alex@investwise.app")
                .password("password123")
                .build();

        when(userRepository.findByEmail("alex@investwise.app")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateToken("alex@investwise.app", 1L)).thenReturn("mock_jwt_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
