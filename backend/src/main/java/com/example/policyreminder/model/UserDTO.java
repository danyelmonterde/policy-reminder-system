package com.example.policyreminder.model;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role; // ROLE_ADMIN or ROLE_USER
    private String fullName;
    private String phoneNumber;
    private boolean enabled;
    private String password; // optional, used on create/update

    public UserDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
