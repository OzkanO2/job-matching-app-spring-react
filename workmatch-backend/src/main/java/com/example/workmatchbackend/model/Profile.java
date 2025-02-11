package com.example.workmatchbackend.model;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Profile {

    @Id
    private String id;
    private String photo;
    private String tag;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
}
