package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    private String individualUserId; // ✅ Utilisateur individuel
    private String companyUserId;    // ✅ Entreprise
    private String jobOfferId;       // ✅ Offre d'emploi associée

    // ✅ Constructeur
    public Match(String individualUserId, String companyUserId, String jobOfferId) {
        this.individualUserId = individualUserId;
        this.companyUserId = companyUserId;
        this.jobOfferId = jobOfferId;
    }

    // ✅ Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIndividualUserId() { return individualUserId; }
    public void setIndividualUserId(String individualUserId) { this.individualUserId = individualUserId; }

    public String getCompanyUserId() { return companyUserId; }
    public void setCompanyUserId(String companyUserId) { this.companyUserId = companyUserId; }

    public String getJobOfferId() { return jobOfferId; }
    public void setJobOfferId(String jobOfferId) { this.jobOfferId = jobOfferId; }
}
