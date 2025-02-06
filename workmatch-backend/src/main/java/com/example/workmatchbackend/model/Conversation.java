package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;
    private String user1Id;
    private String user2Id;
    private List<String> messages;

    public Conversation(String user1Id, String user2Id) {
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.messages = new ArrayList<>();
    }

    // ✅ Getters et Setters
    public String getId() { return id; }
    public String getUser1Id() { return user1Id; }
    public String getUser2Id() { return user2Id; }
    public List<String> getMessages() { return messages; }
    public void addMessage(String message) { this.messages.add(message); }
}
