package com.example.workmatchbackend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import javax.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.bson.types.ObjectId;
import java.util.ArrayList;

@Document(collection = "jobSearchers") // Assurez-vous que le nom de la collection est correct.
public class JobSearcher {
    @Id
    private ObjectId id;
    private String name;
    private String email;
    private String username;
    private List<Skill> skills = new ArrayList<>();
    private String photoUrl;
    private String resumeUrl;
    private ObjectId userId;
    private boolean remote;
    private int salaryMin;
    private int salaryMax;
    private List<String> locations = new ArrayList<>();
    public JobSearcher() {}

    public JobSearcher(ObjectId userId, String name, String username, String email, List<Skill> skills, int salaryMin, int salaryMax, boolean remote, List<String> locations) {
        this.userId = userId;
        this.name = name;
        this.username = username; // ✅ Ajout du username
        this.email = email;
        this.skills = skills;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.remote = remote;
        this.locations = locations;
    }


    @Transient // Ce champ ne sera PAS stocké en base
    @JsonIgnore
    private double matchingScore;

    @Transient
    @JsonIgnore
    private boolean hasLikedOffer;

    public int getSalaryMin() {
        return salaryMin;
    }
    public boolean isHasLikedOffer() {
        return hasLikedOffer;
    }

    public void setHasLikedOffer(boolean hasLikedOffer) {
        this.hasLikedOffer = hasLikedOffer;
    }
    public int getSalaryMax() {
        return salaryMax;
    }
    public boolean isRemote() {
        return remote;
    }
    public void setRemote(boolean remote) {
        this.remote = remote;
    }

    public ObjectId getUserId() {
        return userId;
    }
    @JsonProperty("matchingScore") // 🔥 S'assure que le score est inclus dans la réponse JSON
    public double getMatchingScore() {
        return matchingScore;
    }


    public void setMatchingScore(double matchingScore) {
        this.matchingScore = matchingScore;
    }

    public void setUserId(ObjectId userId) {
        this.userId = userId;
    }
    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }
}
