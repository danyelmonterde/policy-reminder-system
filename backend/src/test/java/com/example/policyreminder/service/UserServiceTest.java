package com.example.policyreminder.service;

import com.example.policyreminder.model.Role;
import com.example.policyreminder.model.User;
import com.example.policyreminder.model.UserDTO;
import com.example.policyreminder.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserDTO userDTO;
    private User user;

    @BeforeEach
    void setUp() {
        userDTO = new UserDTO();
        userDTO.setUsername("testuser");
        userDTO.setEmail("test@example.com");
        userDTO.setPassword("password123");
        userDTO.setFullName("Test User");
        userDTO.setRole("ROLE_USER");

        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setFullName("Test User");
        user.setRole(Role.ROLE_USER);
        user.setEnabled(true);
    }

    @Test
    void createUser_ShouldSaveAndReturnUser() {
        when(userRepository.findByUsername(userDTO.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(userDTO.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(userDTO.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDTO created = userService.createUser(userDTO);

        assertThat(created).isNotNull();
        assertThat(created.getUsername()).isEqualTo("testuser");
        assertThat(created.getEmail()).isEqualTo("test@example.com");
        assertThat(created.getFullName()).isEqualTo("Test User");
        assertThat(created.getRole()).isEqualTo("ROLE_USER");
        assertThat(created.getPassword()).isNull(); // Should hide password

        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_ShouldThrowException_WhenUsernameExists() {
        when(userRepository.findByUsername(userDTO.getUsername())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.createUser(userDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already exists");

        verify(userRepository, never()).save(any(User.class));
    }
}
