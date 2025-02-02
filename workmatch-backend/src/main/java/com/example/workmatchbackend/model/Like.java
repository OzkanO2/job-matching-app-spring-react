package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "likes")
public class Like {
    @Id
    private String id;
    private String userId;  // L'utilisateur qui swipe
    private String swipedUserId; // Si on swipe un autre utilisateur (job searcher)
    private String offerId; // Si on swipe une offre d'emploi
    private String companyId; // Si l'offre appartient à une company

    public Like() {}

    // 🔹 Constructeur pour un Company qui like un Individual
    public Like(String userId, String swipedUserId) {
        this.userId = userId;
        this.swipedUserId = swipedUserId;
    }

    // 🔹 Constructeur pour un Individual qui like une offre d'emploi
    public Like(String userId, String offerId, String companyId) {
        this.userId = userId;
        this.offerId = offerId;
        this.companyId = companyId;
    }

    // ✅ Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSwipedUserId() { return swipedUserId; }
    public void setSwipedUserId(String swipedUserId) { this.swipedUserId = swipedUserId; }

    public String getOfferId() { return offerId; }
    public void setOfferId(String offerId) { this.offerId = offerId; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
}
