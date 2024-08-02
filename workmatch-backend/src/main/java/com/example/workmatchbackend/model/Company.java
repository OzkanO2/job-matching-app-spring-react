package com.example.workmatchbackend.model;

import javax.persistence.Entity;

@Entity
public class Company extends User {
    private String verificationCode;

    // Getters and setters
}
