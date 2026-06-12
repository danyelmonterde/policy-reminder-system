package com.example.mypolicyreminder.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // No initial seed data — database starts empty.
        // Use the Admin Dashboard to create users and policies.
    }
}

