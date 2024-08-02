package com.example.workmatchbackend.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User sender;

    private String content;
    private LocalDateTime timestamp;

    // Getters and setters
}
