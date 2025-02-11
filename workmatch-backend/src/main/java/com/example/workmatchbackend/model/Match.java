package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "matches")
public class Match {

    @Id
    private String id;
    private String individualUserId;
    private String companyUserId;
    private String jobOfferId;

    public Match(String individualUserId, String companyUserId, String jobOfferId) {
        this.individualUserId = individualUserId;
        this.companyUserId = companyUserId;
        this.jobOfferId = jobOfferId;
    }

    public Match(String individualUserId, String companyUserId) {
        this.individualUserId = individualUserId;
        this.companyUserId = companyUserId;
        this.jobOfferId = null;
    }

    public String getId() {
        return id;
    }

    public String getIndividualUserId() {
        return individualUserId;
    }

    public String getCompanyUserId() {
        return companyUserId;
    }

    public String getJobOfferId() {
        return jobOfferId;
    }
}
