package com.example.mypolicyreminder.config;

import com.example.mypolicyreminder.model.Role;
import com.example.mypolicyreminder.model.User;
import com.example.mypolicyreminder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Injected from environment variables (set via docker-compose → AWS Secrets Manager)
    // No credentials are stored in source code.
    @Value("${ADMIN_USERNAME:admin}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only create a default admin if NO admin account exists.
        // This ensures a fresh deployment is always accessible
        // without overwriting accounts created via the Admin Dashboard.
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ROLE_ADMIN);

        if (!adminExists) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setEmail("admin@mypolicyreminder.com");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setFullName("System Administrator");
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println(">>> Default admin account created (username: " + adminUsername + "). Change the password after first login.");
        }
    }
}

