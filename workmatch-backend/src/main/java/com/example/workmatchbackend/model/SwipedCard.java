package com.example.workmatchbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "swipedCard") // Collection MongoDB
public class SwipedCard {

    @Id
    private String id;
    private String swiperId;
    private String swipedId;
    private String direction;

    public SwipedCard(String swiperId, String swipedId, String direction) {
        this.swiperId = swiperId;
        this.swipedId = swipedId;
        this.direction = direction;
    }

    public String getSwiperId() { return swiperId; }
    public String getSwipedId() { return swipedId; }
    public String getDirection() { return direction; }

    public void setSwiperId(String swiperId) { this.swiperId = swiperId; }
    public void setSwipedId(String swipedId) { this.swipedId = swipedId; }
    public void setDirection(String direction) { this.direction = direction; }
}
