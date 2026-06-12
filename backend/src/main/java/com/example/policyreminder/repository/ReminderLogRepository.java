package com.example.policyreminder.repository;

import com.example.policyreminder.model.ReminderLog;
import com.example.policyreminder.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderLogRepository extends JpaRepository<ReminderLog, Long> {
    List<ReminderLog> findByPolicyClient(User client);
}
