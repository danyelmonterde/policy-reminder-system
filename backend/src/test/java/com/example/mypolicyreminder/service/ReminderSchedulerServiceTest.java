package com.example.mypolicyreminder.service;

import com.example.mypolicyreminder.model.Policy;
import com.example.mypolicyreminder.model.Role;
import com.example.mypolicyreminder.model.User;
import com.example.mypolicyreminder.repository.PolicyRepository;
import com.example.mypolicyreminder.repository.ReminderLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderSchedulerServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private ReminderLogRepository reminderLogRepository;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private ReminderSchedulerService reminderSchedulerService;

    private Policy policy;

    @BeforeEach
    void setUp() {
        User client = new User();
        client.setUsername("testclient");
        client.setEmail("client@example.com");
        client.setRole(Role.ROLE_USER);

        policy = new Policy();
        policy.setId(1L);
        policy.setPolicyNumber("POL-TEST");
        policy.setPolicyName("Test Policy");
        policy.setClient(client);
        policy.setPremiumAmount(200.0);
        policy.setCoverageAmount(10000.0);
        policy.setStartDate(LocalDate.now().minusMonths(1));
        policy.setDueDate(LocalDate.now().plusDays(30)); // 30 days threshold matches message
        policy.setStatus("ACTIVE");
    }

    @Test
    void processReminders_ShouldSendEmailAndLogSuccess() {
        when(policyRepository.findAll()).thenReturn(List.of(policy));
        when(reminderLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // When reminder check runs
        var logs = reminderSchedulerService.triggerManualReminderCheck();

        // Then email must be dispatched
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
        verify(reminderLogRepository, times(1)).save(any());

        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getStatus()).isEqualTo("SUCCESS");
        assertThat(logs.get(0).getMessage()).contains("due in 30 days");
    }
}
