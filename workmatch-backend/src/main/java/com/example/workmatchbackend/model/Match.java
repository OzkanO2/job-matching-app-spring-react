package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    private String userId;
    private String jobId;
    private JobOffer jobOffer;
    private List<User> matchedUsers;
    private String companyId;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
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
    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }
}
