package com.example.mypolicyreminder.service;

import com.example.mypolicyreminder.model.Policy;
import com.example.mypolicyreminder.model.ReminderLog;
import com.example.mypolicyreminder.model.ReminderLogDTO;
import com.example.mypolicyreminder.model.User;
import com.example.mypolicyreminder.repository.PolicyRepository;
import com.example.mypolicyreminder.repository.ReminderLogRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderSchedulerService {

    private final PolicyRepository policyRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final JavaMailSender mailSender;

    public ReminderSchedulerService(
            PolicyRepository policyRepository, 
            ReminderLogRepository reminderLogRepository,
            JavaMailSender mailSender) {
        this.policyRepository = policyRepository;
        this.reminderLogRepository = reminderLogRepository;
        this.mailSender = mailSender;
    }

    // Run every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void runDailyReminderCheck() {
        System.out.println("Running scheduled daily policy reminder check at: " + LocalDateTime.now());
        processReminders();
    }

    public List<ReminderLogDTO> triggerManualReminderCheck() {
        System.out.println("Manually triggering policy reminder check at: " + LocalDateTime.now());
        return processReminders();
    }

    public List<ReminderLogDTO> getAllReminderLogs() {
        return reminderLogRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReminderLogDTO> getReminderLogsForClient(String username) {
        return reminderLogRepository.findAll().stream()
                .filter(log -> log.getPolicy().getClient().getUsername().equals(username))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private List<ReminderLogDTO> processReminders() {
        List<Policy> activePolicies = policyRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());

        List<ReminderLog> createdLogs = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Policy policy : activePolicies) {
            LocalDate dueDate = policy.getDueDate();
            if (dueDate == null) continue;

            long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);
            String message = null;

            if (daysUntilDue == 30) {
                message = String.format("Friendly Reminder: Your policy %s (%s) is due in 30 days on %s. Premium amount due: $%.2f.",
                        policy.getPolicyName(), policy.getPolicyNumber(), dueDate, policy.getPremiumAmount());
            } else if (daysUntilDue == 7) {
                message = String.format("Urgent Notice: Your policy %s (%s) is due in 7 days on %s. Premium amount due: $%.2f.",
                        policy.getPolicyName(), policy.getPolicyNumber(), dueDate, policy.getPremiumAmount());
            } else if (daysUntilDue == 1) {
                message = String.format("Final Notice: Your policy %s (%s) is due tomorrow on %s. Please renew to avoid coverage lapse.",
                        policy.getPolicyName(), policy.getPolicyNumber(), dueDate);
            } else if (daysUntilDue == 0) {
                message = String.format("Expiration Warning: Your policy %s (%s) is due TODAY. Action required immediately.",
                        policy.getPolicyName(), policy.getPolicyNumber());
            } else if (daysUntilDue < 0 && daysUntilDue >= -5) {
                // Remind past due up to 5 days
                message = String.format("Lapsed Notice: Your policy %s (%s) was due on %s and is currently overdue. Please contact support.",
                        policy.getPolicyName(), policy.getPolicyNumber(), dueDate);
            }

            // For manual demonstration / local development, we also trigger if the user forces check
            // and we send a custom log if it's within 30 days and no log has been sent in the last 24h
            if (message == null && daysUntilDue >= 0 && daysUntilDue <= 30) {
                message = String.format("Upcoming Due Date: Your policy %s (%s) is due in %d days on %s.",
                        policy.getPolicyName(), policy.getPolicyNumber(), daysUntilDue, dueDate);
            }

            if (message != null) {
                User client = policy.getClient();
                
                // Try to send actual email
                boolean emailSent = sendEmail(
                        client.getEmail(),
                        "Policy Renewal Alert: " + policy.getPolicyName(),
                        message
                );

                ReminderLog log = new ReminderLog();
                log.setPolicy(policy);
                log.setSentAt(LocalDateTime.now());
                log.setRecipientEmail(client.getEmail());
                log.setStatus(emailSent ? "SUCCESS" : "FAILED");
                log.setMessage(message + (emailSent ? "" : " [Email delivery failed]"));
                createdLogs.add(reminderLogRepository.save(log));
            }
        }

        return createdLogs.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private boolean sendEmail(String recipientEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("no-reply@mypolicyreminder.com");
            mailSender.send(message);
            System.out.println("Actual email successfully dispatched to: " + recipientEmail);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send actual email to: " + recipientEmail + ". Error: " + e.getMessage());
            return false;
        }
    }

    private ReminderLogDTO toDTO(ReminderLog log) {
        ReminderLogDTO dto = new ReminderLogDTO();
        try {
            org.apache.commons.beanutils.BeanUtils.copyProperties(dto, log);
        } catch (Exception e) {
            throw new RuntimeException("Error mapping ReminderLog to DTO", e);
        }
        if (log.getPolicy() != null) {
            dto.setPolicyNumber(log.getPolicy().getPolicyNumber());
            dto.setPolicyName(log.getPolicy().getPolicyName());
        }
        return dto;
    }
}
