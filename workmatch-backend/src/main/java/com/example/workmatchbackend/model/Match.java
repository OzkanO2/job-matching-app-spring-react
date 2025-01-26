package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    private String userId1; // Premier utilisateur
    private String userId2; // Deuxième utilisateur
    private LocalDateTime matchDate;

    public Match(String userId1, String userId2) {
        this.userId1 = userId1;
        this.userId2 = userId2;
    }
    // Getters and setters
    public String getUserId1() {
        return userId1;
    }

    public void setUserId1(String userId1) {
        this.userId1 = userId1;
    }

    public String getUserId2() {
        return userId2;
    }

    public void setUserId2(String userId2) {
        this.userId2 = userId2;
    }
    // Getters and Setters
}
