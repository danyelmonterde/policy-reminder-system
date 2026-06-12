package com.example.mypolicyreminder.repository;

import com.example.mypolicyreminder.model.Policy;
import com.example.mypolicyreminder.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByClient(User client);
    List<Policy> findByDueDateBetween(LocalDate start, LocalDate end);
    Optional<Policy> findByPolicyNumber(String policyNumber);
}
