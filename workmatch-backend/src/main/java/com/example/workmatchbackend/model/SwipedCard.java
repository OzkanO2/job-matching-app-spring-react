package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "swipedCard")
public class SwipedCard {

    @Id
    private String id;
    private String swiperId;
    private String swipedId;
    private String direction;
    private String jobOfferId;
    private boolean isFromRedirection;

    public SwipedCard(String swiperId, String swipedId, String direction, String jobOfferId, boolean isFromRedirection) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.direction = direction;
        this.jobOfferId = jobOfferId;
        this.isFromRedirection = isFromRedirection;
    }

    public String getSwiperId() { return swiperId; }
    public String getSwipedId() { return swipedId; }
    public String getDirection() { return direction; }
    public String getJobOfferId() { return jobOfferId; }
    public boolean getIsFromRedirection() { return isFromRedirection; }
    public boolean isFromRedirection() {
        return isFromRedirection;
    }
    public void setSwiperId(String swiperId) { this.swiperId = swiperId; }
    public void setSwipedId(String swipedId) { this.swipedId = swipedId; }
    public void setDirection(String direction) { this.direction = direction; }
    public void setJobOfferId(String jobOfferId) { this.jobOfferId = jobOfferId; }
    public void setIsFromRedirection(boolean isFromRedirection) { this.isFromRedirection = isFromRedirection; }
    public void setFromRedirection(boolean fromRedirection) {
        isFromRedirection = fromRedirection;
    }
}
