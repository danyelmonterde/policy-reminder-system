package com.example.mypolicyreminder.repository;

import com.example.mypolicyreminder.model.ReminderLog;
import com.example.mypolicyreminder.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderLogRepository extends JpaRepository<ReminderLog, Long> {
    List<ReminderLog> findByPolicyClient(User client);
}
