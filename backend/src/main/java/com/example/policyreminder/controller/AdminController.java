package com.example.policyreminder.controller;

import com.example.policyreminder.model.PolicyDTO;
import com.example.policyreminder.model.ReminderLogDTO;
import com.example.policyreminder.model.UserDTO;
import com.example.policyreminder.service.PolicyService;
import com.example.policyreminder.service.ReminderSchedulerService;
import com.example.policyreminder.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PolicyService policyService;
    private final ReminderSchedulerService reminderSchedulerService;

    public AdminController(UserService userService, PolicyService policyService, ReminderSchedulerService reminderSchedulerService) {
        this.userService = userService;
        this.policyService = policyService;
        this.reminderSchedulerService = reminderSchedulerService;
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/clients")
    public ResponseEntity<List<UserDTO>> getAllClients() {
        return ResponseEntity.ok(userService.getAllClients());
    }

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.createUser(userDTO));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.getOrDefault("enabled", true);
        userService.setUserStatus(id, enabled);
        return ResponseEntity.ok().build();
    }

    // Policy Management
    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDTO>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @PostMapping("/policies")
    public ResponseEntity<PolicyDTO> createPolicy(@Valid @RequestBody PolicyDTO policyDTO) {
        return ResponseEntity.ok(policyService.createPolicy(policyDTO));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<PolicyDTO> updatePolicy(@PathVariable Long id, @Valid @RequestBody PolicyDTO policyDTO) {
        return ResponseEntity.ok(policyService.updatePolicy(id, policyDTO));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok().build();
    }

    // System Monitoring & Logs
    @GetMapping("/logs")
    public ResponseEntity<List<ReminderLogDTO>> getAllReminderLogs() {
        return ResponseEntity.ok(reminderSchedulerService.getAllReminderLogs());
    }

    @PostMapping("/reminders/trigger")
    public ResponseEntity<List<ReminderLogDTO>> triggerReminders() {
        return ResponseEntity.ok(reminderSchedulerService.triggerManualReminderCheck());
    }
}
