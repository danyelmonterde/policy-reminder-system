package com.example.mypolicyreminder.config;

import com.example.mypolicyreminder.model.Role;
import com.example.mypolicyreminder.model.User;
import com.example.mypolicyreminder.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed a default admin if NO admin account exists at all.
        // This ensures a fresh deployment is always accessible,
        // without overwriting accounts created through the Admin Dashboard.
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ROLE_ADMIN);

        if (!adminExists) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("adminpass"));
            admin.setEmail("admin@mypolicyreminder.com");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setFullName("System Administrator");
            admin.setPhoneNumber("+15550100");
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println(">>> Default admin account created. Please change the password after first login.");
        }
    }
}

