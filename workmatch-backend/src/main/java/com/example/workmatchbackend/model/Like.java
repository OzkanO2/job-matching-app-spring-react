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
    private boolean isFromRedirection;

    public Like() {
    }

    public Like(String swiperId, String swipedId, String companyId, String offerId, boolean isFromRedirection) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.companyId = companyId;
        this.offerId = offerId;
        this.isFromRedirection = isFromRedirection;
    }

    public Like(String swiperId, String swipedId, String companyId) {
        this(swiperId, swipedId, companyId, "", false);
    }

    public Like(String swiperId, String swipedId) {
        this(swiperId, swipedId, "", "", false);
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

    public String getCompanyId() {
        return companyId;
    }

    public String getOfferId() {
        return offerId;
    }

    public boolean isFromRedirection() {
        return isFromRedirection;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public void setOfferId(String offerId) {
        this.offerId = offerId;
    }

    public void setIsFromRedirection(boolean isFromRedirection) {
        this.isFromRedirection = isFromRedirection;
    }
}
