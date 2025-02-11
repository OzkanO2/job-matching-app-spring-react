package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "likes")
public class Like {

    @Id
    private String id;
    private String swiperId;
    private String swipedId;
    private String companyId;

    private String offerId;

    public String getOfferId() {
        return offerId;
    }
    public Like() {}
    public void setOfferId(String offerId) {
        this.offerId = offerId;
    }
    public Like(String swiperId, String swipedId, String companyId) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.companyId = companyId;
    }

    public Like(String swiperId, String swipedId) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.companyId = "";
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
