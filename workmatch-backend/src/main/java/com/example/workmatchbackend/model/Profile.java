package com.example.workmatchbackend.model;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Profile {
    @Id
    private Long userId;
    private String photo;
    private String tag;

    // Getters and setters
}
