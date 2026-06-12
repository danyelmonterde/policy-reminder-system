package com.example.mypolicyreminder.config;

import com.example.mypolicyreminder.model.Policy;
import com.example.mypolicyreminder.model.Role;
import com.example.mypolicyreminder.model.User;
import com.example.mypolicyreminder.repository.PolicyRepository;
import com.example.mypolicyreminder.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PolicyRepository policyRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.policyRepository = policyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed Admin User
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("adminpass"));
            admin.setEmail("admin@example.com");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setFullName("System Administrator");
            admin.setPhoneNumber("+15550100");
            admin.setEnabled(true);
            userRepository.save(admin);
        }

        // Seed Client User
        User client = null;
        if (userRepository.findByUsername("client").isEmpty()) {
            client = new User();
            client.setUsername("client");
            client.setPassword(passwordEncoder.encode("clientpass"));
            client.setEmail("client@example.com");
            client.setRole(Role.ROLE_USER);
            client.setFullName("John Client");
            client.setPhoneNumber("+15550200");
            client.setEnabled(true);
            client = userRepository.save(client);
        } else {
            client = userRepository.findByUsername("client").get();
        }

        // Seed Sample Policies
        if (policyRepository.findByPolicyNumber("POL-10001").isEmpty()) {
            Policy policy1 = new Policy();
            policy1.setPolicyNumber("POL-10001");
            policy1.setPolicyName("Premium Health Insurance");
            policy1.setClient(client);
            policy1.setPremiumAmount(150.0);
            policy1.setCoverageAmount(50000.0);
            policy1.setStartDate(LocalDate.now().minusMonths(6));
            policy1.setDueDate(LocalDate.now().plusDays(30)); // 30 days due
            policy1.setStatus("ACTIVE");
            policyRepository.save(policy1);
        }

        if (policyRepository.findByPolicyNumber("POL-10002").isEmpty()) {
            Policy policy2 = new Policy();
            policy2.setPolicyNumber("POL-10002");
            policy2.setPolicyName("Comprehensive Car Insurance");
            policy2.setClient(client);
            policy2.setPremiumAmount(100.0);
            policy2.setCoverageAmount(20000.0);
            policy2.setStartDate(LocalDate.now().minusMonths(5));
            policy2.setDueDate(LocalDate.now().plusDays(7)); // 7 days due
            policy2.setStatus("ACTIVE");
            policyRepository.save(policy2);
        }
    }
}
