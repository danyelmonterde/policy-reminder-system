package com.example.mypolicyreminder.service;

import com.example.mypolicyreminder.model.Policy;
import com.example.mypolicyreminder.model.PolicyDTO;
import com.example.mypolicyreminder.model.User;
import com.example.mypolicyreminder.repository.PolicyRepository;
import com.example.mypolicyreminder.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;

    public PolicyService(PolicyRepository policyRepository, UserRepository userRepository) {
        this.policyRepository = policyRepository;
        this.userRepository = userRepository;
    }

    public List<PolicyDTO> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PolicyDTO> getPoliciesByClientUsername(String username) {
        User client = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        return policyRepository.findByClient(client).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PolicyDTO getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with id: " + id));
        return toDTO(policy);
    }

    public PolicyDTO createPolicy(PolicyDTO dto) {
        if (policyRepository.findByPolicyNumber(dto.getPolicyNumber()).isPresent()) {
            throw new IllegalArgumentException("Policy number already exists: " + dto.getPolicyNumber());
        }

        User client = userRepository.findByUsername(dto.getClientUsername())
                .orElseThrow(() -> new IllegalArgumentException("Client not found with username: " + dto.getClientUsername()));

        Policy policy = new Policy();
        try {
            org.apache.commons.beanutils.BeanUtils.copyProperties(policy, dto);
        } catch (Exception e) {
            throw new RuntimeException("Error copying policy properties", e);
        }
        policy.setClient(client);
        policy.setStatus("ACTIVE");

        Policy saved = policyRepository.save(policy);
        return toDTO(saved);
    }

    public PolicyDTO updatePolicy(Long id, PolicyDTO dto) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with id: " + id));

        policy.setPolicyName(dto.getPolicyName());
        policy.setPremiumAmount(dto.getPremiumAmount());
        policy.setCoverageAmount(dto.getCoverageAmount());
        policy.setStartDate(dto.getStartDate());
        policy.setDueDate(dto.getDueDate());
        policy.setStatus(dto.getStatus());

        if (dto.getClientUsername() != null && !dto.getClientUsername().equals(policy.getClient().getUsername())) {
            User client = userRepository.findByUsername(dto.getClientUsername())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found with username: " + dto.getClientUsername()));
            policy.setClient(client);
        }

        Policy saved = policyRepository.save(policy);
        return toDTO(saved);
    }

    public void deletePolicy(Long id) {
        if (!policyRepository.existsById(id)) {
            throw new IllegalArgumentException("Policy not found with id: " + id);
        }
        policyRepository.deleteById(id);
    }

    private PolicyDTO toDTO(Policy policy) {
        PolicyDTO dto = new PolicyDTO();
        try {
            // Using Apache Commons BeanUtils as requested
            org.apache.commons.beanutils.BeanUtils.copyProperties(dto, policy);
        } catch (Exception e) {
            throw new RuntimeException("Error mapping Policy to DTO", e);
        }
        if (policy.getClient() != null) {
            dto.setClientUsername(policy.getClient().getUsername());
            dto.setClientEmail(policy.getClient().getEmail());
        }
        return dto;
    }
}
