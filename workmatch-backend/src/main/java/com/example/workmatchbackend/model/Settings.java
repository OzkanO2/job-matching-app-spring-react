package com.example.workmatchbackend.model;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Settings {
    @Id
    private Long userId;

    private int distanceFilter;
    private boolean notificationPermission;

    // Getters and setters
}
