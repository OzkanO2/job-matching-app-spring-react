package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "likes")
public class Like {

    @Id
    private String id;

    private String swiperId;  // ✅ ID de celui qui like (Utilisateur ou Entreprise)
    private String swipedId;  // ✅ ID de la cible (Utilisateur ou Offre d'emploi)
    private String offerId;   // ✅ Ajoute cette ligne si elle manque

    // 🔹 Constructeurs
    public Like() {}

    public Like(String swiperId, String swipedId) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
    }

    public Like(String swiperId, String offerId, String swipedId) {  // 🔹 Ajout du constructeur pour l'offre
        this.swiperId = swiperId;
        this.offerId = offerId;
        this.swipedId = swipedId;
    }

    // 🔹 Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSwiperId() { return swiperId; }
    public void setSwiperId(String swiperId) { this.swiperId = swiperId; }

    public String getSwipedId() { return swipedId; }
    public void setSwipedId(String swipedId) { this.swipedId = swipedId; }

    public String getOfferId() { return offerId; }
    public void setOfferId(String offerId) { this.offerId = offerId; }
}
