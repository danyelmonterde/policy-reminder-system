package com.example.mypolicyreminder.controller;

import com.example.mypolicyreminder.model.PolicyDTO;
import com.example.mypolicyreminder.model.ReminderLogDTO;
import com.example.mypolicyreminder.model.UserDTO;
import com.example.mypolicyreminder.service.PolicyService;
import com.example.mypolicyreminder.service.ReminderSchedulerService;
import com.example.mypolicyreminder.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class ClientController {

    private final UserService userService;
    private final PolicyService policyService;
    private final ReminderSchedulerService reminderSchedulerService;

    public ClientController(UserService userService, PolicyService policyService, ReminderSchedulerService reminderSchedulerService) {
        this.userService = userService;
        this.policyService = policyService;
        this.reminderSchedulerService = reminderSchedulerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(Authentication authentication, @Valid @RequestBody UserDTO userDTO) {
        String username = authentication.getName();
        UserDTO existing = userService.getUserByUsername(username);
        // Make sure user is updating their own profile
        return ResponseEntity.ok(userService.updateUser(existing.getId(), userDTO));
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDTO>> getPolicies(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(policyService.getPoliciesByClientUsername(username));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ReminderLogDTO>> getLogs(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(reminderSchedulerService.getReminderLogsForClient(username));
    }
}
