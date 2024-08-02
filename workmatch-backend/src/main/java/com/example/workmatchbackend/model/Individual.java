package com.example.workmatchbackend.model;

import javax.persistence.Entity;
import java.util.List;

@Entity
public class Individual extends User {
    private int age;
    private List<String> photos;

    // Getters and setters
}
