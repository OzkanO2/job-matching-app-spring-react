package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    private String swiperId;
    private String swipedId;
    private String offerId;

    public Match() {}

    public Match(String swiperId, String swipedId, String offerId) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.offerId = offerId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSwiperId() {
        return swiperId;
    }

    public void setSwiperId(String swiperId) {
        this.swiperId = swiperId;
    }

    public String getSwipedId() {
        return swipedId;
    }

    public void setSwipedId(String swipedId) {
        this.swipedId = swipedId;
    }

    public String getOfferId() {
        return offerId;
    }

    public void setOfferId(String offerId) {
        this.offerId = offerId;
    }
}
