package com.example.workmatchbackend.model;

import javax.persistence.*;
import java.util.List;

@Entity
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private JobOffer jobOffer;

    @ManyToMany
    private List<User> matchedUsers;

    // Getters and setters
}
