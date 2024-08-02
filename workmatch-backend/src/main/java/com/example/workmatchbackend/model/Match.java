package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    private JobOffer jobOffer;
    private List<User> matchedUsers;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public JobOffer getJobOffer() {
        return jobOffer;
    }

    public void setJobOffer(JobOffer jobOffer) {
        this.jobOffer = jobOffer;
    }

    public List<User> getMatchedUsers() {
        return matchedUsers;
    }

    public void setMatchedUsers(List<User> matchedUsers) {
        this.matchedUsers = matchedUsers;
    }
}
