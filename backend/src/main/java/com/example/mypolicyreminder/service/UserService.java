package com.example.mypolicyreminder.service;

import com.example.mypolicyreminder.model.Role;
import com.example.mypolicyreminder.model.User;
import com.example.mypolicyreminder.model.UserDTO;
import com.example.mypolicyreminder.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    static {
        org.apache.commons.beanutils.ConvertUtils.register(new org.apache.commons.beanutils.Converter() {
            @SuppressWarnings("unchecked")
            @Override
            public <T> T convert(Class<T> type, Object value) {
                if (value == null) return null;
                if (value instanceof Role) return (T) value;
                try {
                    return (T) Role.valueOf(value.toString());
                } catch (IllegalArgumentException e) {
                    return null;
                }
            }
        }, Role.class);
    }

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getAllClients() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_USER)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return toDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        return toDTO(user);
    }

    public UserDTO createUser(UserDTO dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + dto.getUsername());
        }
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
        }

        // Map manually to avoid Apache Commons BeanUtils enum type mismatch
        // (BeanUtils cannot assign String -> Role enum via reflection)
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        } else {
            throw new IllegalArgumentException("Password is required for user creation");
        }

        user.setRole(dto.getRole() != null ? Role.valueOf(dto.getRole()) : Role.ROLE_USER);
        user.setEnabled(true);

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Update fields if changed and don't clash with others
        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
            }
            user.setEmail(dto.getEmail());
        }

        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getRole() != null) {
            user.setRole(Role.valueOf(dto.getRole()));
        }

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    public void setUserStatus(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        try {
            // Using Apache Commons BeanUtils as requested by architecture
            org.apache.commons.beanutils.BeanUtils.copyProperties(dto, user);
        } catch (Exception e) {
            throw new RuntimeException("Error mapping User to DTO", e);
        }
        dto.setRole(user.getRole().name());
        dto.setPassword(null); // Secure password field in responses
        return dto;
    }
}
