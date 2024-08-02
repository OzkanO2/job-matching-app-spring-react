package com.example.workmatchbackend.model;

import javax.persistence.*;
import java.util.List;

@Entity
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    private List<User> participants;

    @OneToMany
    private List<Message> messages;

    // Getters and setters
}
