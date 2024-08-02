package com.example.workmatchbackend.model;

import javax.persistence.*;
import java.util.List;

@Entity
public class JobOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String info;
    private List<String> competences;

    // Getters and setters
}
