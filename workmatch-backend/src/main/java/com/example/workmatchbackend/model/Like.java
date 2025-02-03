package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "likes")
public class Like {

    @Id
    private String id;
    private String swiperId;
    private String swipedId;
    private String companyId; // ✅ Ajout du champ manquant
    // 🔥 Ajoutez ce champ s'il manque
    private String offerId;
    // ✅ Getters et Setters
    public String getOfferId() {
        return offerId;
    }

    public void setOfferId(String offerId) {
        this.offerId = offerId;
    }
    public Like(String swiperId, String swipedId, String companyId) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.companyId = companyId;
    }
    // ✅ Constructeur sans companyId
    public Like(String swiperId, String swipedId) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.companyId = ""; // ✅ Default à une chaîne vide pour éviter les erreurs
    }
    public String getId() {
        return id;
    }

    public String getSwiperId() {
        return swiperId;
    }

    public String getSwipedId() {
        return swipedId;
    }

    public String getCompanyId() { // ✅ Ajout du getter
        return companyId;
    }

    public void setCompanyId(String companyId) { // ✅ Ajout du setter
        this.companyId = companyId;
    }
}
