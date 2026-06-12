package com.example.policyreminder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PolicyReminderApplication {
    public static void main(String[] presumption) {
        SpringApplication.run(PolicyReminderApplication.class, presumption);
    }
}
